// ============================================
// Lazy Images Component
// IntersectionObserver-based lazy loading
// ============================================

export function initLazyImages() {
  const lazyImages = document.querySelectorAll('.lazy-image img[data-src]');
  const lazyBackgrounds = document.querySelectorAll('.lazy-bg[data-bg]');

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (src) img.src = src;
        if (srcset) img.srcset = srcset;

        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
        img.classList.add('loaded');

        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  const bgObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const bg = el.dataset.bg;
        if (bg) {
          el.style.backgroundImage = `url(${bg})`;
          el.classList.add('loaded');
        }
        observer.unobserve(el);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  lazyImages.forEach(img => imageObserver.observe(img));
  lazyBackgrounds.forEach(el => bgObserver.observe(el));

  // Fallback for browsers without IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    lazyImages.forEach(img => {
      const src = img.dataset.src;
      const srcset = img.dataset.srcset;
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;
      img.classList.add('loaded');
    });
    lazyBackgrounds.forEach(el => {
      const bg = el.dataset.bg;
      if (bg) el.style.backgroundImage = `url(${bg})`;
      el.classList.add('loaded');
    });
  }
}

// Programmatic lazy loading for dynamic content
export function observeLazyElement(element) {
  const images = element.querySelectorAll('.lazy-image img[data-src]');
  const backgrounds = element.querySelectorAll('.lazy-bg[data-bg]');

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        if (src) img.src = src;
        if (srcset) img.srcset = srcset;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px 0px', threshold: 0.01 });

  const bgObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const bg = el.dataset.bg;
        if (bg) el.style.backgroundImage = `url(${bg})`;
        el.classList.add('loaded');
        observer.unobserve(el);
      }
    });
  }, { rootMargin: '50px 0px', threshold: 0.01 });

  images.forEach(img => imageObserver.observe(img));
  backgrounds.forEach(el => bgObserver.observe(el));
}