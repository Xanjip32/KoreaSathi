// ============================================
// Dropdowns Utility
// ============================================

export function initDropdowns() {
  const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');

  dropdownTriggers.forEach(trigger => {
    const dropdown = document.getElementById(trigger.dataset.dropdownTrigger);
    if (!dropdown) return;

    let isOpen = false;
    let closeTimeout;

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
    dropdown.addEventListener('mouseenter', open);

    trigger.addEventListener('mouseleave', close);
    trigger.addEventListener('blur', close);
    dropdown.addEventListener('mouseleave', close);

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        close();
      }
    });

    // Close on Escape
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
  });
}