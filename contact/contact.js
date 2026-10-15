// "What our Collaboration Will Look Like" accordion: each step opens and closes on its own.
document.querySelectorAll('.step__toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.closest('.step').classList.toggle('is-open', open);
  });
});
