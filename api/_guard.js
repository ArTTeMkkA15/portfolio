// Shared abuse protection for the public API routes.
// Files starting with "_" are not deployed as endpoints on Vercel.
//
// The limits live in memory, so they are per server instance. Together with prepaid
// API credit (no auto-reload) they keep a public demo from running up a bill.

const store = (globalThis.__apiGuard ??= { hits: new Map(), days: new Map() });

export function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

// Browsers send an Origin header on POST. Reject calls made from other websites,
// so nobody can wire our endpoints into their own pages.
export function isForeignOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false; // server-to-server tools; still rate-limited below
  try {
    return new URL(origin).host !== req.headers.host;
  } catch {
    return true;
  }
}

// At most `max` calls per visitor per window.
export function overRateLimit(req, bucket, max, windowMs) {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const recent = (store.hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  store.hits.set(key, recent);
  if (store.hits.size > 10000) store.hits.clear();
  return recent.length > max;
}

// At most `max` calls per day for the whole site (per instance).
export function overDailyCap(bucket, max) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${bucket}:${day}`;
  const count = (store.days.get(key) || 0) + 1;
  store.days.set(key, count);
  if (store.days.size > 50) store.days.clear();
  return count > max;
}
