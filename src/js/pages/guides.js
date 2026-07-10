import { fetchPosts, getTitle, getContent, findPdfUrl, extractText, formatDate, escapeHtml, downloadFile } from '../api.js';

let allGuidePosts = [];
const listeners = new Set();

export function getGuidePosts() {
  return allGuidePosts;
}

export function onGuidesLoaded(cb) {
  listeners.add(cb);
  if (allGuidePosts.length) cb(allGuidePosts);
  return () => listeners.delete(cb);
}

export function initGuides() {
  const container = document.getElementById('guidesContainer');
  if (!container) return;

  window.downloadPdf = function(url, title) {
    const name = (title || 'guide').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
    downloadFile(url, name);
  };

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

  fetchPosts({ number: 100, order_by: 'date', order: 'DESC' })
    .then(posts => {
      allGuidePosts = posts.map(post => ({
        id: post.ID,
        title: getTitle(post),
        content: getContent(post),
        pdfUrl: findPdfUrl(getContent(post)),
        url: post.URL || '',
        desc: extractText(getContent(post), 130),
        date: formatDate(post.date),
        categories: post.categories || {}
      }));
      listeners.forEach(cb => cb(allGuidePosts));
      window.dispatchEvent(new CustomEvent('guides:loaded', { detail: allGuidePosts }));
    })
    .catch(err => {
      console.warn('Failed to load guides:', err);
      container.innerHTML = '<p class="text-white/50 text-center col-span-full py-10 text-sm">Could not load guides.</p>';
    });
}
