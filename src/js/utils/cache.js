const CACHE_PREFIX = 'ks_cache_';
const DEFAULT_TTL = 5 * 60 * 1000;

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h;
}

export function cacheGet(key, ttl = DEFAULT_TTL) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.ts > ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    if (item.h !== undefined) {
      const payload = JSON.stringify({ ts: item.ts, data: item.data });
      if (item.h !== simpleHash(payload)) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
    }
    return item.data;
  } catch {
    return null;
  }
}

const MAX_DATA_SIZE = 512 * 1024;

export function cacheSet(key, data) {
  try {
    const ts = Date.now();
    const payload = JSON.stringify({ ts, data });
    if (payload.length > MAX_DATA_SIZE) return;
    const h = simpleHash(payload);
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts, data, h }));
  } catch {}
}

export function cacheRemove(key) {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch {}
}
