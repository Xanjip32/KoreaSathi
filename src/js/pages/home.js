import { fetchPosts, getTitle, getContent, findPdfUrl, extractText, findVideoEmbed, formatDate, escapeHtml, downloadFile } from '../api.js';
import {
  loadTikTokVideos,
  renderYouTubeCard,
  renderTikTokCard,
  renderYouTubeCardSkeleton,
  renderTikTokCardSkeleton,
  lazyLoadVideos,
} from '../components/video-card.js';

export function initHomeGuides() {
  const container = document.getElementById('homeGuidesContainer');
  if (!container) return;

  const skeleton = Array(4).fill(`
    <div class="glass-card p-6">
      <div class="skeleton h-3 w-14 mb-3"></div>
      <div class="skeleton h-9 w-9 rounded-xl mb-2"></div>
      <div class="skeleton h-4 w-3/4 mb-1.5"></div>
      <div class="skeleton h-3 w-full mb-1"></div>
      <div class="skeleton h-3 w-2/3 mb-3"></div>
      <div class="skeleton h-8 w-full rounded-xl"></div>
    </div>
  `).join('');
  container.innerHTML = skeleton;

  function renderGuides(posts) {
    if (!posts.length) {
      container.innerHTML = '<p class="text-white/50 text-center col-span-full py-10 text-sm">No guides available yet.</p>';
      return;
    }
    container.innerHTML = posts.map(post => {
      const title = getTitle(post);
      const content = getContent(post);
      const pdfUrl = findPdfUrl(content);
      const desc = extractText(content, 130);
      const date = formatDate(post.date);
      if (!pdfUrl) return '';
      return `
        <article class="group glass-card p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <span class="badge-new"><i class="fas fa-file-pdf text-[10px]"></i> PDF</span>
            <span class="text-xs text-white/40 font-medium">${date}</span>
          </div>
          <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm mb-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-file-alt"></i>
          </div>
          <h3 class="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">${escapeHtml(title)}</h3>
          <p class="text-white/50 text-xs leading-relaxed mb-5 line-clamp-2 flex-1">${escapeHtml(desc)}</p>
          <div class="flex gap-2 mt-auto">
            <a href="${escapeHtml(pdfUrl)}" class="flex-1 text-center btn-primary btn-sm" target="_blank" rel="noopener">Open</a>
            <button class="flex-1 text-center btn-outline btn-sm" data-pdf-url="${escapeHtml(pdfUrl)}" data-pdf-title="${escapeHtml(title)}" data-action="download-pdf">Download</button>
          </div>
        </article>
      `;
    }).join('');
  }

  window.downloadPdf = function(url, title) {
    const name = (title || 'guide').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
    downloadFile(url, name);
  };

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="download-pdf"]');
    if (!btn) return;
    window.downloadPdf(btn.dataset.pdfUrl, btn.dataset.pdfTitle);
  });

  fetchPosts({ number: 30, order_by: 'date', order: 'DESC' })
    .then(posts => {
      const pdfs = posts.filter(p => findPdfUrl(getContent(p)) !== null);
      renderGuides(pdfs);
    })
    .catch(err => {
      console.warn('Failed to load guides:', err);
      container.innerHTML = '<p class="text-white/30 text-center col-span-full py-10 text-sm">Could not load guides.</p>';
    });
}

export function initHomeVideos() {
  const container = document.getElementById('homeVideosContainer');
  if (!container) return;

  container.innerHTML = Array(4).fill(renderYouTubeCardSkeleton()).join('');

  const seenVideoIds = new Set();

  async function loadVideos() {
    try {
      const [wpPosts, tiktokVideos] = await Promise.all([
        fetchPosts({ number: 20, order_by: 'date', order: 'DESC' }).catch(() => []),
        loadTikTokVideos(seenVideoIds),
      ]);

      const wpVideos = wpPosts
        .filter(p => {
          const content = getContent(p);
          const video = findVideoEmbed(content);
          if (!video) return false;
          if (video.platform === 'tiktok' && video.videoId) {
            if (seenVideoIds.has(video.videoId)) return false;
            seenVideoIds.add(video.videoId);
          }
          return true;
        })
        .map(p => {
          const content = getContent(p);
          const video = findVideoEmbed(content);
          return {
            type: video.platform,
            videoId: video.videoId || video.url,
            embedUrl: video.embedUrl || null,
            embedHtml: video.embedHtml || null,
            title: getTitle(p),
            date: formatDate(p.date),
          };
        });

      const allVideos = [...tiktokVideos, ...wpVideos].slice(0, 4);

      if (!allVideos.length) {
        container.innerHTML = '<p class="text-white/30 text-center col-span-full py-10 text-sm">No videos available yet.</p>';
        return;
      }

      container.innerHTML = allVideos.map(v => {
        if (v.type === 'youtube') {
          const videoId = v.embedUrl?.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1] || v.videoId;
          return renderYouTubeCard(videoId, v.title, v.date);
        }
        if (v.type === 'tiktok') {
          return renderTikTokCard(v.videoId, v.oembedData, v.date);
        }
        return '';
      }).join('');

      lazyLoadVideos(container);
    } catch (err) {
      console.warn('Failed to load videos:', err);
      container.innerHTML = '<p class="text-white/30 text-center col-span-full py-10 text-sm">Could not load videos.</p>';
    }
  }

  loadVideos();
}
