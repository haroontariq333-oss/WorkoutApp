"use strict";
/* Sets a new password for an account from the server's command line, for servers without email.
   Usage: node server/reset-password.js you@example.com
   Prints a new random password and signs the account out on every device. */
const crypto = require("node:crypto");
const path = require("node:path");
const { promisify } = require("node:util");
const { DatabaseSync } = require("node:sqlite");

const scrypt = promisify(crypto.scrypt);

async function resetPassword(dataDir, email) {
  const db = new DatabaseSync(path.join(dataDir, "overload.db"));
  try {
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(String(email).trim().toLowerCase());
    if (!user) return null;
    const password = crypto.randomBytes(12).toString("base64url");
    const salt = crypto.randomBytes(16);
    const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
    db.prepare("UPDATE users SET pass_hash = ?, email_verified = 1 WHERE id = ?")
      .run(`scrypt$16384$8$1$${salt.toString("base64")}$${key.toString("base64")}`, user.id);
    db.prepare("DELETE FROM auth_tokens WHERE user_id = ?").run(user.id);
    return password;
  } finally {
    db.close();
  }
}

module.exports = { resetPassword };

if (require.main === module) {
  const email = process.argv[2];
  if (!email) { console.error("Usage: node server/reset-password.js you@example.com"); process.exit(1); }
  const dataDir = process.env.DATA_DIR || path.join(__dirname, "..", "data");
  resetPassword(dataDir, email).then((pw) => {
    if (!pw) { console.error(`No account found for ${email}.`); process.exit(1); }
    console.log(`New password for ${email}: ${pw}\nSign in with it, then change it under Plan > Settings > Change password.`);
  }).catch((e) => { console.error(e.message); process.exit(1); });
}
