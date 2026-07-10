import { initNavbar, initHamburger } from './components/navbar.js';
import { initFooter } from './components/footer.js';
import { initBackToTop } from './utils/backToTop.js';
import { initLazyVideos } from './utils/lazyVideo.js';
import { initAnimations } from './components/animations.js';
import { initDropdowns } from './utils/dropdowns.js';
import { initModals } from './utils/modals.js';
import { initTooltips } from './utils/tooltips.js';
import { initTabs } from './utils/tabs.js';
import { initAccordions } from './utils/accordions.js';

async function loadPartials() {
  const isPagesPath = window.location.pathname.includes('/pages/');
  const partialsBase = isPagesPath ? '../partials' : 'partials';

  // Load navbar
  const navbarTarget = document.querySelector('[data-navbar]');
  if (navbarTarget) {
    try {
      const res = await fetch(`${partialsBase}/navbar.html`);
      if (res.ok) {
        navbarTarget.innerHTML = await res.text();
        // Fix links for pages path
        if (isPagesPath) {
          navbarTarget.querySelectorAll('a[href^="index.html"]').forEach(a => {
            a.setAttribute('href', '../index.html');
          });
          navbarTarget.querySelectorAll('a[href^="pages/"]').forEach(a => {
            a.setAttribute('href', a.getAttribute('href').replace('pages/', ''));
          });
        }
      }
    } catch (e) { console.warn('Failed to load navbar:', e); }
  }

  // Footer is JS-generated, just initialize
  initFooter();
}

document.addEventListener('DOMContentLoaded', async function () {
  // Load partials first
  await loadPartials();

  // Initialize core components
  initNavbar();

  // Initialize utilities
  initBackToTop();
  initLazyVideos();
  initAnimations();
  initDropdowns();
  initModals();
  initTooltips();
  initTabs();
  initAccordions();

  // Initialize page-specific modules
  initPageModules();
});

function initPageModules() {
  const path = window.location.pathname;
  // Normalize: strip .html and trailing slash so clean URLs (/pages/guides) match too
  const norm = path.replace(/\.html$/, '').replace(/\/+$/, '') || '/';

  // Home page modules
  if (norm === '' || norm === '/' || norm.endsWith('/index') || norm === '/index') {
    import('./pages/home.js').then(module => {
      if (module.initHomeGuides) module.initHomeGuides();
      if (module.initHomeVideos) module.initHomeVideos();
    }).catch(err => console.warn('Home modules not loaded:', err));
  }

  // Guides page
  if (norm.endsWith('/guides')) {
    import('./pages/guides.js').then(module => {
      if (module.initGuides) module.initGuides();
    }).catch(err => console.warn('Guides module not loaded:', err));
  }

  // Videos page
  if (norm.endsWith('/videos')) {
    import('./pages/videos.js').then(module => {
      if (module.initVideos) module.initVideos();
    }).catch(err => console.warn('Videos module not loaded:', err));
  }

  // Guide detail page
  if (norm.endsWith('/guide')) {
    import('./pages/guide.js').then(module => {
      if (module.initGuide) module.initGuide();
    }).catch(err => console.warn('Guide module not loaded:', err));
  }

  // Organization page
  if (norm.endsWith('/organization')) {
    import('./pages/organization.js').then(module => {
      if (module.initOrganization) module.initOrganization();
    }).catch(err => console.warn('Organization module not loaded:', err));
  }

  // Contact page
  if (norm.endsWith('/contact')) {
    import('./pages/contact.js').then(module => {
      if (module.initContact) module.initContact();
    }).catch(err => console.warn('Contact module not loaded:', err));
  }

  // About page
  if (norm.endsWith('/about')) {
    import('./pages/about.js').then(module => {
      if (module.initAbout) module.initAbout();
    }).catch(err => console.warn('About module not loaded:', err));
  }
}

// Export for manual initialization if needed
export { initNavbar, initFooter };