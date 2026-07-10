// ============================================
// Tabs Utility
// ============================================

export function initTabs() {
  const tabContainers = document.querySelectorAll('[data-tabs]');

  tabContainers.forEach(container => {
    const triggers = container.querySelectorAll('[data-tab-trigger]');
    const panels = container.querySelectorAll('[data-tab-panel]');

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const tabId = trigger.dataset.tabTrigger;

        // Update triggers
        triggers.forEach(t => {
          const isActive = t === trigger;
          t.classList.toggle('tab-active', isActive);
          t.classList.toggle('tab', !isActive);
          t.setAttribute('aria-selected', isActive);
          t.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Update panels
        panels.forEach(panel => {
          const isActive = panel.dataset.tabPanel === tabId;
          panel.hidden = !isActive;
          panel.setAttribute('aria-hidden', !isActive);
          if (isActive) {
            panel.style.animation = 'fadeIn 200ms ease-out';
          }
        });
      });

      // Keyboard navigation
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