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

});
