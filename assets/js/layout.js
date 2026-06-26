(function () {
  const LOGO_SVG = `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="19" cy="19" r="4.2" fill="#14B8A6"/>
    <circle cx="19" cy="19" r="7.8" fill="none" stroke="#14B8A6" stroke-width="1" opacity="0.28"/>
    <circle cx="11" cy="11" r="2.15" fill="#5EEAD4"/>
    <circle cx="27" cy="11" r="2.15" fill="#5EEAD4"/>
    <circle cx="11" cy="27" r="2.15" fill="#5EEAD4"/>
    <circle cx="27" cy="27" r="2.15" fill="#5EEAD4"/>
    <line x1="19" y1="14.8" x2="13.1" y2="13.1" stroke="#14B8A6" stroke-width="1.65" stroke-linecap="round"/>
    <line x1="19" y1="14.8" x2="24.9" y2="13.1" stroke="#14B8A6" stroke-width="1.65" stroke-linecap="round"/>
    <line x1="19" y1="23.2" x2="13.1" y2="24.9" stroke="#14B8A6" stroke-width="1.65" stroke-linecap="round"/>
    <line x1="19" y1="23.2" x2="24.9" y2="24.9" stroke="#14B8A6" stroke-width="1.65" stroke-linecap="round"/>
  </svg>`;

  const FOOTER_LOGO = LOGO_SVG.replace('width="38" height="38"', 'width="32" height="32"');

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'challenge', label: 'The Challenge', href: '/challenge' },
    { id: 'who-we-are', label: 'Who We Are', href: '/who-we-are' },
    { id: 'process', label: 'Our Process', href: '/process' },
    { id: 'proof', label: 'Proof', href: '/proof' },
    { id: 'handoff', label: 'Handoff', href: '/handoff' },
  ];

  const currentPage = document.body.dataset.page || 'home';

  function navLinkClass(id) {
    const base = 'text-sm font-medium transition-colors';
    return id === currentPage
      ? `${base} text-teal nav-link-active`
      : `${base} text-navy-600 hover:text-teal`;
  }

  function mobileLinkClass(id) {
    const base = 'mobile-nav-link px-3 py-2.5 text-sm font-medium rounded-lg';
    return id === currentPage
      ? `${base} text-teal bg-teal-50`
      : `${base} text-navy-600 hover:bg-navy-50`;
  }

  const desktopLinks = NAV_ITEMS.filter((item) => item.id !== 'home')
    .map((item) => `<a href="${item.href}" class="${navLinkClass(item.id)}">${item.label}</a>`)
    .join('');

  const mobileLinks = NAV_ITEMS.filter((item) => item.id !== 'home')
    .map((item) => `<a href="${item.href}" class="${mobileLinkClass(item.id)}">${item.label}</a>`)
    .join('');

  const headerHtml = `
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-nav">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div class="flex items-center justify-between h-16 lg:h-20">
          <a href="/" class="flex items-center gap-3 group" aria-label="Sirvoce home">
            <div class="w-[38px] h-[38px] rounded-[10px] bg-navy group-hover:bg-navy-700 transition-colors flex items-center justify-center overflow-hidden shrink-0">
              ${LOGO_SVG}
            </div>
            <span class="text-navy font-bold text-2xl tracking-[-0.03em]">Sirvoce</span>
          </a>
          <div class="hidden lg:flex items-center gap-8">${desktopLinks}</div>
          <div class="flex items-center gap-3">
            <a href="/contact" class="inline-flex items-center gap-2 px-5 py-2.5 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-all hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2">
              Book Workshop
              <i data-lucide="arrow-right" class="w-4 h-4" stroke-width="2"></i>
            </a>
            <button id="mobile-menu-btn" type="button" class="lg:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
              <i data-lucide="menu" class="w-6 h-6" id="menu-icon"></i>
            </button>
          </div>
        </div>
        <div id="mobile-menu" class="hidden lg:hidden pb-4 border-t border-navy-100">
          <div class="flex flex-col gap-1 pt-3">${mobileLinks}</div>
        </div>
      </nav>
    </header>`;

  const footerHtml = `
    <footer class="bg-navy-950 text-navy-300 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2.5">
            ${FOOTER_LOGO}
            <span class="text-white font-semibold text-lg tracking-tight">Sirvoce</span>
          </div>
          <p class="text-sm text-center md:text-left">Practical AI for mid-sized manufacturers. Build it. Train it. Own it.</p>
          <p class="text-xs text-navy-500">&copy; 2026 Sirvoce. All rights reserved.</p>
        </div>
      </div>
    </footer>`;

  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = headerHtml;
  if (footerEl) footerEl.innerHTML = footerHtml;
})();
