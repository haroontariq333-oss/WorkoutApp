"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createServer } = require("../server/server.js");
const { merge, normalize } = require("../public/merge.js");

let server, base, dataDir;

before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "overload-test-"));
  server = createServer({ dataDir, secureCookies: false });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((r) => server.close(r));
  fs.rmSync(dataDir, { recursive: true, force: true });
});

/* A tiny cookie-keeping client, one per simulated device. */
function device() {
  let cookie = "";
  return async (route, { method = "GET", body, headers = {} } = {}) => {
    const res = await fetch(base + "/api/" + route, {
      method,
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0].endsWith("=") ? "" : set.split(";")[0];
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    return { status: res.status, data, setCookie: set };
  };
}

const session = (id, date, kg = 60) => ({
  id, date, dayKey: "upA", dayName: "Upper A",
  exercises: [{ id: "bench", sets: [{ kg, reps: 8 }, { kg, reps: 8 }] }],
});
const settings = (unit, goal) => ({ unit, profile: { goal, level: "beginner", equip: "gym", days: 3 }, body: { sex: "female", age: 30, heightCm: 165, activity: 1.35 } });

test("health check and static app shell", async () => {
  const h = await fetch(base + "/api/health");
  assert.equal(h.status, 200);
  const page = await fetch(base + "/");
  assert.equal(page.status, 200);
  assert.match(page.headers.get("content-security-policy"), /script-src 'self'/);
  assert.match(await page.text(), /<title>Overload Training Log<\/title>/);
  const manifest = await fetch(base + "/manifest.webmanifest");
  assert.equal(manifest.headers.get("content-type"), "application/manifest+json");
  const sw = await fetch(base + "/sw.js");
  assert.equal(sw.status, 200);
});

test("static files cannot escape the public folder", async () => {
  for (const p of ["/../server/server.js", "/%2e%2e/server/server.js", "/..%2fpackage.json"]) {
    const res = await fetch(base + p);
    assert.notEqual(res.status, 200, p);
  }
});

test("sign up, sign in, sign out", async () => {
  const a = device();
  let r = await a("signup", { method: "POST", body: { email: "Lifter@Example.com", password: "short" } });
  assert.equal(r.status, 400);
  r = await a("signup", { method: "POST", body: { email: "not-an-email", password: "longenough" } });
  assert.equal(r.status, 400);
  r = await a("signup", { method: "POST", body: { email: "Lifter@Example.com", password: "correct horse" } });
  assert.equal(r.status, 201);
  assert.equal(r.data.email, "lifter@example.com");
  assert.match(r.setCookie, /HttpOnly/);
  assert.match(r.setCookie, /SameSite=Lax/);
  assert.equal((await a("me")).data.email, "lifter@example.com");

  r = await device()("signup", { method: "POST", body: { email: "lifter@example.com", password: "another one" } });
  assert.equal(r.status, 409);

  const b = device();
  assert.equal((await b("login", { method: "POST", body: { email: "lifter@example.com", password: "wrong pass" } })).status, 401);
  assert.equal((await b("login", { method: "POST", body: { email: "nobody@example.com", password: "whatever1" } })).status, 401);
  assert.equal((await b("login", { method: "POST", body: { email: "LIFTER@example.com", password: "correct horse" } })).status, 200);
  assert.equal((await b("me")).status, 200);

  assert.equal((await b("logout", { method: "POST", body: {} })).status, 200);
  assert.equal((await b("me")).data.email, null);
  assert.equal((await b("sync")).status, 401);
  assert.equal((await a("me")).data.email, "lifter@example.com", "signing out one device keeps the other signed in");
});

test("requests without a session are rejected", async () => {
  const anon = device();
  assert.equal((await anon("sync")).status, 401);
  assert.equal((await anon("sync", { method: "PUT", body: {} })).status, 401);
  const forged = await fetch(base + "/api/sync", { headers: { Cookie: "ovl_session=forged-token" } });
  assert.equal(forged.status, 401);
  assert.equal((await anon("me")).data.email, null);
});

test("cross-site and non-JSON writes are blocked", async () => {
  const r1 = await fetch(base + "/api/login", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
    body: JSON.stringify({ email: "lifter@example.com", password: "correct horse" }),
  });
  assert.equal(r1.status, 403);
  const r2 = await fetch(base + "/api/login", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "email=a&password=b",
  });
  assert.equal(r2.status, 403);
});

test("two devices sync workouts, weigh-ins, deletions and settings", async () => {
  const phone = device(), laptop = device();
  await phone("signup", { method: "POST", body: { email: "sync@example.com", password: "password123" } });
  await laptop("login", { method: "POST", body: { email: "sync@example.com", password: "password123" } });

  let r = await phone("sync", { method: "PUT", body: {
    sessions: [session("s1", "2026-10-01")], weights: [{ date: "2026-10-01", kg: 80, at: 100 }],
    deleted: {}, settings: settings("kg", "lose"), settingsAt: 1000,
  } });
  assert.equal(r.status, 200);

  r = await laptop("sync", { method: "PUT", body: {
    sessions: [session("s2", "2026-10-03")], weights: [{ date: "2026-10-01", kg: 79.5, at: 200 }],
    deleted: {}, settings: settings("lb", "build"), settingsAt: 500,
  } });
  assert.deepEqual(r.data.sessions.map((s) => s.id), ["s1", "s2"]);
  assert.equal(r.data.weights[0].kg, 79.5, "newer weigh-in for the same day wins");
  assert.equal(r.data.settings.unit, "kg", "newer settings win");
  assert.equal(r.data.settings.profile.goal, "lose");

  r = await phone("sync", { method: "PUT", body: { sessions: [session("s1", "2026-10-01")], deleted: { s1: 3000 } } });
  assert.deepEqual(r.data.sessions.map((s) => s.id), ["s2"]);

  r = await laptop("sync", { method: "PUT", body: { sessions: [session("s1", "2026-10-01"), session("s2", "2026-10-03")] } });
  assert.deepEqual(r.data.sessions.map((s) => s.id), ["s2"], "a deleted workout stays deleted when an old device pushes it again");

  r = await laptop("sync");
  assert.deepEqual(r.data.sessions.map((s) => s.id), ["s2"]);

  const other = device();
  await other("signup", { method: "POST", body: { email: "other@example.com", password: "password123" } });
  r = await other("sync");
  assert.equal(r.data.sessions.length, 0, "accounts never see each other's data");
});

test("delete account requires the password and removes data", async () => {
  const a = device();
  await a("signup", { method: "POST", body: { email: "bye@example.com", password: "password123" } });
  await a("sync", { method: "PUT", body: { sessions: [session("x1", "2026-10-02")] } });
  assert.equal((await a("account/delete", { method: "POST", body: { password: "nope" } })).status, 401);
  assert.equal((await a("account/delete", { method: "POST", body: { password: "password123" } })).status, 200);
  assert.equal((await a("me")).data.email, null);
  assert.equal((await device()("login", { method: "POST", body: { email: "bye@example.com", password: "password123" } })).status, 401);
  const again = device();
  assert.equal((await again("signup", { method: "POST", body: { email: "bye@example.com", password: "password123" } })).status, 201);
  assert.equal((await again("sync")).data.sessions.length, 0);
});

test("sign-in attempts are rate limited", async () => {
  const a = device();
  let last;
  for (let i = 0; i < 11; i++) last = await a("login", { method: "POST", body: { email: "limit@example.com", password: "wrongpass" } });
  assert.equal(last.status, 429);
});

test("normalize drops malformed and example data", () => {
  const doc = normalize({
    sessions: [
      session("ok", "2026-10-01"),
      { ...session("ex", "2026-10-01"), example: true },
      { ...session("bad-date", "yesterday") },
      { id: "no-sets", date: "2026-10-01", dayKey: "a", dayName: "A", exercises: [{ id: "bench", sets: [{ kg: "heavy", reps: 5 }] }] },
    ],
    weights: [{ date: "2026-10-01", kg: 80 }, { date: "2026-10-02", kg: -5 }, { date: "x", kg: 70 }],
    settings: { unit: "stone", profile: { days: 9 }, body: { age: "old" } },
    settingsAt: 5,
    deleted: { a: 1, b: "nope" },
  });
  assert.deepEqual(doc.sessions.map((s) => s.id), ["ok"]);
  assert.equal(doc.weights.length, 1);
  assert.equal(doc.settings.unit, "kg");
  assert.equal(doc.settings.profile.days, 4);
  assert.deepEqual(doc.deleted, { a: 1 });
});

test("kettlebell equipment and diet preference survive validation", () => {
  const doc = normalize({ settings: { unit: "kg", profile: { goal: "lose", level: "beginner", equip: "kb", days: 3 }, body: { diet: "vegan" } }, settingsAt: 1 });
  assert.equal(doc.settings.profile.equip, "kb");
  assert.equal(doc.settings.body.diet, "vegan");
  assert.equal(normalize({ settings: { body: { diet: "carnivore" } } }).settings.body.diet, "any");
});

test("a weigh-in logged after a deletion survives the merge", () => {
  const m = merge({ weights: [{ date: "2026-10-05", kg: 81, at: 10 }] }, { deleted: { "w:2026-10-05": 20 } });
  assert.equal(m.weights.length, 0);
  const m2 = merge(m, { weights: [{ date: "2026-10-05", kg: 80, at: 30 }] });
  assert.equal(m2.weights[0].kg, 80);
});
