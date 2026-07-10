const rateLimit = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;

function cleanup() {
  const now = Date.now();
  for (const [ip, record] of rateLimit) {
    if (now - record.start > WINDOW_MS * 2) rateLimit.delete(ip);
  }
}

export function checkRateLimit(ip) {
  cleanup();
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (!record || now - record.start > WINDOW_MS) {
    rateLimit.set(ip, { start: now, count: 1 });
    return true;
  }
  record.count++;
  return record.count <= MAX_REQUESTS;
}
