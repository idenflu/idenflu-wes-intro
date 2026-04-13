  // Nav scroll + progress bar + back-to-top
  const nav = document.getElementById('nav');
  const scrollBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    scrollBar.style.width = pct + '%';
    backToTop.classList.toggle('visible', window.scrollY > 300);
  });

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Scroll animate
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('animate-in'); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  // KPI counters
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1600;
    const start = performance.now();
    const isDecimal = String(target).includes('.');
    const update = now => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = ease * target;
      el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-count]').forEach(animateCounter);
        statsObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  const statsSection = document.getElementById('stats');
  if (statsSection) statsObserver.observe(statsSection);

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) {
        panel.classList.add('active');
        panel.querySelectorAll('[data-animate]').forEach(el => {
          el.classList.remove('animate-in');
          setTimeout(() => el.classList.add('animate-in'), 30);
        });
      }
    });
  });

  // Log stream
  const logLines = [
    { tag: 'IAM',           msg: ' Permission check: ', ok: '✓ task.execute', rest: ' — user:operator-01' },
    { tag: 'Realtime',      msg: ' Frame pushed: stream:floor-1 (', val: '12ms', rest: ')' },
    { tag: 'Notification',  msg: ' Email delivered → ', rest: 'ops-team@warehouse.kr' },
    { tag: 'Audit',         msg: ' Entry recorded: entityId=task-ab3f (', rest: 'correlation:c9d2)' },
    { tag: 'Scheduling',    msg: ' Job fired: ', rest: 'conveyor-maintenance-check' },
    { tag: 'Configuration', msg: ' Key refreshed: ', rest: 'conveyor.max_speed = 1.8' },
    { tag: 'IAM',           msg: ' Role resolved: ', ok: '✓ ops-manager', rest: ' → 14 permissions' },
    { tag: 'Realtime',      msg: ' Subscription: stream:agv-status (', val: '8ms', rest: ' snapshot)' },
    { tag: 'Notification',  msg: ' SMS delivered → ', rest: '+82-10-xxxx-1234' },
    { tag: 'Audit',         msg: ' Bulk export: 1,240 records (', rest: 'since 2025-04-01)' },
  ];
  let lineIdx = 0;
  const tagColors = { IAM:'#60A5FA', Realtime:'#A78BFA', Notification:'#FBD38D', Audit:'#6EE7B7', Scheduling:'#F9A8D4', Configuration:'#67E8F9' };

  function appendLog() {
    const container = document.getElementById('log-stream');
    if (!container) return;
    const d = logLines[lineIdx % logLines.length];
    const line = document.createElement('div');
    line.className = 'log-line';
    const color = tagColors[d.tag] || '#60A5FA';
    line.innerHTML = `→ [<span class="log-tag" style="color:${color}">${d.tag}</span>]${d.msg}${d.ok ? `<span class="log-ok">${d.ok}</span>` : ''}${d.val ? `<span class="log-val">${d.val}</span>` : ''}${d.rest}`;
    container.appendChild(line);
    requestAnimationFrame(() => line.classList.add('visible'));
    if (container.children.length > 10) {
      const old = container.children[0];
      old.classList.add('fade-out');
      setTimeout(() => old.remove(), 400);
    }
    lineIdx++;
  }
  setInterval(appendLog, 1100);
  appendLog(); appendLog(); appendLog(); appendLog();

  // Back to Top
  const backToTop = document.getElementById('back-to-top');
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Contact form soft validation
  const contactFormRow = document.querySelector('.contact-form-row');
  if (contactFormRow) {
    const submitBtn = contactFormRow.querySelector('.btn-white');
    submitBtn.addEventListener('click', () => {
      const inputs = contactFormRow.querySelectorAll('.contact-input');
      let valid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = 'rgba(239,68,68,0.7)';
          valid = false;
        } else {
          input.style.borderColor = '';
        }
      });
      if (valid) {
        submitBtn.textContent = '접수되었습니다 ✓';
        submitBtn.style.background = '#D1FAE5';
        submitBtn.style.color = '#065F46';
        submitBtn.disabled = true;
      }
    });
  }

  // Nav scroll spy
  const spySections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a, .mobile-nav a');
  const spyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(link => {
          link.classList.toggle('nav-active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  spySections.forEach(s => spyObserver.observe(s));
