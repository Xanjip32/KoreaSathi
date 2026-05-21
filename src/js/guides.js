(function(){
  const container = document.getElementById('guidesContainer');
  const searchInput = document.getElementById('guidesSearch');
  const sortSelect = document.getElementById('guidesSort');

  // Data source: set window.GUIDES_JSON_URL = 'https://raw.githubusercontent.com/USER/REPO/main/path/guides.json'
  // or add data-json-url attribute to <body> like: <body data-json-url="...">
  const pageJsonUrl = window.GUIDES_JSON_URL || document.body.dataset.jsonUrl || '';

  const sampleGuides = [
    {id:1, slug:'work-permit', title:'How to Make a Work Permit', desc:'Step-by-step HiKorea guide for international students in Korea.', date:'2026-05-22', views:0, category:'work'}
  ];

  let guidesData = sampleGuides.slice();

  function render(items){
    container.innerHTML = items.map(g=>{
      const pdfPath = `../public/guides/work_permit/work_permit.pdf`;
      return `
      <article class="guide-card">
        <h3>${escapeHtml(g.title)}</h3>
        <p>${escapeHtml(g.desc)}</p>
        <div class="guide-meta">${new Date(g.date).toLocaleDateString()} • ${g.views || 0} views</div>
        <a href="${pdfPath}" class="section-link" style="margin-top:8px;display:inline-block" target="_blank">Open guide (PDF)</a>
      </article>
    `}).join('');
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  function applyFilters(){
    const q = searchInput.value.trim().toLowerCase();
    let filtered = guidesData.filter(g=> (g.title||'').toLowerCase().includes(q) || (g.desc||'').toLowerCase().includes(q));
    const sort = sortSelect.value;
    if(sort === 'latest') filtered.sort((a,b)=> new Date(b.date)-new Date(a.date));
    if(sort === 'popular') filtered.sort((a,b)=> (b.views||0) - (a.views||0));
    render(filtered);
  }

  function useData(d){
    if(Array.isArray(d)) { guidesData = d; applyFilters(); }
  }

  if(pageJsonUrl){
    fetch(pageJsonUrl).then(r=>{
      if(!r.ok) throw new Error('Network response not ok');
      return r.json();
    }).then(json=>{
      useData(json);
    }).catch(err=>{
      console.warn('Failed to load guides JSON, using sample data', err);
      useData(sampleGuides);
    });
  } else {
    useData(sampleGuides);
  }

  searchInput.addEventListener('input', applyFilters);
  sortSelect.addEventListener('change', applyFilters);
})();
