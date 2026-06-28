(function(){
  const container = document.getElementById('homeVideosContainer');
  if(!container) return;

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  function formatDate(d){
    try { return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); }
    catch(e){ return d; }
  }

  function findYoutubeEmbed(html){
    var match = html.match(/(?:youtube\.com\/(?:embed|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if(match) return 'https://www.youtube.com/embed/' + match[1];
    return null;
  }

  function findTiktokEmbed(html){
    var match = html.match(/<blockquote[^>]*class="[^"]*tiktok-embed[^"]*"[^>]*>[\s\S]*?<\/blockquote>/i);
    return match ? match[0] : null;
  }

  function renderVideos(posts){
    if(!posts.length){
      container.innerHTML = '<p style="color:#888;text-align:center;grid-column:1/-1;">No videos available yet.</p>';
      return;
    }
    container.innerHTML = posts.map(post => {
      const title = wpDecodeHtml(post.title.rendered);
      const rawHtml = post.content.rendered || '';
      const date = formatDate(post.date);

      const ytUrl = findYoutubeEmbed(rawHtml);
      const tiktokHtml = findTiktokEmbed(rawHtml);

      let embedHtml = '';
      if(ytUrl){
        embedHtml = '<iframe data-src="' + escapeHtml(ytUrl) + '" title="' + escapeHtml(title) + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen class="embedded-video lazy-video"></iframe>';
      } else if(tiktokHtml){
        embedHtml = '<div class="tiktok-embed-wrapper">' + tiktokHtml + '</div>';
      } else {
        return '';
      }

      return '<article class="video-card">' +
        '<div class="video-box">' + embedHtml + '</div>' +
        '<h3>' + escapeHtml(title) + '</h3>' +
        '<p class="meta">' + date + '</p>' +
      '</article>';
    }).join('');

    wpLazyLoadVideos();

    if(typeof tiktok !== 'undefined' && tiktok.embed){
      tiktok.embed();
    } else if(document.querySelector('.tiktok-embed-wrapper')){
      var existing = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      if(!existing){
        var s = document.createElement('script');
        s.src = 'https://www.tiktok.com/embed.js';
        s.async = true;
        document.body.appendChild(s);
      }
    }
  }

  container.innerHTML = '<p style="color:#888;text-align:center;grid-column:1/-1;">Loading videos...</p>';

  wpFetchPosts({ per_page: 10, orderby: 'date', order: 'desc' })
    .then(posts => {
      var videoPosts = posts.filter(function(p){
        var rawHtml = (p.content && p.content.rendered) || '';
        return findYoutubeEmbed(rawHtml) !== null || findTiktokEmbed(rawHtml) !== null;
      });
      renderVideos(videoPosts.slice(0, 3));
    })
    .catch(function(err){
      console.warn('Failed to load videos from WordPress:', err);
      container.innerHTML = '<p style="color:#888;text-align:center;grid-column:1/-1;">Could not load videos.</p>';
    });
})();
