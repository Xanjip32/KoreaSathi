// ============================================
// Modals Utility
// ============================================

export function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
  const modalCloses = document.querySelectorAll('[data-modal-close]');
  const modalOverlays = document.querySelectorAll('[data-modal-overlay]');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.dataset.modalTrigger;
      const modal = document.getElementById(modalId);
      if (modal) openModal(modal);
    });
  });

  modalCloses.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const modal = closeBtn.closest('[data-modal]');
      if (modal) closeModal(modal);
    });
  });

  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', () => {
      const modal = overlay.closest('[data-modal]');
      if (modal) closeModal(modal);
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('[data-modal].open');
      if (openModal) closeModal(openModal);
    }
  });

  function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus trap
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal._focusTrap = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', modal._focusTrap);
    firstElement?.focus();
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (modal._focusTrap) {
      document.removeEventListener('keydown', modal._focusTrap);
      modal._focusTrap = null;
    }
  }
}