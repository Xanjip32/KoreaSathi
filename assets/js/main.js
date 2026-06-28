/**
 * WordPress REST API helpers with localStorage caching
 */
const WP_API_BASE = 'http://korea-sathiwp.local/wp-json/wp/v2';
const CACHE_TTL = 5 * 60 * 1000;

function wpCacheGet(key) {
  try {
    const raw = localStorage.getItem('wp_cache_' + key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.ts > CACHE_TTL) {
      localStorage.removeItem('wp_cache_' + key);
      return null;
    }
    return item.data;
  } catch (e) { return null; }
}

function wpCacheSet(key, data) {
  try {
    localStorage.setItem('wp_cache_' + key, JSON.stringify({ ts: Date.now(), data }));
  } catch (e) {}
}

async function wpFetchPosts(params = {}) {
  const query = new URLSearchParams({
    per_page: params.per_page || 10,
    orderby: params.orderby || 'date',
    order: params.order || 'desc',
    _fields: 'id,title,date,link,content,excerpt,categories',
    ...params
  });
  const cacheKey = 'posts_' + query.toString();
  const cached = wpCacheGet(cacheKey);
  if (cached) return cached;
  const res = await fetch(`${WP_API_BASE}/posts?${query}`);
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  const data = await res.json();
  wpCacheSet(cacheKey, data);
  return data;
}

async function wpFetchCategories() {
  const cacheKey = 'categories';
  const cached = wpCacheGet(cacheKey);
  if (cached) return cached;
  const res = await fetch(`${WP_API_BASE}/categories?per_page=100&_fields=id,name,slug,count`);
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  const data = await res.json();
  wpCacheSet(cacheKey, data);
  return data;
}

async function wpFetchPost(id) {
  const cacheKey = 'post_' + id;
  const cached = wpCacheGet(cacheKey);
  if (cached) return cached;
  const res = await fetch(`${WP_API_BASE}/posts/${id}?_fields=id,title,date,link,content,excerpt,categories`);
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  const data = await res.json();
  wpCacheSet(cacheKey, data);
  return data;
}

function wpDecodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function wpStripTags(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function wpFindPdfUrl(html) {
  const objMatch = html.match(/<object[^>]*data="([^"]*\.pdf[^"]*)"[^>]*>/i);
  if (objMatch) return objMatch[1];
  const linkMatch = html.match(/<a[^>]*href="([^"]*\.pdf[^"]*)"[^>]*download/i);
  if (linkMatch) return linkMatch[1];
  const anyMatch = html.match(/href="([^"]*\.pdf[^"]*)"/i);
  if (anyMatch) return anyMatch[1];
  return null;
}

function wpFindVideoEmbed(html) {
  const ytMatch = html.match(/(?:youtube\.com\/(?:embed|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { platform: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`, videoId: ytMatch[1] };
  const ttBlockquote = html.match(/<blockquote[^>]*class="[^"]*tiktok-embed[^"]*"[^>]*>/i);
  if (ttBlockquote) {
    const urlMatch = html.match(/cite="([^"]*)"/i);
    return { platform: 'tiktok', url: urlMatch ? urlMatch[1] : null, embedHtml: ttBlockquote[0] };
  }
  const ttLink = html.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (ttLink) return { platform: 'tiktok', url: ttLink[0] };
  return null;
}

function wpExtractText(html) {
  return wpStripTags(html).trim().substring(0, 200);
}

/**
 * Lazy load videos with Intersection Observer
 */
function wpLazyLoadVideos() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const src = el.dataset.src;
        if (src) {
          el.src = src;
          el.removeAttribute('data-src');
          el.classList.remove('lazy-video');
        }
        observer.unobserve(el);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('iframe[data-src]').forEach(iframe => {
    observer.observe(iframe);
  });
}

/**
 * Reliable PDF download
 */
async function downloadGuide(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || url.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.warn('Download fallback to direct open', err);
    window.open(url, '_blank');
  }
}

/**
 * Back to top button
 */
function wpInitBackToTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '&uarr;';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.style.cssText = 'display:none;position:fixed;bottom:30px;right:30px;z-index:999;width:48px;height:48px;border-radius:50%;border:none;background:#0b74de;color:#fff;font-size:1.5rem;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:opacity 0.3s,transform 0.3s;';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.style.display = 'block';
      setTimeout(() => { btn.style.opacity = '1'; btn.style.transform = 'translateY(0)'; }, 10);
    } else {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(20px)';
      setTimeout(() => { btn.style.display = 'none'; }, 300);
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const footerTarget = document.querySelector('[data-footer]');
  const navbarTarget = document.querySelector('[data-navbar]');
  const isPagesPath = window.location.pathname.includes('/pages/');
  const rootPrefix = isPagesPath ? '../' : '';

  function processLinks(container) {
    if (!container) return;

    container.querySelectorAll('[data-root-link]').forEach((link) => {
      link.href = `${rootPrefix}index.html`;
    });

    container.querySelectorAll('[data-page-link]').forEach((link) => {
      const page = link.dataset.pageLink;
      link.href = isPagesPath ? page : `pages/${page}`;
    });

    container.querySelectorAll('[data-asset-link]').forEach((asset) => {
      const path = asset.dataset.assetLink;
      if (asset.tagName === 'IMG') {
        asset.src = `${rootPrefix}assets/${path}`;
      } else {
        asset.href = `${rootPrefix}assets/${path}`;
      }
    });
  }

  if (navbarTarget) {
    fetch(`${rootPrefix}partials/navbar.html`)
      .then((response) => response.text())
      .then((html) => {
        navbarTarget.innerHTML = html;
        processLinks(navbarTarget);
        initHamburger();
      })
      .catch((err) => console.error('Navbar injection failed:', err));
  }

  if (footerTarget) {
    fetch(`${rootPrefix}partials/footer.html`)
      .then((response) => response.text())
      .then((html) => {
        footerTarget.innerHTML = html;
        processLinks(footerTarget);
      })
      .catch(() => {
        footerTarget.innerHTML = '';
      });
  }

  function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (!hamburger || !dropdownMenu) return;

    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);

    newHamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('active');
    });
  }

  initHamburger();
  wpInitBackToTop();
  wpLazyLoadVideos();

  const pdfWrapper = document.getElementById('workPermitPdf');
  if(pdfWrapper){
    const pdfPath = `${rootPrefix}assets/guides/work_permit/work_permit.pdf`;
    fetch(pdfPath, { method: 'HEAD' }).then(res=>{
      if(res.ok){
        pdfWrapper.innerHTML = `
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <iframe src="${pdfPath}#view=FitH" style="width:360px;height:420px;border:0;border-radius:6px;overflow:hidden"></iframe>
            <div style="flex:1">
              <h3 style="margin:0 0 8px">How to Make a Work Permit</h3>
              <p style="color:#666;margin:0">Step-by-step HiKorea guide for international students in Korea. You can download or open the full PDF.</p>
              <p style="margin-top:12px"><a href="${pdfPath}" class="section-link" target="_blank">Open PDF</a> • <a href="${pdfPath}" download class="section-link">Download</a></p>
            </div>
          </div>
        `;
      }
    });
  }

});
