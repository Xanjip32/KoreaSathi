export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const channelId = req.query.channel_id || 'UCxHGYNiWoE-5zD4eN_-uQ8g';
  const limit = parseInt(req.query.limit || '12', 10);

  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'YouTube feed request failed' });
    }

    const xml = await response.text();

    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
    const videos = entries.map(e => {
      const block = e[1];
      const videoId = (block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1] || '';
      const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
      const published = (block.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
      const link = (block.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
      return { videoId, title, published, link };
    }).slice(0, limit);

    return res.status(200).json({ success: true, videos });
  } catch (err) {
    console.error('YouTube feed error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
