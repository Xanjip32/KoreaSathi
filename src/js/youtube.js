// YouTube channel feed (RSS) — no API key required.
// Fetches latest videos from a channel via the public RSS feed.

const YT_CHANNEL_ID = 'UCxHGYNiWoE-5zD4eN_-uQ8g'; // @SanjeevShresthaUnfiltered
const YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;

const CACHE_KEY = 'ks_yt_feed';
const CACHE_TTL = 30 * 60 * 1000;

function cacheGet() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    return item.data;
  } catch { return null; }
}
function cacheSet(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

function decodeEntities(s) {
  const txt = document.createElement('textarea');
  txt.innerHTML = s;
  return txt.value;
}

export async function fetchYouTubeVideos(limit = 12) {
  const cached = cacheGet();
  if (cached) return cached;

  const apiUrl = `/api/youtube-feed?channel_id=${YT_CHANNEL_ID}&limit=${limit}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`YouTube feed error: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error('YouTube feed failed');
  const videos = json.videos || [];

  cacheSet(videos);
  return videos;
}
