(function(){
  const searchEl = document.getElementById('videoSearch');
  const sortEl = document.getElementById('videoSort');
  const ytContainer = document.getElementById('youtubeContainer');
  const ttContainer = document.getElementById('tiktokContainer');

  // Data source: set window.VIDEOS_JSON_URL = 'https://raw.githubusercontent.com/USER/REPO/main/path/videos.json'
  // or add data-json-url attribute to <body> like: <body data-json-url="...">
  const pageJsonUrl = window.VIDEOS_JSON_URL || document.body.dataset.jsonUrl || '';

  const sample = [];

  let videosData = sample.slice();

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  function renderList(items, container){
    if(!items.length){ container.innerHTML = '<p>No results found.</p>'; return; }
    container.innerHTML = items.map(v=>`
      <article class="video-card">
        <div class="video-thumb">${escapeHtml(v.platform.toUpperCase())}</div>
        <div style="padding:8px">
          <h3 style="margin:0 0 6px">${escapeHtml(v.title)}</h3>
          <p style="margin:0 0 8px; color:#666">${escapeHtml(v.desc)}</p>
          <div class="meta">${new Date(v.date).toLocaleDateString()} • ${v.views || 0} views</div>
          <a href="${escapeHtml(v.url || '#')}" class="section-link" style="margin-top:8px;display:inline-block">Watch</a>
        </div>
      </article>
    `).join('');
  }

  function applyFilters(){
    const q = (searchEl.value || '').trim().toLowerCase();
    const sort = sortEl.value;
    let filtered = videosData.filter(v=> (v.title||'').toLowerCase().includes(q) || (v.desc||'').toLowerCase().includes(q));
    if(sort === 'latest') filtered.sort((a,b)=> new Date(b.date) - new Date(a.date));
    if(sort === 'popular') filtered.sort((a,b)=> (b.views||0) - (a.views||0));
    renderList(filtered.filter(v=> v.platform === 'youtube'), ytContainer);
    renderList(filtered.filter(v=> v.platform === 'tiktok'), ttContainer);
  }

  function useData(d){ if(Array.isArray(d)){ videosData = d; applyFilters(); } }

  if(pageJsonUrl){
    fetch(pageJsonUrl).then(r=>{ if(!r.ok) throw new Error('Network error'); return r.json(); })
    .then(json=> useData(json))
    .catch(err=>{ console.warn('Failed to load videos JSON, using sample data', err); useData(sample); });
  } else { useData(sample); }

  searchEl.addEventListener('input', applyFilters);
  sortEl.addEventListener('change', applyFilters);
})();
