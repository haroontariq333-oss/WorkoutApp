"use strict";
/* Sends account emails (verification, password reset) through Brevo or Resend's HTTP APIs.
   Configure with EMAIL_FROM plus BREVO_API_KEY or RESEND_API_KEY. */

function parseFrom(from) {
  const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
  return m ? { name: m[1] || "Overload", email: m[2] } : { name: "Overload", email: from.trim() };
}

async function postJson(url, headers, body) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Email provider returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/* Returns { enabled, send({ to, subject, text, html }) }. Without a provider, emails are only logged. */
function createMailer(opts = {}) {
  if (opts.sendEmail) return { enabled: true, send: opts.sendEmail };
  const from = process.env.EMAIL_FROM;
  if (from && process.env.BREVO_API_KEY) {
    const sender = parseFrom(from);
    return {
      enabled: true,
      send: ({ to, subject, text, html }) => postJson("https://api.brevo.com/v3/smtp/email", { "api-key": process.env.BREVO_API_KEY },
        { sender, to: [{ email: to }], subject, textContent: text, htmlContent: html }),
    };
  }
  if (from && process.env.RESEND_API_KEY) {
    return {
      enabled: true,
      send: ({ to, subject, text, html }) => postJson("https://api.resend.com/emails", { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        { from, to: [to], subject, text, html }),
    };
  }
  return {
    enabled: false,
    send: async ({ to, subject, text }) => { console.log(`[email not configured] To: ${to}\nSubject: ${subject}\n${text}\n`); },
  };
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* A plain, readable email with one button. */
function buildEmail({ heading, intro, button, link, outro }) {
  const text = `${heading}\n\n${intro}\n\n${button}: ${link}\n\n${outro}\n\n— Overload`;
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#edf0f4;font-family:Segoe UI,Arial,sans-serif;color:#111b25">
<div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:10px;padding:28px">
<p style="margin:0 0 4px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:13px;color:#1f55d4">Overload</p>
<h1 style="margin:0 0 16px;font-size:22px">${escapeHtml(heading)}</h1>
<p style="margin:0 0 20px;line-height:1.5">${escapeHtml(intro)}</p>
<p style="margin:0 0 20px"><a href="${escapeHtml(link)}" style="display:inline-block;background:#1f55d4;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">${escapeHtml(button)}</a></p>
<p style="margin:0 0 8px;font-size:13px;color:#566476;line-height:1.5">${escapeHtml(outro)}</p>
<p style="margin:0;font-size:12px;color:#566476;word-break:break-all">${escapeHtml(link)}</p>
</div></body></html>`;
  return { text, html };
}

module.exports = { createMailer, buildEmail };
