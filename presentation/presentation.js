(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const controls = document.querySelector('.presentation-controls');
  const counter = document.querySelector('.presentation-counter');
  const counterNumber = document.querySelector('.presentation-counter__number');
  const counterTitle = document.querySelector('.presentation-counter__title');
  const first = document.querySelector('[data-action="first"]');
  const previous = document.querySelector('[data-action="previous"]');
  const next = document.querySelector('[data-action="next"]');
  const menu = document.querySelector('.slide-menu');
  const menuToggle = document.querySelector('.slide-menu__toggle');
  const menuButton = document.querySelector('.presentation-menu-button');
  const layout = document.querySelector('.presentation-layout');
  const menuLinks = Array.from(document.querySelectorAll('.slide-nav__link'));
  const compactMenu = window.matchMedia('(max-width: 900px)');
  if (!slides.length || !controls || !counter || !counterNumber || !counterTitle || !first || !previous || !next) return;

  let current = 0;
  let desktopMenuVisible = true;
  const numberFromHash = () => {
    const match = location.hash.match(/^#slide-(\d+)$/);
    return match ? Math.max(0, Math.min(slides.length - 1, Number(match[1]) - 1)) : 0;
  };

  function show(index, updateHash = true) {
    const focusedFirst = document.activeElement === first;
    const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
    const changed = nextIndex !== current;
    current = nextIndex;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    menuLinks.forEach((link) => {
      if (Number(link.dataset.slideLink) === current + 1) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    if (menu && !menu.hasAttribute('inert') && !compactMenu.matches) {
      const activeLink = menuLinks.find((link) => Number(link.dataset.slideLink) === current + 1);
      if (activeLink) {
        const menuBox = menu.getBoundingClientRect();
        const linkBox = activeLink.getBoundingClientRect();
        if (current === 0) menu.scrollTop = 0;
        else if (linkBox.bottom > menuBox.bottom - 8) menu.scrollTop += linkBox.bottom - menuBox.bottom + 8;
        else if (linkBox.top < menuBox.top + 8) menu.scrollTop -= menuBox.top - linkBox.top + 8;
      }
    }
    first.disabled = current === 0;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    const count = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    counterNumber.textContent = count;
    counterTitle.textContent = ` · ${slides[current].dataset.title}`;
    document.title = `${slides[current].dataset.title} | NOVA`;
    if (updateHash) {
      try { history.replaceState(null, '', `#${slides[current].id}`); } catch (_) { /* Navigation works even when history is unavailable. */ }
    }
    if (changed && window.matchMedia('(max-width: 740px)').matches) window.scrollTo({ top: 0, behavior: 'instant' });
    if (focusedFirst && first.disabled) next.focus();
    if (document.activeElement === next && next.disabled) previous.focus();
    if (document.activeElement === previous && previous.disabled) next.focus();
  }

  first.addEventListener('click', () => show(0));
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  document.querySelectorAll('[data-slide-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      show(Number(link.dataset.slideLink) - 1);
      if (menu && compactMenu.matches && link.classList.contains('slide-nav__link')) {
        menu.open = false;
        if (menuToggle) menuToggle.focus({ preventScroll: true });
      }
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); show(current + 1); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); show(current - 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
  });
  window.addEventListener('hashchange', () => show(numberFromHash(), false));
  if (menu && menuButton && layout) {
    const syncMenu = () => {
      const focusWasInMenu = menu.contains(document.activeElement);
      const compact = compactMenu.matches;
      const desktopHidden = !compact && !desktopMenuVisible;
      menu.open = !compact;
      menu.toggleAttribute('inert', desktopHidden);
      if (desktopHidden) menu.setAttribute('aria-hidden', 'true');
      else menu.removeAttribute('aria-hidden');
      layout.classList.toggle('presentation-layout--menu-hidden', desktopHidden);
      menuButton.hidden = compact;
      menuButton.textContent = desktopMenuVisible ? '목차 숨기기' : '목차 보기';
      menuButton.setAttribute('aria-expanded', String(desktopMenuVisible));
      if (compact && focusWasInMenu && menuToggle) menuToggle.focus({ preventScroll: true });
      if (desktopHidden && focusWasInMenu) menuButton.focus({ preventScroll: true });
      if (!compact) show(current, false);
    };
    menuButton.addEventListener('click', () => {
      desktopMenuVisible = !desktopMenuVisible;
      syncMenu();
    });
    syncMenu();
    compactMenu.addEventListener('change', syncMenu);
    layout.addEventListener('transitionend', (event) => {
      if (event.target === layout && event.propertyName === 'grid-template-columns' && !compactMenu.matches && desktopMenuVisible) show(current, false);
    });
  }
  show(numberFromHash(), false);
  controls.hidden = false;
})();
