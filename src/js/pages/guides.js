import { fetchPosts, getTitle, getContent, findPdfUrl, extractText, formatDate, escapeHtml } from '../api.js';

export function initGuides() {
  const container = document.getElementById('guidesContainer');
  if (!container) return;

  function renderSkeleton() {
    container.innerHTML = Array(6).fill(`
      <div class="glass-card p-6">
        <div class="skeleton h-3 w-14 mb-3"></div>
        <div class="skeleton h-9 w-9 rounded-xl mb-2"></div>
        <div class="skeleton h-4 w-3/4 mb-1.5"></div>
        <div class="skeleton h-3 w-full mb-1"></div>
        <div class="skeleton h-3 w-2/3 mb-3"></div>
        <div class="skeleton h-8 w-full rounded-xl"></div>
      </div>
    `).join('');
  }

  renderSkeleton();

  // Load ALL guides dynamically from the WordPress site (not just PDFs)
  fetchPosts({ number: 100, order_by: 'date', order: 'DESC' })
    .then(posts => {
      const mapped = posts.map(post => ({
        id: post.ID,
        title: getTitle(post),
        content: getContent(post),
        pdfUrl: findPdfUrl(getContent(post)),
        url: post.URL || '',
        desc: extractText(getContent(post), 130),
        date: formatDate(post.date),
        categories: post.categories || {}
      }));
      if (window.allGuidePosts === undefined) window.allGuidePosts = [];
      window.allGuidePosts = mapped;
      if (typeof window.applyFilters === 'function') {
        window.applyFilters();
      }
    })
    .catch(err => {
      console.warn('Failed to load guides:', err);
      container.innerHTML = '<p class="text-white/50 text-center col-span-full py-10 text-sm">Could not load guides.</p>';
    });
}
