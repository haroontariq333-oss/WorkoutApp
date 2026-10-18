"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { createServer } = require("../server/server.js");
const push = require("../server/push.js");

/* Browser side of RFC 8291: decrypts what the server sends. */
function decrypt(body, uaEcdh, authSecret) {
  const salt = body.subarray(0, 16);
  const idlen = body[20];
  const asPublic = body.subarray(21, 21 + idlen);
  const sealed = body.subarray(21 + idlen);
  const uaPublic = uaEcdh.getPublicKey();
  const shared = uaEcdh.computeSecret(asPublic);
  const ikm = Buffer.from(crypto.hkdfSync("sha256", shared, authSecret, Buffer.concat([Buffer.from("WebPush: info\0"), uaPublic, asPublic]), 32));
  const cek = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
  const nonce = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0"), 12));
  const d = crypto.createDecipheriv("aes-128-gcm", cek, nonce);
  d.setAuthTag(sealed.subarray(sealed.length - 16));
  const plain = Buffer.concat([d.update(sealed.subarray(0, sealed.length - 16)), d.final()]);
  assert.equal(plain[plain.length - 1], 2, "last-record padding delimiter");
  return plain.subarray(0, plain.length - 1).toString("utf8");
}

function fakeBrowser() {
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.generateKeys();
  const auth = crypto.randomBytes(16);
  return { ecdh, auth, keys: { p256dh: ecdh.getPublicKey().toString("base64url"), auth: auth.toString("base64url") } };
}

function verifyVapid(header, publicKey, endpoint) {
  const m = /^vapid t=([^,]+), k=(.+)$/.exec(header);
  assert.ok(m, "VAPID header format");
  assert.equal(m[2], publicKey);
  const [h, c, sig] = m[1].split(".");
  const pub = Buffer.from(publicKey, "base64url");
  const key = crypto.createPublicKey({ key: { kty: "EC", crv: "P-256", x: pub.subarray(1, 33).toString("base64url"), y: pub.subarray(33).toString("base64url") }, format: "jwk" });
  assert.ok(crypto.verify("sha256", Buffer.from(`${h}.${c}`), { key, dsaEncoding: "ieee-p1363" }, Buffer.from(sig, "base64url")), "JWT signature");
  const claims = JSON.parse(Buffer.from(c, "base64url"));
  assert.equal(claims.aud, new URL(endpoint).origin);
  assert.ok(claims.exp > Date.now() / 1000);
}

test("payload encryption round-trips and VAPID signatures verify", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "overload-vapid-"));
  const keys = push.loadVapidKeys(dir);
  assert.deepEqual(push.loadVapidKeys(dir), keys, "keys persist across restarts");
  const b = fakeBrowser();
  const body = push.encryptPayload(JSON.stringify({ title: "Hi" }), b.keys.p256dh, b.keys.auth);
  assert.equal(JSON.parse(decrypt(body, b.ecdh, b.auth)).title, "Hi");
  verifyVapid(push.vapidAuth("https://fcm.googleapis.com/fcm/send/abc", keys, "mailto:a@b.c"), keys.publicKey, "https://fcm.googleapis.com/fcm/send/abc");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("only real browser push services are allowed", () => {
  for (const h of ["fcm.googleapis.com", "updates.push.services.mozilla.com", "web.push.apple.com", "wns2-db5p.notify.windows.com"]) assert.ok(push.allowedPushHost(h), h);
  for (const h of ["evil.com", "fcm.googleapis.com.evil.com", "localhost", "169.254.169.254"]) assert.ok(!push.allowedPushHost(h), h);
});

test("local time handles time zones", () => {
  const now = new Date("2026-10-19T17:05:00Z"); // a Monday
  assert.deepEqual(push.localTime(now, "UTC"), { date: "2026-10-19", weekday: 1, minutes: 17 * 60 + 5 });
  assert.deepEqual(push.localTime(now, "Asia/Karachi"), { date: "2026-10-19", weekday: 1, minutes: 22 * 60 + 5 });
  assert.equal(push.localTime(now, "Pacific/Kiritimati").weekday, 2);
});

/* ---------- Reminders end to end with a fake push service ---------- */
let server, base, dataDir, pushSvc, pushBase;
const received = [];
let pushStatus = 201;

before(async () => {
  pushSvc = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => { received.push({ url: req.url, headers: req.headers, body: Buffer.concat(chunks) }); res.writeHead(pushStatus); res.end(); });
  });
  await new Promise((r) => pushSvc.listen(0, "127.0.0.1", r));
  pushBase = `http://127.0.0.1:${pushSvc.address().port}`;
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "overload-push-"));
  server = createServer({ dataDir, pushHostAllowed: () => true, allowInsecurePush: true, reminderIntervalMs: 3600000 });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((r) => server.close(r));
  await new Promise((r) => pushSvc.close(r));
  fs.rmSync(dataDir, { recursive: true, force: true });
});

function device() {
  let cookie = "";
  return async (route, { method = "GET", body } = {}) => {
    const res = await fetch(base + "/api/" + route, {
      method,
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    let data = null;
    try { data = await res.json(); } catch (e) { /* none */ }
    return { status: res.status, data };
  };
}

test("reminder settings are validated and stored", async () => {
  const a = device();
  await a("signup", { method: "POST", body: { email: "remind@example.com", password: "password123", acceptedPrivacy: true } });
  assert.equal((await a("reminders")).data, null);
  assert.equal((await a("reminders", { method: "PUT", body: { enabled: true, days: [], time: "18:00", tz: "UTC" } })).status, 400);
  assert.equal((await a("reminders", { method: "PUT", body: { enabled: true, days: [1], time: "25:00", tz: "UTC" } })).status, 400);
  assert.equal((await a("reminders", { method: "PUT", body: { enabled: true, days: [1], time: "18:00", tz: "Mars/Olympus" } })).status, 400);
  const ok = await a("reminders", { method: "PUT", body: { enabled: true, days: [5, 1, 1, 9], time: "07:30", tz: "Europe/London" } });
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.data.days, [1, 5]);
  assert.deepEqual((await a("reminders")).data, { enabled: true, days: [1, 5], time: "07:30", tz: "Europe/London" });
  assert.equal((await device()("reminders")).status, 401);
});

test("subscriptions are validated", async () => {
  const a = device();
  await a("signup", { method: "POST", body: { email: "subs@example.com", password: "password123", acceptedPrivacy: true } });
  const b = fakeBrowser();
  assert.equal((await a("push/subscribe", { method: "POST", body: { subscription: { endpoint: "not a url", keys: b.keys } } })).status, 400);
  assert.equal((await a("push/subscribe", { method: "POST", body: { subscription: { endpoint: pushBase + "/x", keys: { p256dh: "short", auth: b.keys.auth } } } })).status, 400);
  assert.equal((await a("push/test", { method: "POST", body: {} })).status, 409, "no devices yet");
  assert.equal((await device()("push/subscribe", { method: "POST", body: { subscription: { endpoint: pushBase + "/x", keys: b.keys } } })).status, 401);
});

test("due reminders are sent once per day, encrypted, and skipped after training", async () => {
  const now = new Date("2026-10-19T17:05:00Z"); // Monday 17:05 UTC
  const lifter = device(), rested = device();
  const b1 = fakeBrowser(), b2 = fakeBrowser();
  await lifter("signup", { method: "POST", body: { email: "due@example.com", password: "password123", acceptedPrivacy: true } });
  await rested("signup", { method: "POST", body: { email: "trained@example.com", password: "password123", acceptedPrivacy: true } });
  assert.equal((await lifter("push/subscribe", { method: "POST", body: { subscription: { endpoint: pushBase + "/sub/lifter", keys: b1.keys } } })).status, 200);
  await rested("push/subscribe", { method: "POST", body: { subscription: { endpoint: pushBase + "/sub/rested", keys: b2.keys } } });
  await lifter("reminders", { method: "PUT", body: { enabled: true, days: [1, 3], time: "17:00", tz: "UTC" } });
  await rested("reminders", { method: "PUT", body: { enabled: true, days: [1], time: "17:00", tz: "UTC" } });
  await rested("sync", { method: "PUT", body: { sessions: [{ id: "t1", date: "2026-10-19", dayKey: "upA", dayName: "Upper A", exercises: [{ id: "bench", sets: [{ kg: 60, reps: 8 }] }] }] } });

  received.length = 0;
  await server.runReminders(new Date("2026-10-19T16:55:00Z"));
  assert.equal(received.length, 0, "not before the reminder time");

  await server.runReminders(now);
  assert.equal(received.length, 1, "only the user who hasn't trained today");
  const msg = received[0];
  assert.equal(msg.url, "/sub/lifter");
  assert.equal(msg.headers["content-encoding"], "aes128gcm");
  assert.ok(Number(msg.headers.ttl) > 0);
  const { publicKey } = (await lifter("push/key")).data;
  verifyVapid(msg.headers.authorization, publicKey, pushBase + "/sub/lifter");
  assert.equal(JSON.parse(decrypt(msg.body, b1.ecdh, b1.auth)).title, "Time to train");

  await server.runReminders(new Date("2026-10-19T17:15:00Z"));
  assert.equal(received.length, 1, "not sent twice on the same day");
  await server.runReminders(new Date("2026-10-20T17:05:00Z"));
  assert.equal(received.length, 1, "Tuesday isn't a reminder day");
  await server.runReminders(new Date("2026-10-21T18:00:00Z"));
  assert.equal(received.length, 1, "too late: more than 30 minutes after the reminder time");
  await server.runReminders(new Date("2026-10-26T17:29:00Z"));
  assert.deepEqual(received.slice(1).map((r) => r.url).sort(), ["/sub/lifter", "/sub/rested"], "next Monday, within the window, both users");

  pushStatus = 410;
  assert.equal((await lifter("push/test", { method: "POST", body: {} })).status, 409, "expired subscription counts as not delivered");
  pushStatus = 201;
  assert.equal((await lifter("push/test", { method: "POST", body: {} })).status, 409, "expired subscription was removed");
});
