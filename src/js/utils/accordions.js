// ============================================
// Accordions Utility
// ============================================

export function initAccordions() {
  const accordions = document.querySelectorAll('[data-accordion]');

  accordions.forEach(accordion => {
    const headers = accordion.querySelectorAll('[data-accordion-header]');

    headers.forEach(header => {
      const panel = header.nextElementSibling;
      const icon = header.querySelector('[data-accordion-icon]');
      const isOpen = header.getAttribute('aria-expanded') === 'true';

      // Set initial state
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

        // Close all other panels in this accordion (optional: allow multiple)
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

        // Toggle current
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