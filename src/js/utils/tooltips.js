// ============================================
// Tooltips Utility
// ============================================

export function initTooltips() {
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');

  tooltipTriggers.forEach(trigger => {
    const tooltipText = trigger.dataset.tooltip;
    const position = trigger.dataset.tooltipPosition || 'top';

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    tooltip.setAttribute('role', 'tooltip');

    // Position classes
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

    // Touch support
    trigger.addEventListener('touchstart', (e) => {
      e.preventDefault();
      show();
      setTimeout(hide, 3000);
    }, { passive: false });
  });
}