"use strict";
/* Builds the server-free version for static hosting (GitHub Pages) into _site/.
   The app works fully on the device; accounts, sync and reminders are hidden. */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const out = path.join(root, "_site");
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, "public"), out, { recursive: true });

const index = path.join(out, "index.html");
const html = fs.readFileSync(index, "utf8");
const marker = '<meta name="claude:viewport-fit-sides" content="cover">';
if (!html.includes(marker)) throw new Error("index.html changed: can't find where to add the static marker");
fs.writeFileSync(index, html.replace(marker, `${marker}\n<meta name="overload:static" content="1">`));

// The privacy policy isn't linked in this version, but fill its placeholders so the page reads correctly.
const privacy = path.join(out, "privacy.html");
fs.writeFileSync(privacy, fs.readFileSync(privacy, "utf8")
  .replaceAll("{{OPERATOR}}", "its owner").replaceAll("{{CONTACT}}", "the app's owner").replaceAll("{{APP_URL}}", process.env.SITE_URL || "this address"));

fs.writeFileSync(path.join(out, ".nojekyll"), ""); // serve files as-is
console.log(`Static site written to ${path.relative(root, out)}/`);
