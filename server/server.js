"use strict";
/* Overload server: serves the app and provides accounts plus cross-device sync.
   No dependencies; uses Node's built-in HTTP server and SQLite (Node 22.13+). */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const { DatabaseSync } = require("node:sqlite");
const { normalize, merge, emptyDoc } = require("../public/merge.js");

const scrypt = promisify(crypto.scrypt);
const SESSION_DAYS = 90;
const COOKIE = "ovl_session";
const MAX_BODY = 2 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".webmanifest": "application/manifest+json", ".json": "application/json", ".png": "image/png",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
};

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  "manifest-src 'self'",
  "worker-src 'self'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/* ---------- Passwords & tokens ---------- */
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("base64")}$${key.toString("base64")}`;
}
async function verifyPassword(password, stored) {
  const [alg, N, r, p, salt, hash] = stored.split("$");
  if (alg !== "scrypt") return false;
  const expected = Buffer.from(hash, "base64");
  const key = await scrypt(password, Buffer.from(salt, "base64"), expected.length, { N: +N, r: +r, p: +p });
  return crypto.timingSafeEqual(key, expected);
}
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

/* ---------- Rate limiting ---------- */
function limiter(max, windowMs) {
  const hits = new Map();
  return {
    take(key) {
      const now = Date.now();
      const h = hits.get(key);
      if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return true; }
      h.n += 1;
      return h.n <= max;
    },
    sweep() { const now = Date.now(); for (const [k, h] of hits) if (h.reset < now) hits.delete(k); },
  };
}

/* ---------- Database ---------- */
function openDb(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "overload.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      pass_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS docs (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      doc TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  return db;
}

/* ---------- Server ---------- */
function createServer(opts = {}) {
  const dataDir = opts.dataDir || process.env.DATA_DIR || path.join(__dirname, "..", "data");
  const publicDir = path.resolve(opts.publicDir || path.join(__dirname, "..", "public"));
  const secureCookies = opts.secureCookies ?? process.env.COOKIE_SECURE === "1";
  const trustProxy = opts.trustProxy ?? process.env.TRUST_PROXY === "1";
  const db = openDb(dataDir);
  const loginLimit = limiter(10, 15 * 60 * 1000);
  const signupLimit = limiter(20, 60 * 60 * 1000);
  // A real hash to compare against when the email doesn't exist, so timing doesn't reveal accounts.
  const dummyHash = hashPassword(crypto.randomBytes(16).toString("hex"));

  const q = {
    userByEmail: db.prepare("SELECT id, email, pass_hash FROM users WHERE email = ?"),
    insertUser: db.prepare("INSERT INTO users (email, pass_hash, created_at) VALUES (?, ?, ?)"),
    insertToken: db.prepare("INSERT INTO auth_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)"),
    userByToken: db.prepare(`SELECT u.id, u.email, u.pass_hash FROM auth_tokens t JOIN users u ON u.id = t.user_id
                             WHERE t.token_hash = ? AND t.expires_at > ?`),
    deleteToken: db.prepare("DELETE FROM auth_tokens WHERE token_hash = ?"),
    deleteExpired: db.prepare("DELETE FROM auth_tokens WHERE expires_at <= ?"),
    getDoc: db.prepare("SELECT doc FROM docs WHERE user_id = ?"),
    putDoc: db.prepare(`INSERT INTO docs (user_id, doc, updated_at) VALUES (?, ?, ?)
                        ON CONFLICT(user_id) DO UPDATE SET doc = excluded.doc, updated_at = excluded.updated_at`),
    deleteUser: db.prepare("DELETE FROM users WHERE id = ?"),
  };

  const sweeper = setInterval(() => {
    q.deleteExpired.run(Date.now());
    loginLimit.sweep();
    signupLimit.sweep();
  }, 60 * 60 * 1000);
  sweeper.unref();

  function send(res, status, body, headers = {}) {
    const data = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    });
    res.end(data);
  }
  const fail = (res, status, error, headers) => send(res, status, { error }, headers);

  function clientIp(req) {
    if (trustProxy && req.headers["x-forwarded-for"]) return String(req.headers["x-forwarded-for"]).split(",")[0].trim();
    return req.socket.remoteAddress || "";
  }

  function parseCookies(req) {
    const out = {};
    String(req.headers.cookie || "").split(";").forEach((part) => {
      const i = part.indexOf("=");
      if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    });
    return out;
  }

  function sessionCookie(token, maxAge) {
    return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureCookies ? "; Secure" : ""}`;
  }

  function startSession(userId) {
    const token = crypto.randomBytes(32).toString("base64url");
    q.insertToken.run(sha256(token), userId, Date.now() + SESSION_DAYS * 86400000);
    return sessionCookie(token, SESSION_DAYS * 86400);
  }

  function currentUser(req) {
    const token = parseCookies(req)[COOKIE];
    if (!token) return null;
    return q.userByToken.get(sha256(token), Date.now()) || null;
  }

  function readJson(req) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on("data", (c) => {
        size += c.length;
        if (size > MAX_BODY) { reject(Object.assign(new Error("Request is too large."), { status: 413 })); req.destroy(); return; }
        chunks.push(c);
      });
      req.on("end", () => {
        try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); }
        catch (e) { reject(Object.assign(new Error("Request body must be valid JSON."), { status: 400 })); }
      });
      req.on("error", reject);
    });
  }

  // Cookie-authenticated writes must come from this site as JSON, which blocks cross-site form posts.
  function sameOrigin(req) {
    const ct = String(req.headers["content-type"] || "");
    if (!ct.startsWith("application/json")) return false;
    const origin = req.headers.origin;
    if (!origin) return true;
    try { return new URL(origin).host === req.headers.host; } catch (e) { return false; }
  }

  function readCredentials(body) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    return { email, password };
  }

  const loadDoc = (userId) => {
    const row = q.getDoc.get(userId);
    return row ? JSON.parse(row.doc) : emptyDoc();
  };

  async function api(req, res, route) {
    const method = req.method;
    if (route === "health" && method === "GET") return send(res, 200, { ok: true });
    if (method !== "GET" && !sameOrigin(req)) return fail(res, 403, "Request blocked: it must come from the app as JSON.");

    if (route === "signup" && method === "POST") {
      if (!signupLimit.take(clientIp(req))) return fail(res, 429, "Too many sign-ups from this network. Try again later.");
      const { email, password } = readCredentials(await readJson(req));
      if (!EMAIL_RE.test(email) || email.length > 254) return fail(res, 400, "Enter a valid email address.");
      if (password.length < 8 || password.length > 200) return fail(res, 400, "Use a password of at least 8 characters.");
      if (q.userByEmail.get(email)) return fail(res, 409, "An account with this email already exists. Sign in instead.");
      const hash = await hashPassword(password);
      let id;
      try { id = Number(q.insertUser.run(email, hash, Date.now()).lastInsertRowid); }
      catch (e) { return fail(res, 409, "An account with this email already exists. Sign in instead."); }
      return send(res, 201, { email }, { "Set-Cookie": startSession(id) });
    }

    if (route === "login" && method === "POST") {
      const { email, password } = readCredentials(await readJson(req));
      if (!loginLimit.take(clientIp(req) + "|" + email)) return fail(res, 429, "Too many sign-in attempts. Wait 15 minutes and try again.");
      const user = email && password ? q.userByEmail.get(email) : null;
      const ok = await verifyPassword(password || "x", user ? user.pass_hash : await dummyHash);
      if (!user || !ok) return fail(res, 401, "Email or password is incorrect.");
      return send(res, 200, { email: user.email }, { "Set-Cookie": startSession(user.id) });
    }

    if (route === "logout" && method === "POST") {
      const token = parseCookies(req)[COOKIE];
      if (token) q.deleteToken.run(sha256(token));
      return send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie("", 0) });
    }

    const user = currentUser(req);
    if (route === "me" && method === "GET") return send(res, 200, { email: user ? user.email : null });
    if (!user) return fail(res, 401, "You're signed out. Sign in to sync.");

    if (route === "sync" && method === "GET") return send(res, 200, loadDoc(user.id));

    if (route === "sync" && method === "PUT") {
      const incoming = normalize(await readJson(req));
      // Read, merge and write happen synchronously, so concurrent requests can't interleave.
      const merged = merge(loadDoc(user.id), incoming);
      q.putDoc.run(user.id, JSON.stringify(merged), Date.now());
      return send(res, 200, merged);
    }

    if (route === "account/delete" && method === "POST") {
      const { password } = await readJson(req);
      if (typeof password !== "string" || !(await verifyPassword(password, user.pass_hash))) {
        return fail(res, 401, "Password is incorrect.");
      }
      q.deleteUser.run(user.id);
      return send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie("", 0) });
    }

    return fail(res, 404, "Not found.");
  }

  function serveStatic(req, res, pathname) {
    if (req.method !== "GET" && req.method !== "HEAD") return fail(res, 405, "Method not allowed.");
    let rel;
    try { rel = decodeURIComponent(pathname); } catch (e) { return fail(res, 400, "Bad path."); }
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.resolve(publicDir, "." + rel);
    if (!file.startsWith(publicDir + path.sep)) return fail(res, 404, "Not found.");
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) return fail(res, 404, "Not found.");
      const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
      const headers = {
        "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
        ETag: etag,
        "Content-Security-Policy": CSP,
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      };
      if (path.basename(file) === "sw.js") headers["Service-Worker-Allowed"] = "/";
      if (req.headers["if-none-match"] === etag) { res.writeHead(304, headers); return res.end(); }
      res.writeHead(200, { ...headers, "Content-Length": st.size });
      if (req.method === "HEAD") return res.end();
      fs.createReadStream(file).pipe(res);
    });
  }

  const server = http.createServer(async (req, res) => {
    let pathname;
    try { pathname = new URL(req.url, "http://localhost").pathname; } catch (e) { return fail(res, 400, "Bad request."); }
    try {
      if (pathname.startsWith("/api/")) return await api(req, res, pathname.slice(5));
      return serveStatic(req, res, pathname);
    } catch (e) {
      if (!res.headersSent) fail(res, e.status || 500, e.status ? e.message : "Something went wrong on the server.");
      if (!e.status) console.error(e);
    }
  });
  server.on("close", () => { clearInterval(sweeper); db.close(); });
  return server;
}

module.exports = { createServer };

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => console.log(`Overload running at http://localhost:${port}`));
}
