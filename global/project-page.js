/*
 * Project pages: Research Methodology accordion.
 * Paired with global/project-page.css. Without JS every panel stays open.
 *
 * One panel open at a time; each trigger is a real <button> with
 * aria-expanded / aria-controls, so it works from the keyboard.
 */
(function () {
  'use strict';

  function init() {
    document.querySelectorAll('.accordion').forEach(function (accordion) {
      var items = accordion.querySelectorAll('.accordion__item');

      function setOpen(item, open) {
        item.classList.toggle('is-open', open);
        item.querySelector('.accordion__trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      items.forEach(function (item) {
        setOpen(item, false);
        item.querySelector('.accordion__trigger').addEventListener('click', function () {
          var open = !item.classList.contains('is-open');
          items.forEach(function (other) { if (other !== item) setOpen(other, false); });
          setOpen(item, open);
        });
      });

      accordion.setAttribute('data-enhanced', '');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
