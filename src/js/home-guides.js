(function(){
  const container = document.getElementById('homeGuidesContainer');
  const guides = Array.isArray(window.KOREASATHI_GUIDES) ? window.KOREASATHI_GUIDES.slice() : [];

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  function normalizeUrl(url){
    if(!url) return url;
    if(/^https?:\/\//.test(url)) return url;
    let normalized = url;
    if(normalized.startsWith('/')) normalized = normalized.slice(1);
    if(normalized.startsWith('guides/')) {
      normalized = normalized.replace(/^guides\//, 'public/guides/');
    }
    const currentPath = window.location.pathname.replace(/\\/g, '/');
    const isInPages = currentPath.includes('/pages/');
    if(isInPages && normalized.startsWith('pages/')){
      return normalized.slice(6);
    }
    if(isInPages && (normalized.startsWith('guides/') || normalized.startsWith('public/'))){
      return `../${normalized}`;
    }
    return normalized;
  }

  function renderHomeGuides(){
    const sorted = guides.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const topFour = sorted.slice(0, 4);

    container.innerHTML = topFour.map(g => {
      const badge = g.badge ? `<span class="guide-badge">${escapeHtml(g.badge)}</span>` : '';
      const viewUrl = normalizeUrl(g.viewUrl || g.pdfPath || '#');
      const downloadUrl = normalizeUrl(g.downloadUrl || g.pdfPath || viewUrl);
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
          <a href="${escapeHtml(downloadUrl)}" class="guide-btn guide-btn-secondary" download>Download</a>
        </div>
      </article>
      `;
    }).join('');
  }

  renderHomeGuides();
})();
