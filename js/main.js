/* Marcos Takahashi | Personal Trainer — interações */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hasIO = 'IntersectionObserver' in window;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* ---------- Ano no rodapé ---------- */
    var year = document.querySelector('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());

    /* ---------- Header: fundo após 80px de scroll ---------- */
    var header = document.querySelector('.site-header');
    function onScrollHeader() {
      header.classList.toggle('is-scrolled', window.scrollY > 80);
    }

    /* ---------- Revelação ao entrar na viewport (stagger 60ms) ---------- */
    var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (hasIO) {
      var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { revealIO.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- Navegação ativa (scrollspy) ---------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav__link'));
    var sections = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    function onScrollSpy() {
      var marker = window.scrollY + window.innerHeight * 0.35;
      var current = null;
      sections.forEach(function (sec) {
        if (sec.offsetTop <= marker) current = sec;
      });
      navLinks.forEach(function (a) {
        var active = current && a.getAttribute('href') === '#' + current.id;
        a.classList.toggle('is-active', !!active);
        if (active) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }

    /* Foco acompanha a âncora (acessibilidade do teclado) */
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      window.setTimeout(function () { target.focus({ preventScroll: true }); }, reduceMotion.matches ? 0 : 450);
    });

    /* ---------- Gráfico do método: trajetória guiada pelo scroll ---------- */
    var journey = document.querySelector('.journey');
    var journeyPath = journey && journey.querySelector('.journey__path');
    var nodes = journey ? Array.prototype.slice.call(journey.querySelectorAll('.journey__node')) : [];
    var steps = journey ? Array.prototype.slice.call(journey.querySelectorAll('.step')) : [];
    var nodeAt = [0, 0.3, 0.58, 1];

    function setJourney(progress) {
      if (!journeyPath) return;
      journeyPath.setAttribute('stroke-dashoffset', String(1 - progress));
      var current = -1;
      nodeAt.forEach(function (at, i) { if (progress >= at - 0.001) current = i; });
      nodes.forEach(function (n, i) {
        n.classList.toggle('is-reached', i <= current);
        n.classList.toggle('is-current', i === current);
      });
      steps.forEach(function (s, i) { s.classList.toggle('is-current', i === current); });
      journey.classList.toggle('is-complete', progress >= 0.999);
    }

    function onScrollJourney() {
      if (!journey) return;
      if (reduceMotion.matches) { setJourney(1); return; }
      var rect = journey.getBoundingClientRect();
      var vh = window.innerHeight;
      /* começa quando o topo do gráfico entra a 85% da tela e completa quando chega a 30% */
      var start = vh * 0.85;
      var end = vh * 0.3;
      var p = (start - rect.top) / (start - end);
      setJourney(Math.max(0, Math.min(1, p)));
    }

    /* ---------- Botão flutuante ---------- */
    var floatCta = document.querySelector('.float-cta');
    var hero = document.querySelector('.hero');
    var contact = document.querySelector('#contato');
    var heroOut = false;
    var contactIn = false;

    function updateFloat() {
      var show = heroOut && !contactIn;
      floatCta.classList.toggle('is-visible', show);
      floatCta.setAttribute('aria-hidden', show ? 'false' : 'true');
      floatCta.setAttribute('tabindex', show ? '0' : '-1');
    }

    if (floatCta && hasIO) {
      new IntersectionObserver(function (entries) {
        heroOut = !entries[0].isIntersecting;
        updateFloat();
      }, { threshold: 0 }).observe(hero);

      new IntersectionObserver(function (entries) {
        contactIn = entries[0].isIntersecting;
        updateFloat();
      }, { threshold: 0.15 }).observe(contact);
    }

    /* ---------- Loop de scroll (rAF) ---------- */
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        onScrollHeader();
        onScrollSpy();
        onScrollJourney();
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onScroll);
    onScroll();
  });
})();
