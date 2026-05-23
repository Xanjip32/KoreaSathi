document.addEventListener('DOMContentLoaded', () => {
  const footerTarget = document.querySelector('[data-footer]');
  const isPagesPath = window.location.pathname.includes('/pages/');
  const rootPrefix = isPagesPath ? '../' : '';

  if (footerTarget) {
    fetch(`${rootPrefix}partials/footer.html`)
      .then((response) => response.text())
      .then((html) => {
        footerTarget.innerHTML = html;

        footerTarget.querySelectorAll('[data-root-link]').forEach((link) => {
          link.href = `${rootPrefix}index.html`;
        });

        footerTarget.querySelectorAll('[data-page-link]').forEach((link) => {
          link.href = isPagesPath ? link.dataset.pageLink : `pages/${link.dataset.pageLink}`;
        });
      })
      .catch(() => {
        footerTarget.innerHTML = '';
      });
  }

  const hamburger = document.getElementById('hamburger');
  const dropdownMenu = document.getElementById('dropdownMenu');

  if (!hamburger || !dropdownMenu) return;

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('active');
  });

  // Load work permit PDF preview on homepage if wrapper exists
  const pdfWrapper = document.getElementById('workPermitPdf');
  if(pdfWrapper){
    const pdfPath = `${rootPrefix}assets/guides/work_permit/work_permit.pdf`;
    // Check if PDF exists
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
      } else {
        pdfWrapper.innerHTML = '<p>No PDF found. Place your file at <strong>assets/guides/workPermit/work_permit.pdf</strong> to display it here.</p>';
      }
    }).catch(()=>{
      pdfWrapper.innerHTML = '<p>Unable to check for PDF. Place your file at <strong>assets/guides/workPermit/work_permit.pdf</strong>.</p>';
    });
  }

});
