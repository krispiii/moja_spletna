/*
 * Motion layer — smooth wheel scrolling, scroll reveals and parallax.
 * Shared by every page. No dependencies.
 *
 * - Wheel input is eased by a critically damped spring (soft start, soft stop,
 *   no overshoot). Touch, keyboard and scrollbar dragging stay native.
 * - The very first wheel gesture starts on a softer spring that firms up over
 *   ~0.25s: a brief "catch" before the page glides.
 * - Everything is disabled for prefers-reduced-motion.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  root.classList.add('motion-on');

  /* ---------- Config ---------- */

  var SPRING_OMEGA = 11;          // stiffness of the follow (higher = snappier)
  var WHEEL_MULTIPLIER = 1;
  var CATCH_DURATION = 0.26;      // seconds the first-gesture catch lasts
  var CATCH_START = 0.45;         // spring strength at the very start of the catch (0–1)

  var REVEAL_SELECTORS = [
    // home
    '.concepts-into-box', '.project-overview', '.project-overview-small',
    '.grupe-project .project-design',
    // project pages
    '.about-project-box', '.project-main-info-box', '.mock-up', '.animation-formats',
    '.research-title-box', '.harmonica-box', '.design-part-text-box',
    '.mock-up-small-box', '.conclusion-text-box', '.next-project-box',
    // about me
    '.box-decorated-line-and-text', '.about-me-text-box', '.about-me-photo-box',
    // contact
    '.collaboration-text', '.collaboration-steps',
    // all pages
    '.footer-box'
  ];

  // Elements that drift at a different speed than the page (speed = share of viewport).
  var PARALLAX_LAYERS = [];

  // Cards that "deal" into place, driven by their own scroll position so the
  // entrance works in every layout (row, triangle or stacked column).
  // [selector, drift speed, extra starting rotation in degrees, stagger 0–1]
  var DEAL_CARDS = [
    ['.unther-herp-project .card-design', 0.04, -12, 0],
    ['.unther-herp-project .card-design-2', 0.07, 10, 0.1],
    ['.unther-herp-project .card-design-3', 0.055, -12, 0.2]
  ];

  // Images that move inside their (clipping) frame.
  var PARALLAX_INNER = ['.mock-up-image', '.mock-up-small-photo'];

  /* ---------- Helpers ---------- */

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function maxScroll() { return Math.max(0, root.scrollHeight - window.innerHeight); }
  function now() { return performance.now() / 1000; }

  /* ---------- Smooth wheel scrolling ---------- */

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var pos = 0, vel = 0, target = 0, lastWritten = -1;
  var active = false, lastTime = 0;
  var catchStart = -1, hasCaught = false;

  // Let nested scrollable areas (dropdowns, overlays) scroll natively.
  function nestedCanScroll(el, dy) {
    while (el && el !== document.body && el !== root) {
      if (el.hasAttribute && el.hasAttribute('data-native-scroll')) return true;
      if (el.scrollHeight > el.clientHeight + 1) {
        var oy = getComputedStyle(el).overflowY;
        if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') {
          if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
          if (dy < 0 && el.scrollTop > 0) return true;
        }
      }
      el = el.parentElement;
    }
    return false;
  }

  function onWheel(e) {
    if (!finePointer.matches || e.ctrlKey || e.defaultPrevented) return;

    var dy = e.deltaY, dx = e.deltaX;
    if (e.deltaMode === 1) { dy *= 16; dx *= 16; }
    else if (e.deltaMode === 2) { dy *= window.innerHeight; dx *= window.innerWidth; }
    if (Math.abs(dx) > Math.abs(dy) || dy === 0) return;
    if (nestedCanScroll(e.target, dy)) return;

    e.preventDefault();

    if (!active) {
      pos = target = window.scrollY;
      vel = 0;
    }
    if (!hasCaught) {
      hasCaught = true;
      catchStart = now();
    }

    target = clamp(target + dy * WHEEL_MULTIPLIER, 0, maxScroll());
    start();
  }

  function start() {
    if (active) return;
    active = true;
    lastTime = now();
    requestAnimationFrame(tick);
  }

  function stop() {
    active = false;
    vel = 0;
  }

  function currentOmega(t) {
    if (catchStart < 0) return SPRING_OMEGA;
    var p = (t - catchStart) / CATCH_DURATION;
    if (p >= 1) { catchStart = -1; return SPRING_OMEGA; }
    return SPRING_OMEGA * (CATCH_START + (1 - CATCH_START) * easeInOutCubic(p));
  }

  function tick() {
    if (!active) return;

    var t = now();
    var dt = Math.min(t - lastTime, 1 / 30);
    lastTime = t;

    target = clamp(target, 0, maxScroll());

    // Critically damped spring, integrated in small fixed sub-steps for stability.
    var omega = currentOmega(t);
    var steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    var h = dt / steps;
    for (var i = 0; i < steps; i++) {
      var acc = omega * omega * (target - pos) - 2 * omega * vel;
      vel += acc * h;
      pos += vel * h;
    }

    if (Math.abs(target - pos) < 0.4 && Math.abs(vel) < 8) {
      pos = target;
      writeScroll(pos);
      stop();
      return;
    }

    writeScroll(pos);
    requestAnimationFrame(tick);
  }

  function writeScroll(y) {
    lastWritten = y;
    window.scrollTo(0, y);
    updateParallax();
  }

  // Keyboard, scrollbar drag, find-in-page etc. take over instantly.
  function onNativeScroll() {
    if (active && Math.abs(window.scrollY - lastWritten) > 2) stop();
    if (!active) requestParallax();
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onNativeScroll, { passive: true });
  window.addEventListener('mousedown', function (e) { if (e.button === 1) stop(); }); // middle-click autoscroll
  window.addEventListener('touchstart', stop, { passive: true });

  /* ---------- Parallax ---------- */

  var layers = [];   // { el, speed, top, height, inner, deal }
  var parallaxPending = false;
  var narrow = window.matchMedia('(max-width: 700px)');

  function collectParallax() {
    PARALLAX_LAYERS.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (el) {
        layers.push({ el: el, speed: pair[1], inner: false, top: 0, height: 0 });
      });
    });
    DEAL_CARDS.forEach(function (c) {
      document.querySelectorAll(c[0]).forEach(function (el) {
        layers.push({ el: el, speed: c[1], inner: false, top: 0, height: 0,
                      deal: { rotate: c[2], stagger: c[3] } });
      });
    });
    PARALLAX_INNER.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.parentElement) return;
        el.classList.add('parallax-inner');
        el.parentElement.classList.add('parallax-frame');
        layers.push({ el: el, speed: 0.045, inner: true, top: 0, height: 0 });
      });
    });
  }

  function measureParallax() {
    // Remove our offsets first so measurements reflect layout position.
    layers.forEach(function (l) {
      if (l.inner) return;
      l.el.style.translate = '';
      if (l.deal) l.el.style.rotate = l.el.style.scale = '';
    });
    var sy = window.scrollY;
    layers.forEach(function (l) {
      var box = (l.inner ? l.el.parentElement : l.el).getBoundingClientRect();
      l.top = box.top + sy;
      l.height = box.height;
    });
    updateParallax();
  }

  function updateParallax() {
    if (!layers.length) return;
    var sy = window.scrollY;
    var vh = window.innerHeight;
    var factor = narrow.matches ? 0.6 : 1;

    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      var top = l.top - sy;
      // Deal cards are always updated so ones below the fold start in their hidden pose.
      if (!l.deal && (top > vh + 200 || top + l.height < -200)) continue; // off-screen
      // -1 when the element enters from below, +1 when it leaves at the top.
      var progress = clamp((vh - top) / (vh + l.height) * 2 - 1, -1, 1);
      var y = l.inner
        ? progress * l.speed * l.height
        : -progress * l.speed * vh * 0.5 * factor;

      if (l.deal) {
        // 0 while the card's top edge is at the bottom of the viewport,
        // 1 once it has travelled ~50% of the viewport height.
        var raw = (vh - top) / (vh * 0.5) - l.deal.stagger;
        var e = easeOutCubic(clamp(raw / (1 - l.deal.stagger * 0.5), 0, 1));
        var lift = Math.min(140, vh * 0.16) * factor;
        y += (1 - e) * lift;
        l.el.style.rotate = ((1 - e) * l.deal.rotate).toFixed(2) + 'deg';
        l.el.style.scale = (0.9 + 0.1 * e).toFixed(4);
        l.el.style.opacity = clamp(e * 1.8, 0, 1).toFixed(3);
      }

      l.el.style.translate = '0 ' + y.toFixed(2) + 'px';
    }
  }

  function requestParallax() {
    if (parallaxPending) return;
    parallaxPending = true;
    requestAnimationFrame(function () {
      parallaxPending = false;
      updateParallax();
    });
  }

  var measurePending = false;
  function requestMeasure() {
    if (measurePending) return;
    measurePending = true;
    requestAnimationFrame(function () {
      measurePending = false;
      measureParallax();
    });
  }

  /* ---------- Scroll reveals ---------- */

  function setupReveals() {
    if (!('IntersectionObserver' in window)) return;

    var els = document.querySelectorAll(REVEAL_SELECTORS.join(','));
    if (!els.length) return;

    els.forEach(function (el) {
      // Keep each element's own transitions (e.g. hover effects) and add ours.
      var cs = getComputedStyle(el);
      var hasOwn = /[1-9]/.test(cs.transitionDuration);
      var ours = 'opacity .7s cubic-bezier(.22,1,.36,1) var(--reveal-delay, 0ms), ' +
                 'translate .9s cubic-bezier(.16,1,.3,1) var(--reveal-delay, 0ms)';
      el.style.transition = hasOwn && cs.transition ? cs.transition + ', ' + ours : ours;
      el.setAttribute('data-reveal', '');
    });

    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.setProperty('--reveal-delay', Math.min(batch, 4) * 70 + 'ms');
        el.classList.add('is-revealed');
        batch++;
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Init ---------- */

  function init() {
    setupReveals();
    collectParallax();
    measureParallax();

    window.addEventListener('resize', requestMeasure);
    window.addEventListener('load', requestMeasure);
    if ('ResizeObserver' in window) new ResizeObserver(requestMeasure).observe(document.body);
  }

  // If the user switches on reduced motion mid-visit, drop everything.
  reduceMotion.addEventListener && reduceMotion.addEventListener('change', function (e) {
    if (!e.matches) return;
    stop();
    window.removeEventListener('wheel', onWheel);
    layers.forEach(function (l) {
      l.el.style.translate = l.el.style.rotate = l.el.style.scale = l.el.style.opacity = '';
    });
    layers = [];
    root.classList.remove('motion-on');
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
