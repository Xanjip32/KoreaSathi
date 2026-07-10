export function initNavbar() {
  const navbar = document.getElementById('siteNavbar');
  const glassBg = navbar?.querySelector('.navbar-glass-bg');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const hamburger = document.getElementById('hamburger');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileMenuLinks = mobileMenu?.querySelectorAll('[data-page-link], [data-root-link]');

  // Scroll effect
  function handleScroll() {
    if (!navbar || !glassBg) return;

    if (window.scrollY > 20) {
      navbar.classList.add('navbar-scrolled');
      glassBg.style.opacity = '1';
      glassBg.style.transform = 'translateY(0)';
    } else {
      navbar.classList.remove('navbar-scrolled');
      glassBg.style.opacity = '0.85';
      glassBg.style.transform = 'translateY(0)';
    }
  }

  // Mobile menu
  function openMobileMenu() {
    if (!mobileMenu || !mobileMenuOverlay || !hamburger) return;

    mobileMenu.removeAttribute('inert');
    mobileMenuOverlay.removeAttribute('inert');
    mobileMenuOverlay.classList.remove('hidden');
    mobileMenu.classList.remove('translate-x-full');
    mobileMenuOverlay.style.opacity = '1';
    mobileMenu.style.transform = 'translateX(0)';
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog
    mobileMenuClose?.focus();

    // Focus trap inside the dialog
    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = mobileMenu.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    mobileMenu._trapFocus = trapFocus;
    mobileMenu.addEventListener('keydown', trapFocus);

    // Animate items
    mobileMenuLinks?.forEach((link, index) => {
      link.style.animation = 'none';
      link.offsetHeight; // Trigger reflow
      link.style.animation = `menuIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50 + 50}ms forwards`;
    });
  }

  function closeMobileMenu() {
    if (!mobileMenu || !mobileMenuOverlay || !hamburger) return;

    mobileMenuOverlay.style.opacity = '0';
    mobileMenu.style.transform = 'translateX(100%)';
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    setTimeout(() => {
      mobileMenuOverlay.classList.add('hidden');
      mobileMenu.classList.add('translate-x-full');
      mobileMenu.setAttribute('inert', '');
      mobileMenuOverlay.setAttribute('inert', '');
      if (mobileMenu._trapFocus) {
        mobileMenu.removeEventListener('keydown', mobileMenu._trapFocus);
        mobileMenu._trapFocus = null;
      }
      hamburger.focus();
    }, 300);
  }

  // Event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });

  hamburger?.addEventListener('click', openMobileMenu);
  mobileMenuClose?.addEventListener('click', closeMobileMenu);
  mobileMenuOverlay?.addEventListener('click', closeMobileMenu);

  // Close on link click
  mobileMenuLinks?.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
      closeMobileMenu();
    }
  };
  document.addEventListener('keydown', onKeyDown);

  // Handle root/page links
  handleNavLinks();

  // Initial scroll check
  handleScroll();
}

function handleNavLinks() {
  const isPagesPath = window.location.pathname.includes('/pages/');
  const rootPrefix = isPagesPath ? '../' : '';

  document.querySelectorAll('[data-root-link]').forEach(link => {
    link.href = rootPrefix + 'index.html';
  });

  document.querySelectorAll('[data-page-link]').forEach(link => {
    const page = link.dataset.pageLink;
    link.href = isPagesPath ? page : 'pages/' + page;
  });

  // Set aria-current=page on active nav link
  const currentPath = window.location.pathname.replace(/\/+$/, '').replace(/\.html$/, '');
  document.querySelectorAll('[data-page-link]').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkPath = href.replace(/\.html$/, '').replace(/\/+$/, '');
    if (currentPath.endsWith(linkPath) && linkPath !== '') {
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('[data-asset-link]').forEach(asset => {
    const path = asset.dataset.assetLink;
    if (asset.tagName === 'IMG') {
      asset.src = rootPrefix + 'assets/' + path;
    } else {
      asset.href = rootPrefix + 'assets/' + path;
    }
  });
}

export function initHamburger() {
  // Hamburger animation handled in initNavbar
  // This is kept for compatibility
}