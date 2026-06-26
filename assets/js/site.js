document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');

  if (mobileMenuBtn && mobileMenu && menuIcon) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
      menuIcon.setAttribute('data-lucide', isOpen ? 'menu' : 'x');
      lucide.createIcons();
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        menuIcon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
      });
    });
  }

  const stepTabs = document.querySelectorAll('.step-tab');
  const stepPanels = document.querySelectorAll('[data-step-panel]');

  stepTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const step = tab.dataset.step;

      stepTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.querySelector('span').classList.remove('bg-teal', 'text-white');
        t.querySelector('span').classList.add('bg-navy-100', 'text-navy');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.querySelector('span').classList.remove('bg-navy-100', 'text-navy');
      tab.querySelector('span').classList.add('bg-teal', 'text-white');

      stepPanels.forEach((panel) => panel.classList.remove('active'));
      document.getElementById(`step-panel-${step}`)?.classList.add('active');
    });
  });
});
