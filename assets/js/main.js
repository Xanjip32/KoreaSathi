/**
 * Reliable PDF download - fetches as blob to force download in all browsers
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

document.addEventListener('DOMContentLoaded', () => {
  const footerTarget = document.querySelector('[data-footer]');
  const navbarTarget = document.querySelector('[data-navbar]');
  const isPagesPath = window.location.pathname.includes('/pages/');
  const rootPrefix = isPagesPath ? '../' : '';

  function processLinks(container) {
    if (!container) return;

    // Handle root links (index.html)
    container.querySelectorAll('[data-root-link]').forEach((link) => {
      link.href = `${rootPrefix}index.html`;
    });

    // Handle page links (about.html, etc.)
    container.querySelectorAll('[data-page-link]').forEach((link) => {
      const page = link.dataset.pageLink;
      link.href = isPagesPath ? page : `pages/${page}`;
    });

    // Handle asset links (images, icons)
    container.querySelectorAll('[data-asset-link]').forEach((asset) => {
      const path = asset.dataset.assetLink;
      if (asset.tagName === 'IMG') {
        asset.src = `${rootPrefix}assets/${path}`;
      } else {
        asset.href = `${rootPrefix}assets/${path}`;
      }
    });
  }

  // Inject Navbar
  if (navbarTarget) {
    fetch(`${rootPrefix}partials/navbar.html`)
      .then((response) => response.text())
      .then((html) => {
        navbarTarget.innerHTML = html;
        processLinks(navbarTarget);
        initHamburger(); // Re-initialize hamburger events after injection
      })
      .catch((err) => console.error('Navbar injection failed:', err));
  }

  // Inject Footer
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

    // Remove existing listeners if any (to avoid duplicates)
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

  // Initial call for case where nav might be hardcoded or already present
  initHamburger();

  // Load work permit PDF preview on homepage if wrapper exists
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
