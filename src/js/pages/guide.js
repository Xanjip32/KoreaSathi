import DOMPurify from 'dompurify';
import { fetchPost, getTitle, getContent, getExcerpt, findPdfUrl, findVideoEmbed, formatDate, escapeHtml, downloadFile } from '../api.js';

// Remove the raw WordPress media blocks (PDF file block + TikTok embed figure)
// because we render those as clean media blocks above the article body.
function stripEmbeddedMedia(html) {
  if (!html) return html;
  let cleaned = html;
  // Remove the PDF file block: <div ... class="wp-block-file">...</div>
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*wp-block-file[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  // Remove the TikTok embed figure: <figure ... wp-block-embed-tiktok ...>...</figure>
  cleaned = cleaned.replace(/<figure[^>]*class="[^"]*wp-block-embed-tiktok[^"]*"[^>]*>[\s\S]*?<\/figure>/gi, '');
  return cleaned;
}

// Inject Article structured data (JSON-LD) so search engines understand
// the guide is an article with a title, date, and author.
function injectArticleJsonLd(post) {
  try {
    const existing = document.getElementById('guide-jsonld');
    if (existing) existing.remove();
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': getTitle(post),
      'datePublished': post.date || '',
      'dateModified': post.modified || post.date || '',
      'author': { '@type': 'Organization', 'name': 'KoreaSathi' },
      'publisher': {
        '@type': 'Organization',
        'name': 'KoreaSathi',
        'logo': { '@type': 'ImageObject', 'url': 'https://koreasathi.com/assets/images/hero_background.webp' }
      },
      'description': getExcerpt(post) || 'Student guide on KoreaSathi.',
      'mainEntityOfPage': 'https://koreasathi.com/guide?id=' + post.ID,
      'image': 'https://koreasathi.com/assets/images/guides_bg.webp',
      'wordCount': ((getContent(post) || '').replace(/<[^>]+>/g, '').split(/\s+/).length)
    };
    if (post.URL) data['sameAs'] = post.URL;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'guide-jsonld';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  } catch (e) { /* non-fatal */ }
}

// Update <title>, OG/Twitter tags, canonical, and article:* meta from the
// fetched post so each guide is uniquely indexable and shareable.
function updateDocumentMeta(post) {
  try {
    const title = getTitle(post);
    const excerpt = getExcerpt(post) || 'Student guide on KoreaSathi.';
    const url = 'https://koreasathi.com/guide?id=' + post.ID;
    const img = 'https://koreasathi.com/assets/images/guides_bg.webp';
    document.title = title + ' - KoreaSathi';
    const setMeta = (selector, attr, value) => {
      const el = document.head.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', excerpt);
    setMeta('meta[property="og:image"]', 'content', img);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', excerpt);
    setMeta('meta[name="twitter:image"]', 'content', img);
    setMeta('meta[property="twitter:title"]', 'content', title);
    setMeta('meta[property="twitter:description"]', 'content', excerpt);
    setMeta('meta[property="twitter:image"]', 'content', img);
    setMeta('meta[name="description"]', 'content', excerpt);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
    const setArticle = (prop, value) => {
      let el = document.head.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
      el.setAttribute('content', value);
    };
    if (post.date) setArticle('article:published_time', post.date);
    if (post.modified || post.date) setArticle('article:modified_time', post.modified || post.date);
    setArticle('article:author', 'KoreaSathi');
    setArticle('article:section', 'Student Guides');
    const siteName = document.head.querySelector('meta[property="og:site_name"]');
    if (!siteName) { const sn = document.createElement('meta'); sn.setAttribute('property', 'og:site_name'); sn.setAttribute('content', 'KoreaSathi'); document.head.appendChild(sn); }
  } catch (e) { /* non-fatal */ }
}

export function initGuide() {
  const guideBody = document.getElementById('guideBody');
  const guideTitle = document.getElementById('guideTitle');
  const guideDate = document.getElementById('guideDate');
  if (!guideBody) return;

  const params = new URLSearchParams(window.location.search);
  let postId = params.get('id');
  if (!postId) {
    const hash = window.location.hash.match(/id=(\d+)/);
    postId = hash ? hash[1] : null;
  }
  if (!postId) {
    guideBody.innerHTML = '<p class="text-white/30 text-center py-10">No guide selected.</p>';
    return;
  }

  guideBody.innerHTML = '<div class="space-y-4"><div class="skeleton h-8 w-3/4 mb-4"></div><div class="skeleton h-4 w-full mb-2"></div><div class="skeleton h-4 w-full mb-2"></div><div class="skeleton h-4 w-2/3"></div></div>';

  fetchPost(postId)
    .then(post => {
      if (guideTitle) guideTitle.textContent = getTitle(post);
      if (guideDate) guideDate.textContent = formatDate(post.date);
      updateDocumentMeta(post);

      const rawContent = getContent(post) || '';
      const pdfUrl = findPdfUrl(rawContent);
      const video = findVideoEmbed(rawContent);
      const content = stripEmbeddedMedia(rawContent);

      // Build media block (PDF viewer + video) shown above the article body
      let mediaHtml = '';
      if (pdfUrl) {
        mediaHtml += `
          <div class="mb-8 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span class="inline-flex items-center gap-2 text-sm font-semibold text-white"><i class="fas fa-file-pdf text-red-400"></i> PDF Guide</span>
              <a href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener" download class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-blue-200 transition-colors"><i class="fas fa-download"></i> Download</a>
            </div>
            <iframe src="${escapeHtml(pdfUrl)}#view=FitH" class="w-full" style="height:600px;border:0;" title="PDF Guide"></iframe>
          </div>`;
      }
      if (video && video.platform === 'tiktok' && video.videoId) {
        const videoUrl = `https://www.tiktok.com/@csjibu/video/${video.videoId}`;
        mediaHtml += `
          <div class="mb-8">
            <div class="inline-flex items-center gap-2 text-sm font-semibold text-white mb-3"><i class="fab fa-tiktok text-pink-400"></i> Watch on TikTok</div>
            <div class="rounded-2xl overflow-hidden border border-white/10 bg-[#0B0F1A]">
              <iframe
                src="https://www.tiktok.com/embed/v2/${escapeHtml(video.videoId)}"
                style="width:100%;height:700px;border:0;"
                class="w-full"
                allowfullscreen
                scrolling="no"
                title="TikTok video"
                loading="lazy"
              ></iframe>
            </div>
            <a href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors"><i class="fab fa-tiktok"></i> Open on TikTok</a>
          </div>`;
      }

      // Strip style attributes before sanitization to prevent CSS data exfiltration
      const contentNoStyle = content ? content.replace(/\s+style\s*=\s*(?:"[^"]*"|'[^'']*')/gi, '') : '';
      const sanitizedContent = contentNoStyle ? DOMPurify.sanitize(contentNoStyle, {
        ALLOWED_TAGS: ['p','br','strong','em','a','ul','ol','li','h2','h3','h4','h5','h6','img','table','thead','tbody','tr','th','td','blockquote','pre','code','figure','figcaption','div','span','iframe','object','embed','hr','dl','dt','dd','details','summary','section','article'],
        ALLOWED_ATTR: ['href','src','alt','title','class','width','height','frameborder','allow','allowfullscreen','loading','referrerpolicy','scrolling','data-src','id','target','rel','colspan','rowspan','scope','align','valign'],
        ALLOW_DATA_ATTR: false,
      }) : '';
      guideBody.innerHTML = mediaHtml + (sanitizedContent || '<p class="text-white/30">No content available.</p>');
      const sourceLink = document.getElementById('guideSourceLink');
      const sourceUrl = post.URL || '';
      if (sourceLink && sourceUrl) {
        sourceLink.href = sourceUrl;
        sourceLink.classList.remove('hidden');
      }

      // Inject Article structured data (JSON-LD) for SEO
      injectArticleJsonLd(post);
    })
    .catch(err => {
      console.warn('Failed to load guide:', err);
      guideBody.innerHTML = '<p class="text-white/30 text-center py-10">Could not load guide.</p>';
    });
}