(function(){
  const container = document.getElementById('homeGuidesContainer');
  if(!container) return;

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  function formatDate(d){
    try { return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); }
    catch(e){ return d; }
  }

  function renderGuides(posts){
    if(!posts.length){
      container.innerHTML = '<p style="color:#888;text-align:center;grid-column:1/-1;">No guides available yet.</p>';
      return;
    }
    container.innerHTML = posts.map(post => {
      const title = wpDecodeHtml(post.title.rendered);
      const rawHtml = post.content.rendered || '';
      const pdfUrl = wpFindPdfUrl(rawHtml);
      const desc = wpExtractText(rawHtml);
      const date = formatDate(post.date);

      return `
      <article class="guide-card guide-card-featured">
        <span class="guide-badge">PDF Guide</span>
        <div class="guide-card-header">
          <div class="guide-pdf-icon">&#x1F4C4;</div>
        </div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(desc)}</p>
        <div class="guide-meta">${date}</div>
        <div class="guide-actions">
          ${pdfUrl ? `<a href="${escapeHtml(pdfUrl)}" class="guide-btn guide-btn-primary" target="_blank">Open</a>` : ''}
          ${pdfUrl ? `<a href="${escapeHtml(pdfUrl)}" class="guide-btn guide-btn-secondary" onclick="event.preventDefault(); downloadGuide(this.href)">Download</a>` : ''}
        </div>
      </article>`;
    }).join('');
  }

  container.innerHTML = '<p style="color:#888;text-align:center;grid-column:1/-1;">Loading guides...</p>';

  wpFetchPosts({ per_page: 10, orderby: 'date', order: 'desc' })
    .then(posts => {
      const pdfPosts = posts.filter(p => {
        const rawHtml = (p.content && p.content.rendered) || '';
        return wpFindPdfUrl(rawHtml) !== null;
      });
      renderGuides(pdfPosts.slice(0, 3));
    })
    .catch(err => {
      console.warn('Failed to load guides from WordPress:', err);
      container.innerHTML = '<p style="color:#888;text-align:center;grid-column:1/-1;">Could not load guides.</p>';
    });
})();
