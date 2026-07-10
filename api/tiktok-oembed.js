export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('tiktok.com')) {
      return res.status(400).json({ error: 'Invalid TikTok URL' });
    }

    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'TikTok oEmbed request failed' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('TikTok oEmbed error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
