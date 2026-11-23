// Vercel serverless function: POST /api/contact
// Delivers the portfolio contact form to your inbox through Resend (https://resend.com).
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY    — API key from resend.com
//   CONTACT_TO_EMAIL  — where messages should arrive. Kept only in Vercel settings, never in the
//                       public code, so the address can't be scraped. (On Resend's free plan without
//                       a verified domain this must be the email of your Resend account)
//   CONTACT_FROM      — optional, e.g. "Portfolio <hello@yourdomain.com>" once your
//                       domain is verified in Resend. Default: Resend's test sender.
// Without RESEND_API_KEY / CONTACT_TO_EMAIL the function answers 503.

import { isForeignOrigin, overRateLimit, overDailyCap } from "./_guard.js";

const LIMITS = { name: 100, contact: 150, message: 3000 };
// Keeps the form from being used to flood your inbox.
const PER_VISITOR = { max: 3, windowMs: 60 * 60 * 1000 }; // 3 messages per hour per visitor
const DAILY_LIMIT = 50;

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON" });
  }

  if (isForeignOrigin(req)) return sendJson(res, 403, { error: "Forbidden" });

  // Spam trap: real visitors never see the "website" field.
  if (body.website) return sendJson(res, 200, { ok: true });

  if (overRateLimit(req, "contact", PER_VISITOR.max, PER_VISITOR.windowMs) || overDailyCap("contact", DAILY_LIMIT)) {
    return sendJson(res, 429, { error: "Too many messages. Please try again later." });
  }

  const name = clean(body.name, LIMITS.name);
  const contact = clean(body.contact, LIMITS.contact);
  const message = clean(body.message, LIMITS.message);
  if (!name || !contact || !message) return sendJson(res, 400, { error: "Please fill in all fields." });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return sendJson(res, 503, { error: "Contact form is not configured." });

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const payload = {
    from: process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>",
    to: [to],
    subject: `New enquiry from ${name}`,
    text: `${message}\n\n— ${name}\nContact: ${contact}`,
    ...(isEmail ? { reply_to: contact } : {}),
  };

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error("[contact] Resend error", r.status, await r.text());
      return sendJson(res, 502, { error: "Could not send the message." });
    }
    return sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error("[contact] network error", err?.message);
    return sendJson(res, 502, { error: "Could not send the message." });
  }
}
