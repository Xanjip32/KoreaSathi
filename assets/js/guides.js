(function(){
  const container = document.getElementById('guidesContainer');
  const searchInput = document.getElementById('guidesSearch');
  const sortSelect = document.getElementById('guidesSort');

  const defaultGuides = Array.isArray(window.KOREASATHI_GUIDES) ? window.KOREASATHI_GUIDES.slice() : [];
  let guidesData = defaultGuides.slice();

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  function normalizeUrl(url){
    if(!url) return url;
    if(/^https?:\/\//.test(url)) return url;
    let normalized = url;
    if(normalized.startsWith('/')) normalized = normalized.slice(1);
    if(normalized.startsWith('guides/')) {
      normalized = normalized.replace(/^guides\//, 'assets/guides/');
    }
    const currentPath = window.location.pathname.replace(/\\/g, '/');
    const isInPages = currentPath.includes('/pages/');
    if(isInPages && normalized.startsWith('pages/')){
      return normalized.slice(6);
    }
    if(isInPages && (normalized.startsWith('guides/') || normalized.startsWith('assets/'))){
      return `../${normalized}`;
    }
    return normalized;
  }

  function render(items){
    container.innerHTML = items.map(g=>{
      const badge = g.badge ? `<span class="guide-badge">${escapeHtml(g.badge)}</span>` : '';
      const viewUrl = normalizeUrl(g.viewUrl || '#');
      const downloadUrl = normalizeUrl(g.downloadUrl || viewUrl);
      const pagesLabel = g.pages || 'PDF';

      return `
      <article class="guide-card guide-card-featured">
        ${badge}
        <div class="guide-card-header">
          <div class="guide-pdf-icon">📄</div>
          <span class="guide-category-tag">${escapeHtml((g.category || '').toUpperCase())}</span>
        </div>
        <h3>${escapeHtml(g.title || 'Untitled Guide')}</h3>
        <p>${escapeHtml(g.desc || '')}</p>
        <div class="guide-meta">${escapeHtml(String(pagesLabel))} • ${escapeHtml(g.readTime || '')}</div>
        <div class="guide-actions">
          <a href="${escapeHtml(viewUrl)}" class="guide-btn guide-btn-primary" target="_blank">Open</a>
          <a href="${escapeHtml(downloadUrl)}" class="guide-btn guide-btn-secondary" onclick="event.preventDefault(); downloadGuide(this.href)">Download</a>
        </div>
      </article>
    `}).join('');
  }

  function applyFilters(){
    const q = searchInput.value.trim().toLowerCase();
    let filtered = guidesData.filter(g=> (g.title||'').toLowerCase().includes(q) || (g.desc||'').toLowerCase().includes(q));
    const sort = sortSelect.value;
    if(sort === 'latest') filtered.sort((a,b)=> new Date(b.date)-new Date(a.date));
    if(sort === 'popular') filtered.sort((a,b)=> (b.views||0) - (a.views||0));
    render(filtered);
  }

  function useData(d){
    if(Array.isArray(d)) { guidesData = d.slice(); applyFilters(); }
  }

  useData(defaultGuides);

  searchInput.addEventListener('input', applyFilters);
  sortSelect.addEventListener('change', applyFilters);
})();
