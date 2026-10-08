/*
 * Project page showcase: scroll-driven composition.
 * Paired with global/project-hero.css, which holds all geometry.
 *
 * The frame is pinned (position: sticky) inside a taller track. While it is
 * pinned, scroll progress p (0 → 1) drives two eased values:
 *   --e  emerge: the side screens slide out from behind the centre screen
 *   --s  spread: they travel outward and settle into the final composition
 * p is followed with light damping so the motion feels physical rather than
 * locked to the scroll wheel. Scrolling back up reverses everything.
 */
(function () {
  'use strict';

  var hero = document.getElementById('projectHero');
  if (!hero) return;
  var frame = hero.closest('.hero-project-design-wrapper');
  if (!frame) return;

  // Reduced motion: keep the CSS default (final composition, no pinning).
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var mobile = window.matchMedia('(max-width: 700px)');
  var HEADER_SPACE = 64;     // fixed header (48px) + breathing room

  /* ---------- Easing ---------- */

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }

  // Overlapping stages: emerging runs over the first half of the scroll, the
  // spread starts a little before that ends, and the last ~10% is rest.
  function emerge(p) { return easeInOutCubic(clamp01(p / 0.45)); }
  function spread(p) { return easeInOutSine(clamp01((p - 0.3) / 0.6)); }

  /* ---------- Pinning track ---------- */

  var track = document.createElement('div');
  track.className = 'hero-scroll-track';
  frame.parentNode.insertBefore(track, frame);
  track.appendChild(frame);

  var distance = 0, stickyTop = HEADER_SPACE;

  function layout() {
    var vh = window.innerHeight;
    var frameH = frame.offsetHeight;
    // Enough scroll for each stage to be seen, never so much it drags.
    distance = Math.round(vh * (mobile.matches ? 0.55 : 0.85));
    // Pin vertically centred, or where the frame already sits on load if
    // that is higher, so the sequence always starts from the centre screen alone.
    var naturalTop = track.getBoundingClientRect().top + window.scrollY;
    stickyTop = Math.max(HEADER_SPACE, Math.round(Math.min((vh - frameH) / 2, naturalTop)));
    track.style.height = frameH + distance + 'px';
    track.style.setProperty('--hero-sticky-top', stickyTop + 'px');
    requestUpdate();
  }

  /* ---------- Progress loop ---------- */

  var target = 0, current = 0, lastTime = 0, running = false;

  function readTarget() {
    var top = track.getBoundingClientRect().top;
    target = clamp01((stickyTop - top) / distance);
  }

  function apply(p) {
    hero.style.setProperty('--e', emerge(p).toFixed(4));
    hero.style.setProperty('--s', spread(p).toFixed(4));
  }

  function tick(now) {
    var dt = Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;
    readTarget();
    current += (target - current) * (1 - Math.exp(-dt * 9));
    if (Math.abs(target - current) < 0.0005) current = target;
    apply(current);
    if (current !== target) requestAnimationFrame(tick);
    else running = false;
  }

  function requestUpdate() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(tick);
  }

  /* ---------- Init ---------- */

  frame.classList.add('hero-js');
  layout();
  readTarget();
  current = target;          // no catch-up animation when loading mid-page
  apply(current);

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', layout);
  mobile.addEventListener && mobile.addEventListener('change', layout);
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(frame);

  // Load-in once the first frame has painted
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { frame.classList.add('hero-ready'); });
  });
})();
