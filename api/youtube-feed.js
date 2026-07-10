import { checkRateLimit } from './rate-limit.js';

const APP_USER_AGENT = 'KoreaSathi/2.0 (https://koreasathi.com; contact@koreasathi.com)';

export default async function handler(req, res) {
  const ALLOWED_ORIGINS = ['https://koreasathi.com', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const clientIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const channelId = req.query.channel_id || 'UCxHGYNiWoE-5zD4eN_-uQ8g';

  if (!/^UC[a-zA-Z0-9_-]{22}$/.test(channelId)) {
    return res.status(400).json({ error: 'Invalid channel_id format' });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10) || 12, 1), 50);

  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': APP_USER_AGENT },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'YouTube feed request failed' });
    }

    const xml = await response.text();

    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
    const videos = entries.map(e => {
      const block = e[1];
      const videoId = (block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1] || '';
      const title = ((block.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').substring(0, 200);
      const published = (block.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
      const link = (block.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return null;
      return { videoId, title, published, link };
    }).filter(v => v !== null).slice(0, limit);

    return res.status(200).json({ success: true, videos });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
