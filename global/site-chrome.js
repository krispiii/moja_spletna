/*
 * Site chrome: the shared header and footer, defined once and used on every page.
 *
 *   <site-header root="../" current="about-me" offset></site-header>
 *   ...page content (its main wrapper has id="main" for the skip link)...
 *   <site-footer root="../"></site-footer>
 *
 * root     path from the page to the site root ("./" on the home page, "../" one level down)
 * current  optional: about-me | contact | flex-academy | simops | software-asset-management | aboutbuzz | leksoro | dlm | atlas | iskrica-srece
 *          marks that link with aria-current="page"
 * offset   optional: adds a spacer the height of the fixed header, for pages
 *          whose content starts at the top (the home hero handles this itself)
 *
 * Load this script in <head> without defer so the elements are replaced as the
 * page is parsed (no flash). Styles: global/tokens.css + global/site-chrome.css.
 */
(function () {
  'use strict';

  var PROJECTS = [
    ['flex-academy', 'Flex Academy'],
    ['simops', 'SIMOPS'],
    ['software-asset-management', 'Software Asset Management'],
    ['aboutbuzz', 'Aboutbuzz'],
    ['leksoro', 'Leksoro'],
    ['dlm', 'DLM'],
    ['atlas', 'Atlas'],
    ['iskrica-srece', 'Iskrica Sreče']
  ];

  function rootOf(el) {
    var root = el.getAttribute('root') || './';
    return root.charAt(root.length - 1) === '/' ? root : root + '/';
  }

  function current(el, key) {
    return el.getAttribute('current') === key ? ' aria-current="page"' : '';
  }

  function headerHTML(el) {
    var r = rootOf(el);
    var projects = PROJECTS.map(function (p) {
      return '<li><a class="dropdown__link" href="' + r + p[0] + '"' + current(el, p[0]) + '>' + p[1] + '</a></li>';
    }).join('');

    return '' +
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<header class="site-header">' +
        '<div class="site-header__inner container">' +
          '<a class="site-header__logo" href="' + r + 'index.html" aria-label="Kristina Stepan – home">' +
            '<img src="' + r + 'img/home/logo-kristina.svg" width="36" height="24" alt="" />' +
          '</a>' +
          '<button class="site-header__burger" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">' +
            '<img src="' + r + 'img/menu.svg" alt="" />' +
          '</button>' +
          '<nav class="site-nav" id="site-nav" aria-label="Main">' +
            '<ul class="site-nav__list">' +
              '<li class="site-nav__item site-nav__item--dropdown">' +
                '<button class="nav-link" type="button" aria-expanded="false" aria-controls="projects-menu" id="projects-toggle">Projects</button>' +
                '<ul class="dropdown" id="projects-menu" aria-labelledby="projects-toggle">' + projects + '</ul>' +
              '</li>' +
              '<li class="site-nav__item"><a class="nav-link" href="' + r + 'about-me"' + current(el, 'about-me') + '>About Me</a></li>' +
              '<li class="site-nav__item"><a class="nav-link" href="' + r + 'contact"' + current(el, 'contact') + '>Contact</a></li>' +
              '<li class="site-nav__item">' +
                '<a class="nav-link nav-link--underlined" href="' + r + 'cv/resume-stepan-kristina.pdf" download="resume-stepan-kristina.pdf">Get CV</a>' +
              '</li>' +
            '</ul>' +
          '</nav>' +
        '</div>' +
      '</header>' +
      (el.hasAttribute('offset') ? '<div class="site-header-spacer" aria-hidden="true"></div>' : '');
  }

  function footerHTML(el) {
    var r = rootOf(el);
    return '' +
      '<footer class="site-footer section">' +
        '<div class="decor" aria-hidden="true">' +
          '<img class="decor__item site-footer__ribbon" src="' + r + 'img/home/footer-ribbon.svg" width="2192.02" height="899.431" alt="" />' +
        '</div>' +
        '<div class="site-footer__card container stack">' +
          '<p class="site-footer__title"><span class="site-footer__title-regular">Let\'s work</span> <strong>together</strong></p>' +
          '<div class="site-footer__row">' +
            '<ul class="footer-links" aria-label="Contact">' +
              '<li>' +
                '<a class="footer-link" href="mailto:stepankristina419@gmail.com">' +
                  '<img src="' + r + 'img/home/footer-mail.svg" width="12" height="10" alt="" />' +
                  '<span class="footer-link__text"><span class="visually-hidden">Email: </span>stepankristina419@gmail.com</span>' +
                '</a>' +
              '</li>' +
              '<li>' +
                '<a class="footer-link" href="https://www.linkedin.com/in/kristina-stepan/" target="_blank" rel="noopener">' +
                  '<img src="' + r + 'img/home/footer-linkedin.svg" width="12" height="12" alt="" />' +
                  '<span class="footer-link__text"><span class="visually-hidden">LinkedIn: </span>Kristina Stepan<span class="visually-hidden"> (opens in a new tab)</span></span>' +
                '</a>' +
              '</li>' +
            '</ul>' +
            '<div class="site-footer__note">' +
              '<p class="site-footer__text">Working on a digital product or need design advice? <br />Ping me for a collaboration or just to chat things through.</p>' +
              '<img class="site-footer__figure" src="' + r + 'img/home/footer-figure.svg" width="22.892" height="60.9401" alt="" />' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  // Replace the placeholder element with real markup (no wrapper left behind).
  function render(el, html) {
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    el.replaceWith(tpl.content);
  }

  customElements.define('site-header', class extends HTMLElement {
    connectedCallback() { render(this, headerHTML(this)); }
  });

  customElements.define('site-footer', class extends HTMLElement {
    connectedCallback() { render(this, footerHTML(this)); }
  });

  /* ---------- Header behaviour: Projects dropdown + mobile menu ---------- */

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var burger = header.querySelector('.site-header__burger');
    var projectsToggle = header.querySelector('#projects-toggle');

    function setProjects(open) {
      projectsToggle.setAttribute('aria-expanded', String(open));
    }

    function setMenu(open) {
      header.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (!open) setProjects(false);
    }

    projectsToggle.addEventListener('click', function () {
      setProjects(projectsToggle.getAttribute('aria-expanded') !== 'true');
    });

    burger.addEventListener('click', function () {
      setMenu(!header.classList.contains('is-open'));
    });

    // Close menus on outside click, Escape, or when focus leaves the header.
    document.addEventListener('click', function (e) {
      if (header.contains(e.target)) {
        if (!e.target.closest('.site-nav__item--dropdown')) setProjects(false);
        return;
      }
      setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (projectsToggle.getAttribute('aria-expanded') === 'true') {
        setProjects(false);
        projectsToggle.focus();
      } else if (header.classList.contains('is-open')) {
        setMenu(false);
        burger.focus();
      }
    });

    header.addEventListener('focusout', function (e) {
      if (!header.contains(e.relatedTarget)) setMenu(false);
    });

    // Back to desktop width: drop the mobile menu state.
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHeader);
  else initHeader();
})();
