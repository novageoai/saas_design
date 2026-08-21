/* ==========================================================================
   NovaGEO - Company & Team Interactive Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'en';

  function getLangEnButtons() {
    return document.querySelectorAll('#langEn, #mobileLangEn, .lang-btn-en');
  }

  function getLangZhButtons() {
    return document.querySelectorAll('#langZh, #mobileLangZh, .lang-btn-zh');
  }

  function getInitialLanguage() {
    // 1. URL Query Parameter (?lang=zh or ?lang=en)
    try {
      const params = new URLSearchParams(window.location.search);
      const paramLang = params.get('lang');
      if (paramLang === 'zh' || paramLang === 'en') {
        return paramLang;
      }
    } catch (e) {}

    // 2. LocalStorage
    try {
      const saved = localStorage.getItem('novageo_lang');
      if (saved === 'zh' || saved === 'en') {
        return saved;
      }
    } catch (e) {}

    // 3. Default
    return 'en';
  }

  function updateCrossPageLinks(lang) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      if (href.includes('Prototype') || href.includes('prototype')) {
        const parts = href.split('#');
        const basePath = parts[0].split('?')[0];
        const hash = parts[1] ? `#${parts[1]}` : '';
        link.setAttribute('href', `${basePath}?lang=${lang}${hash}`);
      }
    });
  }

  function updateLanguage(lang, syncUrl = true) {
    currentLang = (lang === 'zh') ? 'zh' : 'en';

    // Persist to localStorage
    try {
      localStorage.setItem('novageo_lang', currentLang);
    } catch (e) {}

    // Update document HTML lang attribute
    document.documentElement.lang = (currentLang === 'zh' ? 'zh-HK' : 'en');

    // Toggle active classes on all language buttons (desktop and mobile)
    getLangEnButtons().forEach(btn => btn.classList.toggle('active', currentLang === 'en'));
    getLangZhButtons().forEach(btn => btn.classList.toggle('active', currentLang === 'zh'));

    // Update cross-page links
    updateCrossPageLinks(currentLang);

    // Sync current URL query param without reload
    if (syncUrl && window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', currentLang);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }

    // Apply translations dictionary
    if (typeof translations !== 'undefined' && translations[currentLang]) {
      const dict = translations[currentLang];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = dict[key];
          } else {
            el.innerHTML = dict[key];
          }
        }
      });
    }

    // Re-render Lucide icons if any
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Initialize Language
  const initialLang = getInitialLanguage();
  updateLanguage(initialLang, false);

  // Language Button Click Listeners (Delegation / All Buttons)
  document.addEventListener('click', (e) => {
    const enBtn = e.target.closest('#langEn, #mobileLangEn, .lang-btn-en');
    if (enBtn) {
      e.preventDefault();
      updateLanguage('en', true);
      return;
    }

    const zhBtn = e.target.closest('#langZh, #mobileLangZh, .lang-btn-zh');
    if (zhBtn) {
      e.preventDefault();
      updateLanguage('zh', true);
      return;
    }
  });

  // Multi-tab storage sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'novageo_lang' && (e.newValue === 'en' || e.newValue === 'zh')) {
      if (e.newValue !== currentLang) {
        updateLanguage(e.newValue, false);
      }
    }
  });

  // Cross-page link click interceptor to guarantee sync
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    if (href.includes('Prototype') || href.includes('prototype')) {
      try {
        localStorage.setItem('novageo_lang', currentLang);
      } catch (err) {}
      const parts = href.split('#');
      const basePath = parts[0].split('?')[0];
      const hash = parts[1] ? `#${parts[1]}` : '';
      anchor.setAttribute('href', `${basePath}?lang=${currentLang}${hash}`);
    }
  });

  // Mobile Navigation Drawer Controller
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    if (mobileMenuDrawer) {
      mobileMenuDrawer.classList.add('active');
      mobileMenuDrawer.setAttribute('aria-hidden', 'false');
    }
    if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
    if (mobileMenuToggle) {
      mobileMenuToggle.classList.add('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (mobileMenuDrawer) {
      mobileMenuDrawer.classList.remove('active');
      mobileMenuDrawer.setAttribute('aria-hidden', 'true');
    }
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
    if (mobileMenuToggle) {
      mobileMenuToggle.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileMenuDrawer && mobileMenuDrawer.classList.contains('active');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      if (contactModal && contactModal.classList.contains('active')) {
        contactModal.classList.remove('active');
      }
    }
  });

  // Reset menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      closeMobileMenu();
    }
  });

  // Navbar background change on scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      if (navbar) navbar.classList.add('scrolled');
    } else {
      if (navbar) navbar.classList.remove('scrolled');
    }
  });

  // Modal Dialog Logic
  const contactModal = document.getElementById('contactModal');
  const openModalBtns = document.querySelectorAll('.open-contact-modal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const contactForm = document.getElementById('contactForm');
  const modalSuccessMsg = document.getElementById('modalSuccessMsg');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      if (contactModal) contactModal.classList.add('active');
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (contactModal) contactModal.classList.remove('active');
    });
  }

  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.classList.remove('active');
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.style.display = 'none';
      if (modalSuccessMsg) modalSuccessMsg.style.display = 'block';
    });
  }

  // Accordion / Tab Logic for Schedule
  const quarterTabs = document.querySelectorAll('.quarter-tab');
  const quarterContents = document.querySelectorAll('.quarter-content');

  quarterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const q = tab.getAttribute('data-q');
      quarterTabs.forEach(t => t.classList.remove('active'));
      quarterContents.forEach(c => c.style.display = 'none');

      tab.classList.add('active');
      const activeContent = document.getElementById(`q-content-${q}`);
      if (activeContent) activeContent.style.display = 'block';
    });
  });
});
