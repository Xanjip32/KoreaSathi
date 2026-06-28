(function(){
  var loadingEl = document.getElementById('guideLoading');
  var contentEl = document.getElementById('guideContent');
  var errorEl = document.getElementById('guideError');
  if(!contentEl) return;

  var params = new URLSearchParams(window.location.search);
  var postId = params.get('id');

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  function formatDate(d){
    try { return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }); }
    catch(e){ return d; }
  }

  function showError(){
    loadingEl.style.display = 'none';
    contentEl.style.display = 'none';
    errorEl.style.display = 'block';
  }

  function showContent(){
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    contentEl.style.display = 'block';
  }

  if(!postId){
    showError();
    return;
  }

  wpFetchPost(postId)
    .then(function(post){
      var title = wpDecodeHtml(post.title.rendered);
      var rawHtml = post.content.rendered || '';
      var date = formatDate(post.date);

      document.title = title + ' | KoreaSathi';

      var excerpt = post.excerpt && post.excerpt.rendered ? wpStripTags(post.excerpt.rendered).trim() : '';
      if(excerpt){
        var metaDesc = document.querySelector('meta[name="description"]');
        if(metaDesc) metaDesc.setAttribute('content', excerpt.substring(0, 160));
        var ogDesc = document.querySelector('meta[property="og:description"]');
        if(ogDesc) ogDesc.setAttribute('content', excerpt.substring(0, 160));
        var twitterDesc = document.querySelector('meta[property="twitter:description"]');
        if(twitterDesc) twitterDesc.setAttribute('content', excerpt.substring(0, 160));
      }

      var pdfUrl = wpFindPdfUrl(rawHtml);
      var ytUrl = null;
      var tiktokHtml = null;
      var ytMatch = rawHtml.match(/(?:youtube\.com\/(?:embed|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if(ytMatch) ytUrl = 'https://www.youtube.com/embed/' + ytMatch[1];
      var ttMatch = rawHtml.match(/<blockquote[^>]*class="[^"]*tiktok-embed[^"]*"[^>]*>[\s\S]*?<\/blockquote>/i);
      if(ttMatch) tiktokHtml = ttMatch[0];

      var contentHtml = '<article class="guide-full">';

      contentHtml += '<div class="guide-full-header">';
      contentHtml += '<a href="/guides" class="guide-back-link">&larr; All Guides</a>';
      contentHtml += '<h1>' + escapeHtml(title) + '</h1>';
      contentHtml += '<p class="guide-full-date">' + date + '</p>';
      contentHtml += '</div>';

      var cleanContent = rawHtml
        .replace(/<div[\s\S]*?<\/div>/gi, '')
        .replace(/<figure[\s\S]*?<\/figure>/gi, '')
        .replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<object[\s\S]*?<\/object>/gi, '')
        .replace(/<a[^>]*href="[^"]*\.pdf[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
        .trim();

      if(cleanContent){
        contentHtml += '<div class="guide-section guide-text-section">';
        contentHtml += '<div class="guide-body">' + cleanContent + '</div>';
        contentHtml += '</div>';
      }

      if(pdfUrl){
        contentHtml += '<div class="guide-section guide-pdf-section">';
        contentHtml += '<h2>PDF Guide</h2>';
        contentHtml += '<div class="guide-pdf-embed">';
        contentHtml += '<iframe src="' + escapeHtml(pdfUrl) + '" frameborder="0"></iframe>';
        contentHtml += '</div>';
        contentHtml += '<div class="guide-pdf-actions">';
        contentHtml += '<a href="' + escapeHtml(pdfUrl) + '" class="guide-btn guide-btn-primary" target="_blank">Open PDF</a>';
        contentHtml += '<a href="' + escapeHtml(pdfUrl) + '" class="guide-btn guide-btn-secondary" onclick="event.preventDefault(); downloadGuide(this.href)">Download</a>';
        contentHtml += '</div>';
        contentHtml += '</div>';
      }

      if(ytUrl){
        contentHtml += '<div class="guide-section guide-video-section">';
        contentHtml += '<h2>Video</h2>';
        contentHtml += '<div class="guide-video-embed">';
        contentHtml += '<iframe data-src="' + escapeHtml(ytUrl) + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen class="lazy-video"></iframe>';
        contentHtml += '</div>';
        contentHtml += '</div>';
      }

      if(tiktokHtml){
        contentHtml += '<div class="guide-section guide-video-section">';
        contentHtml += '<h2>TikTok Video</h2>';
        contentHtml += '<div class="guide-tiktok-embed">' + tiktokHtml + '</div>';
        contentHtml += '</div>';
      }

      contentHtml += '</article>';

      contentEl.innerHTML = contentHtml;
      showContent();
      wpLazyLoadVideos();

      if(tiktokHtml){
        if(typeof tiktok !== 'undefined' && tiktok.embed){
          tiktok.embed();
        } else {
          var existing = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
          if(!existing){
            var s = document.createElement('script');
            s.src = 'https://www.tiktok.com/embed.js';
            s.async = true;
            document.body.appendChild(s);
          }
        }
      }
    })
    .catch(function(err){
      console.error('Failed to load guide:', err);
      showError();
    });
})();
