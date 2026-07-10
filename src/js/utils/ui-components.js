// ============================================================================
// Consolidated UI Component Utilities
// Handles BackToTop, Dropdowns, Modals, Accordions, Tabs, and Tooltips
// ============================================================================

// --- 1. Back to Top Button ---
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

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: scrollBehavior });
  });
}

// --- 2. Dropdowns Utility ---
export function initDropdowns() {
  const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');
  const openStates = new WeakMap();

  dropdownTriggers.forEach(trigger => {
    const dropdown = document.getElementById(trigger.dataset.dropdownTrigger);
    if (!dropdown) return;

    let closeTimeout;
    let isOpen = false;
    openStates.set(trigger, { dropdown, closeTimeout: null });

    const open = () => {
      clearTimeout(closeTimeout);
      dropdown.classList.remove('opacity-0', 'invisible', 'translate-y-1');
      dropdown.classList.add('opacity-100', 'visible', 'translate-y-0');
      trigger.setAttribute('aria-expanded', 'true');
      isOpen = true;
    };

    const close = () => {
      closeTimeout = setTimeout(() => {
        dropdown.classList.add('opacity-0', 'invisible', 'translate-y-1');
        dropdown.classList.remove('opacity-100', 'visible', 'translate-y-0');
        trigger.setAttribute('aria-expanded', 'false');
        isOpen = false;
      }, 150);
    };

    trigger.addEventListener('mouseenter', open);
    trigger.addEventListener('focus', open);
    dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimeout));

    trigger.addEventListener('mouseleave', close);
    trigger.addEventListener('blur', close);
    dropdown.addEventListener('mouseleave', close);

    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', (e) => {
    dropdownTriggers.forEach(trigger => {
      const dropdown = document.getElementById(trigger.dataset.dropdownTrigger);
      if (!dropdown) return;
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('opacity-0', 'invisible', 'translate-y-1');
        dropdown.classList.remove('opacity-100', 'visible', 'translate-y-0');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// --- 3. Modals Utility ---
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

// --- 4. Accordions Utility ---
export function initAccordions() {
  const accordions = document.querySelectorAll('[data-accordion]');

  accordions.forEach(accordion => {
    const headers = accordion.querySelectorAll('[data-accordion-header]');

    headers.forEach(header => {
      const panel = header.nextElementSibling;
      const icon = header.querySelector('[data-accordion-icon]');
      const isOpen = header.getAttribute('aria-expanded') === 'true';

      if (!isOpen) {
        panel.style.maxHeight = '0';
        panel.style.opacity = '0';
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
        icon?.classList.add('rotate-180');
      }

      header.addEventListener('click', () => {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        const allowMultiple = accordion.dataset.accordionMultiple === 'true';

        if (!allowMultiple) {
          headers.forEach(h => {
            if (h !== header) {
              const p = h.nextElementSibling;
              h.setAttribute('aria-expanded', 'false');
              h.querySelector('[data-accordion-icon]')?.classList.remove('rotate-180');
              p.style.maxHeight = '0';
              p.style.opacity = '0';
            }
          });
        }

        header.setAttribute('aria-expanded', !isExpanded);
        icon?.classList.toggle('rotate-180');

        if (!isExpanded) {
          panel.style.maxHeight = panel.scrollHeight + 'px';
          panel.style.opacity = '1';
        } else {
          panel.style.maxHeight = '0';
          panel.style.opacity = '0';
        }
      });
    });
  });
}

// --- 5. Tabs Utility ---
export function initTabs() {
  const tabContainers = document.querySelectorAll('[data-tabs]');

  tabContainers.forEach(container => {
    const triggers = container.querySelectorAll('[data-tab-trigger]');
    const panels = container.querySelectorAll('[data-tab-panel]');

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const tabId = trigger.dataset.tabTrigger;

        triggers.forEach(t => {
          const isActive = t === trigger;
          t.classList.toggle('tab-active', isActive);
          t.classList.toggle('tab', !isActive);
          t.setAttribute('aria-selected', isActive);
          t.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        panels.forEach(panel => {
          const isActive = panel.dataset.tabPanel === tabId;
          panel.hidden = !isActive;
          panel.setAttribute('aria-hidden', !isActive);
          if (isActive) {
            panel.style.animation = 'fadeIn 200ms ease-out';
          }
        });
      });

      trigger.addEventListener('keydown', (e) => {
        let targetIndex;
        const currentIndex = Array.from(triggers).indexOf(trigger);

        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            targetIndex = (currentIndex + 1) % triggers.length;
            triggers[targetIndex].click();
            triggers[targetIndex].focus();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            targetIndex = (currentIndex - 1 + triggers.length) % triggers.length;
            triggers[targetIndex].click();
            triggers[targetIndex].focus();
            break;
          case 'Home':
            e.preventDefault();
            triggers[0].click();
            triggers[0].focus();
            break;
          case 'End':
            e.preventDefault();
            triggers[triggers.length - 1].click();
            triggers[triggers.length - 1].focus();
            break;
        }
      });
    });
  });
}

// --- 6. Tooltips Utility ---
export function initTooltips() {
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');

  tooltipTriggers.forEach(trigger => {
    const tooltipText = trigger.dataset.tooltip;
    const position = trigger.dataset.tooltipPosition || 'top';

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.id = 'tooltip-' + Math.random().toString(36).slice(2, 9);
    tooltip.textContent = tooltipText;
    tooltip.setAttribute('role', 'tooltip');
    trigger.setAttribute('aria-describedby', tooltip.id);

    const positions = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };
    tooltip.classList.add(...positions[position].split(' '));
    trigger.appendChild(tooltip);

    let showTimeout, hideTimeout;
    const show = () => {
      clearTimeout(hideTimeout);
      showTimeout = setTimeout(() => {
        tooltip.classList.remove('opacity-0', 'invisible', 'translate-y-1', '-translate-y-1', 'translate-x-1', '-translate-x-1');
        tooltip.classList.add('opacity-100', 'visible', 'translate-y-0', 'translate-x-0');
      }, 200);
    };

    const hide = () => {
      clearTimeout(showTimeout);
      hideTimeout = setTimeout(() => {
        tooltip.classList.add('opacity-0', 'invisible', 'translate-y-1');
        tooltip.classList.remove('opacity-100', 'visible', 'translate-y-0');
      }, 100);
    };

    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mouseleave', hide);
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', hide);

    trigger.addEventListener('touchstart', (e) => {
      e.preventDefault();
      show();
      setTimeout(hide, 3000);
    }, { passive: false });
  });
}
