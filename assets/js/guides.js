(function(){
  const container = document.getElementById('guidesCategoriesContainer');
  const searchInput = document.getElementById('guidesSearch');
  if(!container) return;

  let allPosts = [];
  let categories = [];
  let categoryMap = {};

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  function formatDate(d){
    try { return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); }
    catch(e){ return d; }
  }

  function getPostType(post){
    var rawHtml = (post.content && post.content.rendered) || '';
    if(wpFindPdfUrl(rawHtml)) return 'pdf';
    if(wpFindVideoEmbed(rawHtml)) return 'video';
    return 'text';
  }

  function getTypeIcon(type){
    if(type === 'pdf') return '&#x1F4C4;';
    if(type === 'video') return '&#x1F3AC;';
    return '&#x1F4DD;';
  }

  function getTypeBadge(type){
    if(type === 'pdf') return '<span class="guide-type-badge guide-type-pdf">PDF</span>';
    if(type === 'video') return '<span class="guide-type-badge guide-type-video">Video</span>';
    return '<span class="guide-type-badge guide-type-text">Article</span>';
  }

  function renderCategorySection(catName, posts){
    var cards = posts.map(function(post){
      var title = wpDecodeHtml(post.title.rendered);
      var desc = wpExtractText(post.content.rendered || '');
      var date = formatDate(post.date);
      var type = getPostType(post);
      var icon = getTypeIcon(type);
      var badge = getTypeBadge(type);

      return '<a href="guide.html?id=' + post.id + '" class="guide-mini-card">' +
        '<div class="guide-mini-header">' +
          '<span class="guide-mini-icon">' + icon + '</span>' +
          badge +
        '</div>' +
        '<h4>' + escapeHtml(title) + '</h4>' +
        '<p>' + escapeHtml(desc) + '</p>' +
        '<span class="guide-mini-date">' + date + '</span>' +
      '</a>';
    }).join('');

    return '<section class="guide-category-section">' +
      '<div class="guide-category-header">' +
        '<h2>' + escapeHtml(catName) + '</h2>' +
        '<span class="guide-count">' + posts.length + ' guide' + (posts.length !== 1 ? 's' : '') + '</span>' +
      '</div>' +
      '<div class="guide-category-grid">' + cards + '</div>' +
    '</section>';
  }

  function renderAll(filter){
    var q = (filter || '').toLowerCase();
    var filtered = allPosts;
    if(q){
      filtered = allPosts.filter(function(p){
        var title = wpDecodeHtml(p.title.rendered).toLowerCase();
        return title.includes(q);
      });
    }

    var grouped = {};
    filtered.forEach(function(post){
      var catIds = post.categories || [];
      catIds.forEach(function(catId){
        var catName = categoryMap[catId] || 'Uncategorized';
        if(!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(post);
      });
    });

    var catNames = Object.keys(grouped).sort();
    if(!catNames.length){
      container.innerHTML = '<p style="color:#888;text-align:center;">No guides found.</p>';
      return;
    }

    container.innerHTML = catNames.map(function(name){
      return renderCategorySection(name, grouped[name]);
    }).join('');
  }

  container.innerHTML = '<p style="color:#888;text-align:center;">Loading guides...</p>';

  Promise.all([
    wpFetchPosts({ per_page: 50, orderby: 'date', order: 'desc' }),
    wpFetchCategories()
  ])
  .then(function(results){
    allPosts = results[0];
    categories = results[1];
    categoryMap = {};
    categories.forEach(function(cat){ categoryMap[cat.id] = cat.name; });
    renderAll('');
  })
  .catch(function(err){
    console.error('Failed to load guides:', err);
    container.innerHTML = '<p style="color:#888;text-align:center;">Could not load guides.</p>';
  });

  if(searchInput){
    searchInput.addEventListener('input', function(){
      renderAll(searchInput.value.trim());
    });
  }
})();
