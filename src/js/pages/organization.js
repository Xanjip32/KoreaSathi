import { fetchPosts, getTitle, getContent, formatDate, escapeHtml } from '../api.js';

export function initOrganization() {
  const container = document.getElementById('organizationContainer');
  if (!container) return;

  container.innerHTML = Array(4).fill(`
    <div class="glass-card p-6"><div class="skeleton h-12 w-12 rounded-xl mb-3"></div><div class="skeleton h-4 w-3/4 mb-2"></div><div class="skeleton h-3 w-full mb-1"></div><div class="skeleton h-3 w-2/3"></div></div>
  `).join('');

  fetchPosts({ number: 20, category: 'organization' })
    .then(posts => {
      if (!posts.length) {
        container.innerHTML = '<p class="text-white/50 text-center col-span-full py-10 text-sm">No organizations listed yet.</p>';
        return;
      }
      container.innerHTML = posts.map(post => {
        const title = getTitle(post);
        const desc = escapeHtml(getContent(post).replace(/<[^>]+>/g, '').substring(0, 150));
        return `
          <article class="group glass-card p-6">
            <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm mb-4 group-hover:scale-110 transition-transform"><i class="fas fa-building"></i></div>
            <h3 class="text-sm font-bold text-white mb-2 group-hover:text-primary transition-colors">${escapeHtml(title)}</h3>
            <p class="text-white/50 text-xs leading-relaxed line-clamp-3">${desc}</p>
          </article>
        `;
      }).join('');
    })
    .catch(err => {
      console.warn('Failed to load organizations:', err);
      container.innerHTML = '<p class="text-white/50 text-center col-span-full py-10 text-sm">Could not load organizations.</p>';
    });
}