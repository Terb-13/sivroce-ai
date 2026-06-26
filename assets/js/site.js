// Sirvoce — Shared site scripts
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
      if (menuIcon) {
        menuIcon.setAttribute('data-lucide', isOpen ? 'menu' : 'x');
        lucide.createIcons();
      }
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        if (menuIcon) {
          menuIcon.setAttribute('data-lucide', 'menu');
          lucide.createIcons();
        }
      });
    });
  }

  // FAQ accordion
  document.querySelectorAll('[data-faq-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = trigger.nextElementSibling;
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      panel.classList.toggle('hidden');
      const icon = trigger.querySelector('[data-faq-icon]');
      if (icon) {
        icon.setAttribute('data-lucide', expanded ? 'plus' : 'minus');
        lucide.createIcons();
      }
    });
  });

  // Step plan tabs (approach page)
  const stepTabs = document.querySelectorAll('.step-tab');
  const stepPanels = document.querySelectorAll('[data-step-panel]');
  if (stepTabs.length) {
    stepTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const step = tab.dataset.step;
        stepTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
          const badge = t.querySelector('.step-badge');
          if (badge) {
            badge.classList.remove('bg-teal', 'text-white');
            badge.classList.add('bg-navy-100', 'text-navy');
          }
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const badge = tab.querySelector('.step-badge');
        if (badge) {
          badge.classList.remove('bg-navy-100', 'text-navy');
          badge.classList.add('bg-teal', 'text-white');
        }
        stepPanels.forEach((p) => p.classList.remove('active'));
        const panel = document.getElementById(`step-panel-${step}`);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // Lead form
  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      leadForm.classList.add('hidden');
      const success = document.getElementById('form-success');
      if (success) {
        success.classList.remove('hidden');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
});