// ============================================
// Modals Component
// ============================================

export function initModals() {
  // Modal triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-trigger]');
    if (trigger) {
      e.preventDefault();
      const modalId = trigger.dataset.modalTrigger;
      openModal(modalId);
    }

    const closeTrigger = e.target.closest('[data-modal-close]');
    if (closeTrigger) {
      const modal = closeTrigger.closest('[data-modal]');
      if (modal) closeModal(modal.id);
    }
  });

  // Close on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-modal-overlay]')) {
      const modal = e.target.closest('[data-modal]');
      if (modal) closeModal(modal.id);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('[data-modal].open');
      if (openModal) closeModal(openModal.id);
    }
  });

  // Focus trap
  function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });

    firstElement?.focus();
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const overlay = modal.querySelector('[data-modal-overlay]');
    const content = modal.querySelector('[data-modal-content]');

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Animate
    requestAnimationFrame(() => {
      overlay?.classList.add('opacity-100', 'visible');
      overlay?.classList.remove('opacity-0', 'invisible');
      content?.classList.add('opacity-100', 'scale-100');
      content?.classList.remove('opacity-0', 'scale-95');
    });

    trapFocus(modal);
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const overlay = modal.querySelector('[data-modal-overlay]');
    const content = modal.querySelector('[data-modal-content]');

    overlay?.classList.remove('opacity-100', 'visible');
    overlay?.classList.add('opacity-0', 'invisible');
    content?.classList.remove('opacity-100', 'scale-100');
    content?.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }, 300);
  }
}