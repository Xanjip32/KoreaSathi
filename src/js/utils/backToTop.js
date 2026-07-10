// ============================================
// Back to Top Button
// ============================================

export function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(btn);

  let isVisible = false;

  const toggleVisibility = () => {
    const shouldShow = window.scrollY > 300;
    if (shouldShow !== isVisible) {
      isVisible = shouldShow;
      btn.classList.toggle('visible', isVisible);
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}