// =============================================
// MARIAN KNÜTTER — PORTFOLIO ENGINE (Apple-Redesign)
// Ruhig & minimal: Typing, Reveal, Counter,
// Overlay-Vorschau, Hamburger, Header-State
// =============================================

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =============================================
  // 1. TYPING ANIMATION
  // =============================================
  const typedTextEl = document.getElementById('typed-text');
  if (typedTextEl && prefersReducedMotion) {
    typedTextEl.textContent = 'Marian Knütter.';
    const tc = document.getElementById('typing-cursor');
    if (tc) tc.style.display = 'none';
  } else if (typedTextEl) {
    const phrases = [
      'Ich baue das Web von morgen.',
      'Code. Create. Repeat.',
      'Marian Knütter.',
      'Bereit für neue Herausforderungen.'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
      const currentPhrase = phrases[phraseIndex];
      let speed;

      if (isDeleting) {
        charIndex--;
        speed = 35;
      } else {
        charIndex++;
        speed = 70 + Math.random() * 30;
      }

      typedTextEl.textContent = currentPhrase.substring(0, charIndex);

      if (!isDeleting && charIndex === currentPhrase.length) {
        speed = 2500;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 400;
      }

      setTimeout(typeEffect, speed);
    }

    setTimeout(typeEffect, 900);
  }

  // =============================================
  // 2. HEADER SCROLL STATE
  // =============================================
  const siteHeader = document.getElementById('site-header');
  let scrollTicking = false;

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(function () {
      if (siteHeader) {
        siteHeader.classList.toggle('scrolled', window.scrollY > 20);
      }
      scrollTicking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // =============================================
  // 3. SCROLL REVEAL
  // =============================================
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
  revealElements.forEach(function (el) { revealObserver.observe(el); });

  // =============================================
  // 4. COUNTER ANIMATION
  // =============================================
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const duration = 1800;

    function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const val = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
      el.textContent = Math.floor(val * target).toLocaleString('de-DE') + suffix;
      if (t < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString('de-DE') + suffix;
    }
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString('de-DE') + suffix;
    } else {
      requestAnimationFrame(update);
    }
  }

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(function (el) { counterObserver.observe(el); });

  // =============================================
  // 5. PORTFOLIO OVERLAY (Live-Vorschau)
  // =============================================
  const overlay = document.getElementById('projekt-overlay');
  const overlayIframe = document.getElementById('overlay-iframe');
  const overlayClose = document.getElementById('overlay-close');
  let overlayOpen = false;

  const projektCards = document.querySelectorAll('.projekt-card');

  function openCard(card) {
    const src = card.dataset.src;
    if (src) overlayIframe.src = src;
    overlay.classList.add('active');
    overlayOpen = true;
    document.body.style.overflow = 'hidden';
    if (overlayClose) overlayClose.focus();
  }

  projektCards.forEach(function (card) {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const titleEl = card.querySelector('h3');
    if (titleEl) card.setAttribute('aria-label', titleEl.textContent + ' – Live-Vorschau öffnen');

    card.addEventListener('click', function () { openCard(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard(card);
      }
    });
  });

  function closeOverlay() {
    overlay.classList.remove('active');
    overlayOpen = false;
    document.body.style.overflow = '';
    setTimeout(function () { overlayIframe.src = ''; }, 400);
  }

  if (overlayClose) {
    overlayClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closeOverlay();
    });
  }
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlayOpen) closeOverlay();
  });

  // =============================================
  // 6. HAMBURGER MENU
  // =============================================
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      const open = mobileNav.classList.contains('active');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Menü öffnen');
        document.body.style.overflow = '';
      });
    });
  }

})();
