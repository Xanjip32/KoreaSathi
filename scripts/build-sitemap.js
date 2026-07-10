// Generates dist/robots.txt and dist/sitemap.xml at build time.
// Fetches live guide posts from the WordPress REST API so the sitemap
// always reflects published guides. Free, no API key required.
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://koreasathi.com';
const WP_API = 'https://public-api.wordpress.com/rest/v1.1/sites/koreasathi.wordpress.com';

const STATIC_PAGES = [
  { url: '/', changefreq: 'weekly', priority: '1.0', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/about', changefreq: 'monthly', priority: '0.8', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/guides', changefreq: 'weekly', priority: '0.9', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/videos', changefreq: 'weekly', priority: '0.8', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/organization', changefreq: 'monthly', priority: '0.8', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/contact', changefreq: 'monthly', priority: '0.7', lastmod: new Date().toISOString().split('T')[0] },
];

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[c]));
}

async function fetchGuidePosts() {
  try {
    const res = await fetch(`${WP_API}/posts?number=100&fields=ID,date,modified`);
    if (!res.ok) throw new Error('WP API ' + res.status);
    const json = await res.json();
    return (json.posts || []).map(p => ({
      url: `/guide?id=${p.ID}`,
      lastmod: p.modified || p.date,
      changefreq: 'monthly',
      priority: '0.8',
    }));
  } catch (e) {
    console.warn('Sitemap: could not fetch guide posts:', e.message);
    return [];
  }
}

(async () => {
  const guides = await fetchGuidePosts();
  const pages = [...STATIC_PAGES, ...guides];

  const urls = pages.map(p => {
    const loc = SITE_URL + p.url;
    const lastmod = p.lastmod ? `    <lastmod>${new Date(p.lastmod).toISOString().split('T')[0]}</lastmod>\n` : '';
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n${lastmod}    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);
  console.log(`Sitemap generated: ${pages.length} URLs (${guides.length} guides + ${STATIC_PAGES.length} static)`);
})();
