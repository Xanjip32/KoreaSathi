import { escapeHtml } from '../api.js';
import { TIKTOK_USERNAME } from '../../data/tiktok-videos.js';

const OEMBED_CACHE = new Map();
const OEMBED_CACHE_TTL = 24 * 60 * 60 * 1000;

function getVideoIdFromUrl(url) {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : null;
}

export async function fetchTikTokOembed(videoUrl) {
  const cached = OEMBED_CACHE.get(videoUrl);
  if (cached && Date.now() - cached.ts < OEMBED_CACHE_TTL) return cached.data;

  try {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const base = isLocal ? '' : '';
    const res = await fetch(`${base}/api/tiktok-oembed?url=${encodeURIComponent(videoUrl)}`);
    if (!res.ok) throw new Error(`oEmbed ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('oEmbed failed');
    OEMBED_CACHE.set(videoUrl, { ts: Date.now(), data: json.data });
    return json.data;
  } catch (err) {
    console.warn('TikTok oEmbed failed for', videoUrl, err);
    return null;
  }
}

export function renderYouTubeCard(videoId, title, date) {
  return `
    <article class="group glass-card overflow-hidden p-2">
      <div class="relative w-full pb-[56.25%] rounded-xl overflow-hidden bg-dark-card">
        <iframe
          data-src="https://www.youtube.com/embed/${escapeHtml(videoId)}?rel=0&modestbranding=1&playsinline=1"
          title="${escapeHtml(title)}"
          class="absolute inset-0 w-full h-full lazy-video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
      <div class="px-4 pb-4 pt-3">
        <h3 class="text-[13px] font-bold text-white mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">${escapeHtml(title)}</h3>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
            <i class="fab fa-youtube text-[8px]"></i> YouTube
          </span>
          <span class="text-white/40 text-[10px] font-medium">${date}</span>
        </div>
      </div>
    </article>
  `;
}

export function renderTikTokCard(videoId, oembedData, date) {
  const videoUrl = `https://www.tiktok.com/@${TIKTOK_USERNAME}/video/${videoId}`;
  const title = oembedData?.title || 'TikTok Video';
  const thumbnail = oembedData?.thumbnail_url || null;

  return `
    <article class="group glass-card overflow-hidden p-2">
      <div class="relative rounded-xl overflow-hidden bg-dark-card">
        <blockquote
          class="tiktok-embed"
          cite="${escapeHtml(videoUrl)}"
          data-video-id="${escapeHtml(videoId)}"
          style="max-width:100%;min-width:100%;"
        ><section></section></blockquote>
      </div>
      <div class="px-4 pb-4 pt-3">
        <h3 class="text-[13px] font-bold text-white mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">${escapeHtml(title)}</h3>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
            <i class="fab fa-tiktok text-[8px]"></i> TikTok
          </span>
          <span class="text-white/40 text-[10px] font-medium">${date}</span>
        </div>
      </div>
    </article>
  `;
}

export function renderTikTokCardSkeleton() {
  return `
    <div class="glass-card overflow-hidden p-2">
      <div class="skeleton h-0 pb-[130%] rounded-xl mb-2"></div>
      <div class="px-4 pb-4 pt-3">
        <div class="skeleton h-3.5 w-3/4 mb-1.5"></div>
        <div class="skeleton h-2.5 w-1/3"></div>
      </div>
    </div>
  `;
}

export function renderYouTubeCardSkeleton() {
  return `
    <div class="glass-card overflow-hidden p-2">
      <div class="skeleton h-0 pb-[56.25%] rounded-xl mb-2"></div>
      <div class="px-4 pb-4 pt-3">
        <div class="skeleton h-3.5 w-3/4 mb-1.5"></div>
        <div class="skeleton h-2.5 w-1/3"></div>
      </div>
    </div>
  `;
}

let tiktokEmbedScriptLoaded = false;
export function loadTikTokEmbedScript() {
  if (tiktokEmbedScriptLoaded) {
    if (typeof tiktok !== 'undefined' && tiktok.embed) tiktok.embed();
    return;
  }
  tiktokEmbedScriptLoaded = true;
  const existing = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
  if (existing) {
    if (typeof tiktok !== 'undefined' && tiktok.embed) tiktok.embed();
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://www.tiktok.com/embed.js';
  s.async = true;
  document.body.appendChild(s);
}

export function lazyLoadVideos(container) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.src) {
          el.src = el.dataset.src;
          el.removeAttribute('data-src');
        }
        observer.unobserve(el);
      }
    });
  }, { rootMargin: '300px' });
  container.querySelectorAll('.lazy-video[data-src]').forEach(el => observer.observe(el));
}
