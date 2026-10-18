"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createServer } = require("../server/server.js");

const APP_URL = "https://overload.example.org";
const outbox = [];
let server, base, dataDir;

before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "overload-email-"));
  server = createServer({ dataDir, appUrl: APP_URL, quiet: true, sendEmail: async (msg) => { outbox.push(msg); } });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((r) => server.close(r));
  fs.rmSync(dataDir, { recursive: true, force: true });
});

function device(extraHeaders = {}) {
  let cookie = "";
  return async (route, { method = "GET", body } = {}) => {
    const res = await fetch(base + "/api/" + route, {
      method,
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}), ...extraHeaders },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0].endsWith("=") ? "" : set.split(";")[0];
    let data = null;
    try { data = await res.json(); } catch (e) { /* none */ }
    return { status: res.status, data };
  };
}
const lastEmailTo = (to) => [...outbox].reverse().find((m) => m.to === to);
const tokenFrom = (msg, param) => new URL(msg.text.match(/https?:\/\/\S+/)[0]).searchParams.get(param);
const signup = (d, email, password = "password123") => d("signup", { method: "POST", body: { email, password, acceptedPrivacy: true } });

test("sign-up requires agreeing to the privacy policy", async () => {
  const r = await device()("signup", { method: "POST", body: { email: "noconsent@example.com", password: "password123" } });
  assert.equal(r.status, 400);
  assert.match(r.data.error, /privacy policy/);
});

test("new accounts must confirm their email before syncing", async () => {
  const a = device();
  const r = await signup(a, "new@example.com");
  assert.equal(r.status, 201);
  assert.equal(r.data.verified, false);
  const mail = lastEmailTo("new@example.com");
  assert.ok(mail, "verification email sent");
  assert.match(mail.subject, /Confirm your email/);
  assert.ok(mail.text.includes(APP_URL + "/?verify="), "link uses the configured app address");
  assert.match(mail.html, /Confirm email/);

  assert.deepEqual((await a("me")).data, { email: "new@example.com", verified: false, emailEnabled: true });
  const blocked = await a("sync", { method: "PUT", body: {} });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.data.code, "unverified");
  assert.equal((await a("reminders", { method: "PUT", body: { enabled: true, days: [1], time: "18:00", tz: "UTC" } })).status, 403);

  const token = tokenFrom(mail, "verify");
  const other = device(); // the link can be opened in any browser
  assert.equal((await other("verify", { method: "POST", body: { token } })).data.verified, true);
  assert.equal((await other("verify", { method: "POST", body: { token } })).status, 400, "single use");
  assert.equal((await a("me")).data.verified, true);
  assert.equal((await a("sync", { method: "PUT", body: {} })).status, 200);
});

test("verification email can be resent, with a limit", async () => {
  const a = device();
  await signup(a, "resend@example.com");
  const first = tokenFrom(lastEmailTo("resend@example.com"), "verify");
  assert.equal((await a("verify/resend", { method: "POST", body: {} })).status, 200);
  const second = tokenFrom(lastEmailTo("resend@example.com"), "verify");
  assert.notEqual(first, second);
  assert.equal((await device()("verify", { method: "POST", body: { token: first } })).status, 400, "older link is cancelled");
  assert.equal((await a("verify/resend", { method: "POST", body: {} })).status, 200);
  assert.equal((await a("verify/resend", { method: "POST", body: {} })).status, 429, "limited to 3 emails an hour");
  assert.equal((await device()("verify", { method: "POST", body: { token: "x".repeat(43) } })).status, 400);
});

test("password reset by email", async () => {
  const phone = device(), laptop = device();
  await signup(phone, "forgot@example.com", "old-password");
  await laptop("login", { method: "POST", body: { email: "forgot@example.com", password: "old-password" } });
  const before = outbox.length;

  const unknown = await device()("password/forgot", { method: "POST", body: { email: "nobody@example.com" } });
  assert.equal(unknown.status, 200, "same answer for unknown emails");
  assert.equal(outbox.length, before, "but nothing is sent");

  // A forged Host header must not change where the link points.
  const forged = await device({ Host: "evil.example" })("password/forgot", { method: "POST", body: { email: "Forgot@Example.com" } });
  assert.equal(forged.status, 200);
  const mail = lastEmailTo("forgot@example.com");
  assert.match(mail.subject, /Reset your Overload password/);
  assert.ok(mail.text.includes(APP_URL + "/?reset="), "link uses the configured app address");
  assert.ok(!mail.text.includes("evil.example"));
  const token = tokenFrom(mail, "reset");

  const fresh = device();
  assert.equal((await fresh("password/reset", { method: "POST", body: { token, password: "short" } })).status, 400);
  const ok = await fresh("password/reset", { method: "POST", body: { token, password: "new-password" } });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.verified, true, "resetting proves the inbox, so the email counts as confirmed");
  assert.equal((await fresh("me")).data.email, "forgot@example.com", "signed in after reset");
  assert.equal((await fresh("password/reset", { method: "POST", body: { token, password: "another-one" } })).status, 400, "single use");

  assert.equal((await phone("me")).data.email, null, "other devices are signed out");
  assert.equal((await laptop("me")).data.email, null);
  assert.equal((await device()("login", { method: "POST", body: { email: "forgot@example.com", password: "old-password" } })).status, 401);
  assert.equal((await device()("login", { method: "POST", body: { email: "forgot@example.com", password: "new-password" } })).status, 200);
});

test("changing the password needs the current one and signs out other devices", async () => {
  const a = device(), b = device();
  await signup(a, "change@example.com", "first-password");
  await b("login", { method: "POST", body: { email: "change@example.com", password: "first-password" } });
  assert.equal((await a("password/change", { method: "POST", body: { currentPassword: "wrong", newPassword: "second-password" } })).status, 401);
  assert.equal((await a("password/change", { method: "POST", body: { currentPassword: "first-password", newPassword: "short" } })).status, 400);
  assert.equal((await a("password/change", { method: "POST", body: { currentPassword: "first-password", newPassword: "second-password" } })).status, 200);
  assert.equal((await a("me")).data.email, "change@example.com", "this device stays signed in");
  assert.equal((await b("me")).data.email, null, "other device is signed out");
  assert.equal((await device()("login", { method: "POST", body: { email: "change@example.com", password: "second-password" } })).status, 200);
});

test("privacy policy is served with the operator's details", async () => {
  for (const p of ["/privacy", "/privacy.html"]) {
    const res = await fetch(base + p);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<h1>Privacy policy<\/h1>/);
    assert.ok(html.includes(APP_URL));
    assert.ok(!html.includes("{{"), "all placeholders filled");
  }
});

test("without an email provider, sign-ups skip verification and reset is unavailable", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "overload-noemail-"));
  const s2 = createServer({ dataDir: dir, quiet: true });
  await new Promise((r) => s2.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${s2.address().port}/api/`;
  const post = (route, body) => fetch(url + route, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const r = await post("signup", { email: "plain@example.com", password: "password123", acceptedPrivacy: true });
  assert.equal((await r.json()).verified, true);
  assert.equal((await post("password/forgot", { email: "plain@example.com" })).status, 503);
  await new Promise((res) => s2.close(res));
  fs.rmSync(dir, { recursive: true, force: true });
});

test("a sign-up allowlist keeps a personal server private", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "overload-allow-"));
  const s3 = createServer({ dataDir: dir, quiet: true, signupEmails: "Me@Example.com, partner@example.com" });
  await new Promise((r) => s3.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${s3.address().port}/api/`;
  const post = (body) => fetch(url + "signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "password123", acceptedPrivacy: true, ...body }) });
  const stranger = await post({ email: "stranger@example.com" });
  assert.equal(stranger.status, 403);
  assert.match((await stranger.json()).error, /closed/);
  assert.equal((await post({ email: "me@example.com" })).status, 201);
  assert.equal((await post({ email: "partner@example.com" })).status, 201);
  await new Promise((res) => s3.close(res));
  fs.rmSync(dir, { recursive: true, force: true });
});

test("the command-line reset sets a new password and signs out every device", async () => {
  const { resetPassword } = require("../server/reset-password.js");
  const a = device();
  await signup(a, "cli@example.com", "forgotten-one");
  assert.equal((await resetPassword(dataDir, "nobody@example.com")), null);
  const pw = await resetPassword(dataDir, "CLI@example.com");
  assert.ok(pw.length >= 12);
  assert.equal((await a("me")).data.email, null, "old session ended");
  assert.equal((await device()("login", { method: "POST", body: { email: "cli@example.com", password: "forgotten-one" } })).status, 401);
  const b = device();
  const ok = await b("login", { method: "POST", body: { email: "cli@example.com", password: pw } });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.verified, true);
});
