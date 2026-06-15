(function () {
  'use strict';

  // ── Header scroll shadow ──────────────────────────────────
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ── Mobile menu ───────────────────────────────────────────
  var toggleBtn = document.querySelector('.nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      toggleBtn.classList.toggle('open', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        toggleBtn.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Active nav link ───────────────────────────────────────
  var currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.nav-link[href]').forEach(function (link) {
    var linkPath = link.getAttribute('href').replace(/\/+$/, '') || '/';
    if (linkPath !== '/' && currentPath.indexOf(linkPath) === 0) {
      link.classList.add('active');
    } else if (linkPath === '/' && (currentPath === '/' || currentPath === '/index.html')) {
      link.classList.add('active');
    }
  });

  // ── Footer year ───────────────────────────────────────────
  var yr = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = yr;
  });

  // ── Smooth scroll for in-page anchors ─────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

})();
