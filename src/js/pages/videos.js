import { fetchPosts, getTitle, getContent, findVideoEmbed, formatDate, escapeHtml } from '../api.js';
import { fetchYouTubeVideos } from '../youtube.js';
import {
  loadTikTokVideos,
  renderYouTubeCard,
  renderTikTokCard,
  renderYouTubeCardSkeleton,
  renderTikTokCardSkeleton,
  lazyLoadVideos,
} from '../components/video-card.js';

export function initVideos() {
  const container = document.getElementById('videosContainer');
  if (!container) return;

  let allVideos = [];
  let currentFilter = 'all';

  const skeleton = Array(6).fill(renderYouTubeCardSkeleton()).join('');
  container.innerHTML = skeleton;

  function renderTabs() {
    const tabsContainer = document.getElementById('videoFilterTabs');
    if (!tabsContainer) return;

    const counts = {
      all: allVideos.length,
      youtube: allVideos.filter(v => v.type === 'youtube').length,
      tiktok: allVideos.filter(v => v.type === 'tiktok').length,
    };

    tabsContainer.innerHTML = `
      <div role="tablist" aria-label="Filter videos by platform" class="flex flex-wrap gap-2">
        <button role="tab" id="tab-all" aria-selected="${currentFilter === 'all'}" aria-controls="videosContainer" class="video-tab ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
          All <span class="video-tab-count">${counts.all}</span>
        </button>
        <button role="tab" id="tab-youtube" aria-selected="${currentFilter === 'youtube'}" aria-controls="videosContainer" class="video-tab ${currentFilter === 'youtube' ? 'active' : ''}" data-filter="youtube">
          <i class="fab fa-youtube text-[11px]"></i> YouTube <span class="video-tab-count">${counts.youtube}</span>
        </button>
        <button role="tab" id="tab-tiktok" aria-selected="${currentFilter === 'tiktok'}" aria-controls="videosContainer" class="video-tab ${currentFilter === 'tiktok' ? 'active' : ''}" data-filter="tiktok">
          <i class="fab fa-tiktok text-[11px]"></i> TikTok <span class="video-tab-count">${counts.tiktok}</span>
        </button>
      </div>
    `;

    tabsContainer.querySelectorAll('.video-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        renderTabs();
        renderGrid();
      });
      // Arrow-key navigation per WAI-ARIA tabs pattern
      btn.addEventListener('keydown', (e) => {
        const tabs = Array.from(tabsContainer.querySelectorAll('[role="tab"]'));
        const idx = tabs.indexOf(btn);
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); next.focus(); next.click(); }
      });
    });
  }

  function renderGrid() {
    const filtered = currentFilter === 'all'
      ? allVideos
      : allVideos.filter(v => v.type === currentFilter);

    if (!filtered.length) {
      container.innerHTML = `
        <div class="col-span-full text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <i class="fas fa-video text-2xl text-white/20"></i>
          </div>
          <h3 class="text-lg font-bold text-white/60 mb-2">No ${currentFilter === 'all' ? '' : currentFilter + ' '}videos yet</h3>
          <p class="text-white/30 text-sm">Check back soon for new content.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(v => {
      if (v.type === 'youtube') {
        return renderYouTubeCard(v.videoId, v.title, v.date);
      }
      if (v.type === 'tiktok') {
        return renderTikTokCard(v.videoId, v.oembedData, v.date);
      }
      return '';
    }).join('');

    lazyLoadVideos(container);
  }

  async function loadAllVideos() {
    try {
      const seenTikTokIds = new Set();

      const [wpPosts, tiktokVideos, ytVideos] = await Promise.all([
        fetchPosts({ number: 50, order_by: 'date', order: 'DESC' }).catch(() => []),
        loadTikTokVideos(seenTikTokIds),
        fetchYouTubeVideos().catch(() => []),
      ]);

      const wpVideos = wpPosts
        .filter(p => findVideoEmbed(getContent(p)) !== null)
        .map(p => {
          const content = getContent(p);
          const video = findVideoEmbed(content);
          if (video.platform === 'tiktok' && video.videoId) {
            if (seenTikTokIds.has(video.videoId)) return null;
            seenTikTokIds.add(video.videoId);
          }
          return {
            type: video.platform,
            videoId: video.videoId || video.url,
            embedUrl: video.embedUrl || null,
            embedHtml: video.embedHtml || null,
            title: getTitle(p),
            date: formatDate(p.date),
          };
        })
        .filter(p => p !== null);

      const youtubeVideos = ytVideos.map(v => ({
        type: 'youtube',
        videoId: v.videoId,
        title: v.title,
        date: v.published ? formatDate(v.published) : '',
      }));

      allVideos = [...tiktokVideos, ...youtubeVideos, ...wpVideos];
      renderTabs();
      renderGrid();
    } catch (err) {
      console.warn('Failed to load videos:', err);
      container.innerHTML = `
        <div class="col-span-full text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <i class="fas fa-exclamation-triangle text-2xl text-red-400"></i>
          </div>
          <h3 class="text-lg font-bold text-white/60 mb-2">Could not load videos</h3>
          <p class="text-white/30 text-sm">Please try refreshing the page.</p>
        </div>
      `;
    }
  }

  loadAllVideos();
}
