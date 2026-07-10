// ============================================
// Animations Component
// AOS-style scroll animations
// ============================================

export function initAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Only hide animated elements once JS is confirmed running, so content is
  // visible (FCP) and no CLS occurs if JS is slow/blocked.
  document.documentElement.classList.add('js-anim');

  const animatedElements = document.querySelectorAll('[data-aos]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.aosDelay || 0;
        const duration = el.dataset.aosDuration || 700;
        const easing = el.dataset.aosEasing || 'cubic-bezier(0.2, 0, 0, 1)';

        setTimeout(() => {
          el.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.classList.add('aos-animate');
        }, delay);

        observer.unobserve(el);
      }
    });
  }, {
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  });

  // Set initial transform state (opacity handled by .js-anim CSS)
  animatedElements.forEach(el => {
    const animation = el.dataset.aos;
    el.style.transition = 'none';

    switch (animation) {
      case 'fade-up':
      case 'fade-up-right':
      case 'fade-up-left':
        el.style.transform = 'translateY(30px)';
        break;
      case 'fade-down':
        el.style.transform = 'translateY(-30px)';
        break;
      case 'fade-right':
        el.style.transform = 'translateX(-30px)';
        break;
      case 'fade-left':
        el.style.transform = 'translateX(30px)';
        break;
      case 'zoom-in':
        el.style.transform = 'scale(0.9)';
        break;
      case 'zoom-out':
        el.style.transform = 'scale(1.1)';
        break;
      case 'flip-up':
        el.style.transform = 'rotateX(-90deg)';
        el.style.transformOrigin = 'center bottom';
        break;
      default:
        el.style.transform = 'translateY(30px)';
    }

    observer.observe(el);
  });

  // Re-observe on dynamic content (disconnect after 10s — content is static after load)
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const newElements = node.querySelectorAll('[data-aos]');
          newElements.forEach(el => observer.observe(el));
        }
      });
    });
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => mutationObserver.disconnect(), 10000);
}

// Programmatic animation trigger
export function triggerAnimation(element, animation = 'fade-up', delay = 0, duration = 700) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    element.style.opacity = '1';
    element.style.transform = 'none';
    return;
  }

  element.style.opacity = '0';
  element.style.transition = 'none';

  switch (animation) {
    case 'fade-up':
      element.style.transform = 'translateY(30px)';
      break;
    case 'fade-down':
      element.style.transform = 'translateY(-30px)';
      break;
    case 'fade-right':
      element.style.transform = 'translateX(-30px)';
      break;
    case 'fade-left':
      element.style.transform = 'translateX(30px)';
      break;
    case 'zoom-in':
      element.style.transform = 'scale(0.9)';
      break;
    case 'zoom-out':
      element.style.transform = 'scale(1.1)';
      break;
  }

  setTimeout(() => {
    element.style.transition = `opacity ${duration}ms cubic-bezier(0.2, 0, 0, 1), transform ${duration}ms cubic-bezier(0.2, 0, 0, 1)`;
    element.style.opacity = '1';
    element.style.transform = 'none';
  }, delay);
}