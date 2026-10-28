(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const controls = document.querySelector('.presentation-controls');
  const counter = document.querySelector('.presentation-counter');
  const counterNumber = document.querySelector('.presentation-counter__number');
  const counterTitle = document.querySelector('.presentation-counter__title');
  const first = document.querySelector('[data-action="first"]');
  const previous = document.querySelector('[data-action="previous"]');
  const next = document.querySelector('[data-action="next"]');
  if (!slides.length || !controls || !counter || !counterNumber || !counterTitle || !first || !previous || !next) return;

  let current = 0;
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
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); show(current + 1); }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); show(current - 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
  });
  window.addEventListener('hashchange', () => show(numberFromHash(), false));
  show(numberFromHash(), false);
  controls.hidden = false;
})();
