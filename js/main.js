/* ==========================================================================
   NovaGEO - Company & Team Interactive Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'en';

  const langEnBtn = document.getElementById('langEn');
  const langZhBtn = document.getElementById('langZh');

  function updateLanguage(lang) {
    currentLang = lang;
    if (lang === 'en') {
      if (langEnBtn) langEnBtn.classList.add('active');
      if (langZhBtn) langZhBtn.classList.remove('active');
    } else {
      if (langZhBtn) langZhBtn.classList.add('active');
      if (langEnBtn) langEnBtn.classList.remove('active');
    }

    const dict = translations[lang];
    if (!dict) return;

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

  if (langEnBtn) langEnBtn.addEventListener('click', () => updateLanguage('en'));
  if (langZhBtn) langZhBtn.addEventListener('click', () => updateLanguage('zh'));

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
