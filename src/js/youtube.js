import { cacheGet, cacheSet } from './utils/cache.js';
import { decodeHtml } from './api.js';

const YT_CHANNEL_ID = 'UCxHGYNiWoE-5zD4eN_-uQ8g';
const CACHE_KEY = 'yt_feed';
const CACHE_TTL = 30 * 60 * 1000;

export async function fetchYouTubeVideos(limit = 12) {
  const cached = cacheGet(CACHE_KEY, CACHE_TTL);
  if (cached) return cached;

  const apiUrl = `/api/youtube-feed?channel_id=${YT_CHANNEL_ID}&limit=${limit}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`YouTube feed error: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error('YouTube feed failed');
  const videos = (json.videos || []).map(v => ({
    ...v,
    title: decodeHtml(v.title || ''),
  }));

  cacheSet(CACHE_KEY, videos);
  return videos;
}
