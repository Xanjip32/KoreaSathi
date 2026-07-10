// ============================================
// KoreaSathi — WordPress API Layer
// Modern ES module version with caching
// ============================================

const WP_SITE = 'koreasathi.wordpress.com';
const WP_API_BASE = `https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}`;
const CACHE_TTL = 5 * 60 * 1000;

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h;
}

function cacheGet(key) {
  try {
    const raw = localStorage.getItem('ks_cache_' + key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.ts > CACHE_TTL) {
      localStorage.removeItem('ks_cache_' + key);
      return null;
    }
    if (item.h !== undefined) {
      const payload = JSON.stringify({ ts: item.ts, data: item.data });
      if (item.h !== simpleHash(payload)) {
        localStorage.removeItem('ks_cache_' + key);
        return null;
      }
    }
    return item.data;
  } catch { return null; }
}

function cacheSet(key, data) {
  try {
    const ts = Date.now();
    const payload = JSON.stringify({ ts, data });
    const h = simpleHash(payload);
    localStorage.setItem('ks_cache_' + key, JSON.stringify({ ts, data, h }));
  } catch {}
}

export async function fetchPosts(params = {}) {
  const query = new URLSearchParams({
    number: params.number || 10,
    order_by: params.order_by || 'date',
    order: params.order || 'DESC',
    fields: 'ID,title,content,excerpt,date,modified,categories,like_count,tagline,URL',
    ...params
  });
  const cacheKey = 'posts_' + query.toString();
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${WP_API_BASE}/posts?${query}`);
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  const json = await res.json();
  const data = json.posts || [];
  cacheSet(cacheKey, data);
  return data;
}

export async function fetchCategories() {
  const cacheKey = 'categories';
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${WP_API_BASE}/categories`);
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  const json = await res.json();
  const data = json.categories || [];
  cacheSet(cacheKey, data);
  return data;
}

export async function fetchPost(id) {
  const cacheKey = 'post_' + id;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${WP_API_BASE}/posts/${id}?fields=ID,title,content,excerpt,date,modified,categories,like_count,URL`);
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  const json = await res.json();
  cacheSet(cacheKey, json);
  return json;
}

export function getTitle(post) {
  if (typeof post.title === 'string') return decodeHtml(post.title);
  if (post.title?.plain) return decodeHtml(post.title.plain);
  return 'Untitled';
}

export function getContent(post) {
  if (typeof post.content === 'string') return post.content;
  if (post.content?.html) return post.content.html;
  return '';
}

export function getExcerpt(post) {
  if (typeof post.excerpt === 'string') return stripTags(post.excerpt);
  if (post.excerpt?.plain) return stripTags(post.excerpt.plain);
  return '';
}

export function findPdfUrl(html) {
  const objMatch = html.match(/<object[^>]*data="([^"]*\.pdf[^"]*)"[^>]*>/i);
  if (objMatch) return objMatch[1];
  const embedMatch = html.match(/<embed[^>]*src="([^"]*\.pdf[^"]*)"[^>]*>/i);
  if (embedMatch) return embedMatch[1];
  const iframeMatch = html.match(/<iframe[^>]*src="([^"]*\.pdf[^"]*)"[^>]*>/i);
  if (iframeMatch) return iframeMatch[1];
  const linkMatch = html.match(/<a[^>]*href="([^"]*\.pdf[^"]*)"[^>]*download/i);
  if (linkMatch) return linkMatch[1];
  const anyMatch = html.match(/href="([^"]*\.pdf[^"]*)"/i);
  if (anyMatch) return anyMatch[1];
  return null;
}

export function findVideoEmbed(html) {
  const ytMatch = html.match(/(?:youtube\.com\/(?:embed|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { platform: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`, videoId: ytMatch[1] };
  const ttBlockquote = html.match(/<blockquote[^>]*class="[^"]*tiktok-embed[^"]*"[^>]*>/i);
  if (ttBlockquote) {
    const urlMatch = html.match(/cite="([^"]*)"/i);
    const idMatch = ttBlockquote[0].match(/data-video-id="([^"]*)"/i) || (urlMatch?.[1] || '').match(/video\/(\d+)/);
    return { platform: 'tiktok', url: urlMatch?.[1] || null, videoId: idMatch?.[1] || null, embedHtml: ttBlockquote[0] };
  }
  const ttLink = html.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (ttLink) return { platform: 'tiktok', url: ttLink[0], videoId: ttLink[1] };
  return null;
}

export function extractText(html, maxLen = 200) {
  return stripTags(html).trim().substring(0, maxLen);
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

export function decodeHtml(html) {
  return String(html)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

export function stripTags(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  return doc.documentElement.textContent || '';
}

export function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return d; }
}

const ALLOWED_DOWNLOAD_HOSTS = ['koreasathi.wordpress.com', 'koreasathi.com', 'public-api.wordpress.com'];

export function downloadFile(url, filename) {
  try {
    const parsed = new URL(url);
    if (!ALLOWED_DOWNLOAD_HOSTS.some(host => parsed.hostname.endsWith(host))) {
      console.warn('Blocked download from untrusted origin:', url);
      return;
    }
  } catch {
    console.warn('Invalid download URL:', url);
    return;
  }
  fetch(url)
    .then(r => { if (!r.ok) throw new Error('Failed'); return r.blob(); })
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || url.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    })
    .catch(() => {});
}