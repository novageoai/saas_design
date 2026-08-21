/* ==========================================================================
   NovaGEO - Visual Prototype Interactive Script
   Includes animated SVG score spinners and separated score diagnostics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'en';

  // Track latest scores for language badge re-rendering
  let lastScores = {
    tech: 92,
    sem: 78,
    vis: 64,
    overall: 84
  };

  function getProtoLangEnButtons() {
    return document.querySelectorAll('#langEn, #protoMobileLangEn, .lang-btn-en');
  }

  function getProtoLangZhButtons() {
    return document.querySelectorAll('#langZh, #protoMobileLangZh, .lang-btn-zh');
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

      if (href.includes('../index.html') || href === '../' || href.includes('../#') || href.includes('../?')) {
        const parts = href.split('#');
        const basePath = parts[0].split('?')[0];
        const hash = parts[1] ? `#${parts[1]}` : '';
        link.setAttribute('href', `${basePath}?lang=${lang}${hash}`);
      }
    });
  }

  function updateScoreBadges() {
    const techBadge = document.getElementById('techBadge');
    const semBadge = document.getElementById('semBadge');
    const visBadge = document.getElementById('visBadge');
    const overallStatusBadge = document.getElementById('overallStatusBadge');

    const techScore = lastScores.tech;
    const semScore = lastScores.sem;
    const visScore = lastScores.vis;
    const overallScore = lastScores.overall;

    if (techBadge) {
      const isExcellent = techScore >= 90;
      const statusText = currentLang === 'en' ? (isExcellent ? 'EXCELLENT' : 'GOOD') : (isExcellent ? '優秀' : '良好');
      techBadge.innerText = `${techScore}/100 • ${statusText}`;
    }

    if (semBadge) {
      const isGood = semScore >= 80;
      const statusText = currentLang === 'en' ? (isGood ? 'GOOD' : 'IMPROVEMENT AVAILABLE') : (isGood ? '良好' : '有待改進');
      semBadge.innerText = `${semScore}/100 • ${statusText}`;
    }

    if (visBadge) {
      const isVisModerate = visScore >= 70;
      const statusText = currentLang === 'en' ? (isVisModerate ? 'MODERATE' : 'ACTION NEEDED') : (isVisModerate ? '中等' : '需即時優化');
      visBadge.innerText = `${visScore}/100 • ${statusText}`;
    }

    if (overallStatusBadge) {
      const isHigh = overallScore >= 80;
      overallStatusBadge.innerText = currentLang === 'en'
        ? (isHigh ? 'HIGH CITATION LIKELIHOOD' : 'MODERATE CITATION LIKELIHOOD')
        : (isHigh ? '高引用概率等級' : '中等引用概率等級');
    }
  }

  function updateLanguage(lang, syncUrl = true) {
    currentLang = (lang === 'zh') ? 'zh' : 'en';

    // Persist to localStorage
    try {
      localStorage.setItem('novageo_lang', currentLang);
    } catch (e) {}

    // Update document HTML lang attribute
    document.documentElement.lang = (currentLang === 'zh' ? 'zh-HK' : 'en');

    // Toggle active classes on all language buttons
    getProtoLangEnButtons().forEach(btn => btn.classList.toggle('active', currentLang === 'en'));
    getProtoLangZhButtons().forEach(btn => btn.classList.toggle('active', currentLang === 'zh'));

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

    // Update scan button text if idle
    const runAuditBtn = document.getElementById('runAuditBtn');
    if (runAuditBtn && !runAuditBtn.disabled) {
      runAuditBtn.innerText = currentLang === 'en' ? 'Run Live GEO Scan →' : '啟動 Live GEO 掃描 →';
    }

    // Update score badges
    updateScoreBadges();

    // Re-render Lucide icons if any
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Initialize Language
  const initialLang = getInitialLanguage();
  updateLanguage(initialLang, false);

  // Language Button Click Listeners (Delegated / All Buttons)
  document.addEventListener('click', (e) => {
    const enBtn = e.target.closest('#langEn, #protoMobileLangEn, .lang-btn-en');
    if (enBtn) {
      e.preventDefault();
      updateLanguage('en', true);
      return;
    }

    const zhBtn = e.target.closest('#langZh, #protoMobileLangZh, .lang-btn-zh');
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

    if (href.includes('../index.html') || href === '../' || href.includes('../#') || href.includes('../?')) {
      try {
        localStorage.setItem('novageo_lang', currentLang);
      } catch (err) {}
      const parts = href.split('#');
      const basePath = parts[0].split('?')[0];
      const hash = parts[1] ? `#${parts[1]}` : '';
      anchor.setAttribute('href', `${basePath}?lang=${currentLang}${hash}`);
    }
  });

  // Prototype Mobile Navigation Drawer Controller
  const protoMobileToggle = document.getElementById('protoMobileMenuToggle');
  const protoMobileDrawer = document.getElementById('protoMobileMenuDrawer');
  const protoMobileOverlay = document.getElementById('protoMobileMenuOverlay');
  const protoMobileClose = document.getElementById('protoMobileMenuClose');
  const protoMobileLinks = document.querySelectorAll('#protoMobileMenuDrawer .mobile-nav-link');

  function openProtoMobileMenu() {
    if (protoMobileDrawer) {
      protoMobileDrawer.classList.add('active');
      protoMobileDrawer.setAttribute('aria-hidden', 'false');
    }
    if (protoMobileOverlay) protoMobileOverlay.classList.add('active');
    if (protoMobileToggle) {
      protoMobileToggle.classList.add('active');
      protoMobileToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeProtoMobileMenu() {
    if (protoMobileDrawer) {
      protoMobileDrawer.classList.remove('active');
      protoMobileDrawer.setAttribute('aria-hidden', 'true');
    }
    if (protoMobileOverlay) protoMobileOverlay.classList.remove('active');
    if (protoMobileToggle) {
      protoMobileToggle.classList.remove('active');
      protoMobileToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  if (protoMobileToggle) {
    protoMobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = protoMobileDrawer && protoMobileDrawer.classList.contains('active');
      if (isOpen) {
        closeProtoMobileMenu();
      } else {
        openProtoMobileMenu();
      }
    });
  }

  if (protoMobileClose) {
    protoMobileClose.addEventListener('click', closeProtoMobileMenu);
  }

  if (protoMobileOverlay) {
    protoMobileOverlay.addEventListener('click', closeProtoMobileMenu);
  }

  protoMobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeProtoMobileMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProtoMobileMenu();
    }
  });

  // Reset on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      closeProtoMobileMenu();
    }
  });

  // Preset Domain Chips
  const presetChips = document.querySelectorAll('.preset-chip');
  const auditDomainInput = document.getElementById('auditDomainInput');

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (auditDomainInput && chip.dataset.domain) {
        auditDomainInput.value = chip.dataset.domain;
      }
    });
  });

  // Animated Spinner Gauge Helper
  // Circumference for r=40 is ~251.2
  const CIRCUMFERENCE = 251.2;

  function updateGauge(circleEl, valEl, fillEl, score, isPercent = false) {
    if (!circleEl) return;
    
    // Clamp score 0 to 100
    const clampedScore = Math.min(100, Math.max(0, score));
    const offset = CIRCUMFERENCE * (1 - clampedScore / 100);
    
    // Animate ring stroke
    circleEl.style.strokeDashoffset = offset;

    // Color thresholds
    let strokeColor = 'var(--status-green)';
    if (clampedScore < 50) {
      strokeColor = 'var(--status-red)';
    } else if (clampedScore < 80) {
      strokeColor = 'var(--status-orange)';
    }
    
    if (circleEl.id === 'overallSpinnerCircle') {
      strokeColor = 'var(--brand-blue)';
    }

    circleEl.style.stroke = strokeColor;

    // Animate numerical text counter
    if (valEl) {
      let currentVal = 0;
      const duration = 1200; // ms
      const startTime = performance.now();

      function stepCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Ease out quadratic
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        currentVal = Math.floor(easeProgress * clampedScore);

        valEl.innerText = isPercent ? `${currentVal}%` : `${currentVal}`;

        if (progress < 1) {
          requestAnimationFrame(stepCounter);
        } else {
          valEl.innerText = isPercent ? `${clampedScore}%` : `${clampedScore}`;
        }
      }

      requestAnimationFrame(stepCounter);
    }

    // Animate linear fill bar
    if (fillEl) {
      fillEl.style.width = `${clampedScore}%`;
    }
  }

  // Audit Step Management
  function setStepState(stepNum, state) {
    const row = document.getElementById(`step${stepNum}Row`);
    const icon = document.getElementById(`step${stepNum}Icon`);
    if (!row || !icon) return;

    row.className = `step-row ${state}`;
    if (state === 'pending') {
      icon.innerHTML = stepNum;
    } else if (state === 'active') {
      icon.innerHTML = `<span class="badge-pulse" style="width:10px;height:10px;"></span>`;
    } else if (state === 'completed') {
      icon.innerHTML = `✓`;
    }
  }

  function resetAuditState() {
    for (let i = 1; i <= 4; i++) {
      setStepState(i, 'pending');
    }
    
    // Reset gauges
    updateGauge(document.getElementById('overallSpinnerCircle'), document.getElementById('overallScoreVal'), null, 0, true);
    updateGauge(document.getElementById('techSpinnerCircle'), document.getElementById('techScoreVal'), document.getElementById('techLinearFill'), 0, false);
    updateGauge(document.getElementById('semSpinnerCircle'), document.getElementById('semScoreVal'), document.getElementById('semLinearFill'), 0, false);
    updateGauge(document.getElementById('visSpinnerCircle'), document.getElementById('visScoreVal'), document.getElementById('visLinearFill'), 0, false);
  }

  // Initial animation on load
  setTimeout(() => {
    updateGauge(document.getElementById('overallSpinnerCircle'), document.getElementById('overallScoreVal'), null, lastScores.overall, true);
    updateGauge(document.getElementById('techSpinnerCircle'), document.getElementById('techScoreVal'), document.getElementById('techLinearFill'), lastScores.tech, false);
    updateGauge(document.getElementById('semSpinnerCircle'), document.getElementById('semScoreVal'), document.getElementById('semLinearFill'), lastScores.sem, false);
    updateGauge(document.getElementById('visSpinnerCircle'), document.getElementById('visScoreVal'), document.getElementById('visLinearFill'), lastScores.vis, false);

    // Mark steps completed for demo initial load
    for (let i = 1; i <= 4; i++) {
      setStepState(i, 'completed');
    }
    updateScoreBadges();
  }, 300);

  // Run Audit Simulation Button Handler
  const runAuditBtn = document.getElementById('runAuditBtn');
  if (runAuditBtn) {
    runAuditBtn.addEventListener('click', () => {
      const domain = auditDomainInput ? auditDomainInput.value.trim() || 'www.cybertech-hk.com' : 'www.cybertech-hk.com';
      runAuditBtn.disabled = true;
      runAuditBtn.innerText = currentLang === 'en' ? `Scanning ${domain}...` : `正在掃描 ${domain}...`;

      resetAuditState();

      // Step 1
      setStepState(1, 'active');

      setTimeout(() => {
        setStepState(1, 'completed');
        setStepState(2, 'active');
      }, 600);

      setTimeout(() => {
        setStepState(2, 'completed');
        setStepState(3, 'active');
      }, 1200);

      setTimeout(() => {
        setStepState(3, 'completed');
        setStepState(4, 'active');
      }, 1800);

      setTimeout(() => {
        setStepState(4, 'completed');

        // Generate scores
        const techScore = Math.floor(Math.random() * 8) + 89; // 89-96
        const semScore = Math.floor(Math.random() * 10) + 74;  // 74-83
        const visScore = Math.floor(Math.random() * 12) + 60;  // 60-71

        const overallScore = Math.round((techScore * 0.35) + (semScore * 0.35) + (visScore * 0.30));

        lastScores = {
          tech: techScore,
          sem: semScore,
          vis: visScore,
          overall: overallScore
        };

        // Animate all spinners
        updateGauge(document.getElementById('overallSpinnerCircle'), document.getElementById('overallScoreVal'), null, overallScore, true);
        updateGauge(document.getElementById('techSpinnerCircle'), document.getElementById('techScoreVal'), document.getElementById('techLinearFill'), techScore, false);
        updateGauge(document.getElementById('semSpinnerCircle'), document.getElementById('semScoreVal'), document.getElementById('semLinearFill'), semScore, false);
        updateGauge(document.getElementById('visSpinnerCircle'), document.getElementById('visScoreVal'), document.getElementById('visLinearFill'), visScore, false);

        updateScoreBadges();

        runAuditBtn.disabled = false;
        runAuditBtn.innerText = currentLang === 'en' ? 'Run Live GEO Scan →' : '啟動 Live GEO 掃描 →';
      }, 2400);
    });
  }

  // Knowledge Graph Canvas Visualizer
  const canvas = document.getElementById('kgCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const nodes = [
      { id: 'core', labelEn: 'NovaGEO Schema', labelZh: 'NovaGEO Schema 架構', x: 0.5, y: 0.5, r: 24, color: '#1A63A6', isCenter: true },
      { id: 'entity1', labelEn: 'Company Profile (JSON-LD)', labelZh: '公司實體檔案 (JSON-LD)', x: 0.22, y: 0.3, r: 16, color: '#16A34A' },
      { id: 'entity2', labelEn: 'Product & Service Facts', labelZh: '產品與服務事實數據', x: 0.78, y: 0.32, r: 16, color: '#16A34A' },
      { id: 'entity3', labelEn: 'Bilingual Vector Hooks', labelZh: '雙語向量對齊鈎子', x: 0.28, y: 0.72, r: 16, color: '#F97316' },
      { id: 'entity4', labelEn: 'ChatGPT & Claude Citation', labelZh: 'ChatGPT & Claude 引用', x: 0.74, y: 0.72, r: 16, color: '#1A63A6' }
    ];

    let angle = 0;

    function drawKG() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.008;

      const width = canvas.width;
      const height = canvas.height;

      // Draw connections
      const centerNode = nodes[0];
      const cx = width * centerNode.x;
      const cy = height * centerNode.y;

      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        // Slight float offset
        const floatX = Math.sin(angle + i) * 6;
        const floatY = Math.cos(angle + i) * 6;

        const nx = width * n.x + floatX;
        const ny = height * n.y + floatY;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Animated pulse particle along line
        const pulseRatio = (Math.sin(angle * 2 + i) + 1) / 2;
        const px = cx + (nx - cx) * pulseRatio;
        const py = cy + (ny - cy) * pulseRatio;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      }

      // Draw nodes
      nodes.forEach((n, idx) => {
        let nx = width * n.x;
        let ny = height * n.y;
        if (!n.isCenter) {
          nx += Math.sin(angle + idx) * 6;
          ny += Math.cos(angle + idx) * 6;
        }

        ctx.beginPath();
        ctx.arc(nx, ny, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label based on currentLang
        ctx.fillStyle = '#0F172A';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        const labelText = currentLang === 'zh' ? n.labelZh : n.labelEn;
        ctx.fillText(labelText, nx, ny + n.r + 16);
      });

      requestAnimationFrame(drawKG);
    }

    drawKG();
  }
});
