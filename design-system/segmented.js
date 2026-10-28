// Keep the sliding indicator aligned with the selected native radio label.
document.querySelectorAll('.nova-segmented').forEach((group) => {
  const radios = group.querySelectorAll('.nova-segment__input');

  function updateIndicator() {
    const selected = group.querySelector('.nova-segment__input:checked + .nova-segment__label');
    if (!selected) {
      group.classList.remove('is-enhanced');
      return;
    }

    const groupRect = group.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    if (!selectedRect.width || !selectedRect.height) return;

    group.style.setProperty('--nova-segment-indicator-x', `${selectedRect.left - groupRect.left}px`);
    group.style.setProperty('--nova-segment-indicator-y', `${selectedRect.top - groupRect.top}px`);
    group.style.setProperty('--nova-segment-indicator-width', `${selectedRect.width}px`);
    group.style.setProperty('--nova-segment-indicator-height', `${selectedRect.height}px`);
    group.classList.add('is-enhanced');
  }

  group.addEventListener('change', updateIndicator);
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(group);
    radios.forEach((radio) => observer.observe(radio.parentElement));
  } else {
    window.addEventListener('resize', updateIndicator);
  }
  if (document.fonts) document.fonts.ready.then(updateIndicator);
  updateIndicator();
});
