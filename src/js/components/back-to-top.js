// ============================================
// Back to Top Button
// ============================================

export function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-300 ease-out opacity-0 invisible translate-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>';
  document.body.appendChild(btn);

  let isVisible = false;

  const toggleVisibility = () => {
    const shouldShow = window.scrollY > 300;
    if (shouldShow !== isVisible) {
      isVisible = shouldShow;
      if (isVisible) {
        btn.classList.remove('opacity-0', 'invisible', 'translate-y-4');
        btn.classList.add('opacity-100', 'visible', 'translate-y-0');
      } else {
        btn.classList.add('opacity-0', 'invisible', 'translate-y-4');
        btn.classList.remove('opacity-100', 'visible', 'translate-y-0');
      }
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Keyboard support
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}