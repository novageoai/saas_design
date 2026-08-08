/* ==========================================================================
   NovaGEO - Visual Prototype Interactive Script
   Includes animated SVG score spinners and separated score diagnostics
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
        el.innerHTML = dict[key];
      }
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  if (langEnBtn) langEnBtn.addEventListener('click', () => updateLanguage('en'));
  if (langZhBtn) langZhBtn.addEventListener('click', () => updateLanguage('zh'));

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
    updateGauge(document.getElementById('overallSpinnerCircle'), document.getElementById('overallScoreVal'), null, 84, true);
    updateGauge(document.getElementById('techSpinnerCircle'), document.getElementById('techScoreVal'), document.getElementById('techLinearFill'), 92, false);
    updateGauge(document.getElementById('semSpinnerCircle'), document.getElementById('semScoreVal'), document.getElementById('semLinearFill'), 78, false);
    updateGauge(document.getElementById('visSpinnerCircle'), document.getElementById('visScoreVal'), document.getElementById('visLinearFill'), 64, false);

    // Mark steps completed for demo initial load
    for (let i = 1; i <= 4; i++) {
      setStepState(i, 'completed');
    }
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

        // Animate all spinners
        updateGauge(document.getElementById('overallSpinnerCircle'), document.getElementById('overallScoreVal'), null, overallScore, true);
        updateGauge(document.getElementById('techSpinnerCircle'), document.getElementById('techScoreVal'), document.getElementById('techLinearFill'), techScore, false);
        updateGauge(document.getElementById('semSpinnerCircle'), document.getElementById('semScoreVal'), document.getElementById('semLinearFill'), semScore, false);
        updateGauge(document.getElementById('visSpinnerCircle'), document.getElementById('visScoreVal'), document.getElementById('visLinearFill'), visScore, false);

        // Update tech badge
        const techBadge = document.getElementById('techBadge');
        if (techBadge) techBadge.innerText = `${techScore}/100 • ${techScore >= 90 ? 'EXCELLENT' : 'GOOD'}`;

        // Update sem badge
        const semBadge = document.getElementById('semBadge');
        if (semBadge) semBadge.innerText = `${semScore}/100 • ${semScore >= 80 ? 'GOOD' : 'IMPROVEMENT AVAILABLE'}`;

        // Update vis badge
        const visBadge = document.getElementById('visBadge');
        if (visBadge) visBadge.innerText = `${visScore}/100 • ${visScore >= 70 ? 'MODERATE' : 'ACTION NEEDED'}`;

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
      { id: 'core', label: 'NovaGEO Schema', x: 0.5, y: 0.5, r: 24, color: '#1A63A6', isCenter: true },
      { id: 'entity1', label: 'Company Profile (JSON-LD)', x: 0.22, y: 0.3, r: 16, color: '#16A34A' },
      { id: 'entity2', label: 'Product & Service Facts', x: 0.78, y: 0.32, r: 16, color: '#16A34A' },
      { id: 'entity3', label: 'Bilingual Vector Hooks', x: 0.28, y: 0.72, r: 16, color: '#F97316' },
      { id: 'entity4', label: 'ChatGPT & Claude Citation', x: 0.74, y: 0.72, r: 16, color: '#1A63A6' }
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

        // Label
        ctx.fillStyle = '#0F172A';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, nx, ny + n.r + 16);
      });

      requestAnimationFrame(drawKG);
    }

    drawKG();
  }
});
