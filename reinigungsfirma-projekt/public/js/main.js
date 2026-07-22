/* ============================================
   REINIGUNGSFIRMA TEAM HAMBURG – Frontend JS
   Vollständig überarbeitet & erweitert
   ============================================ */

// ---- 1. Scroll Progress Bar ----
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }, { passive: true });
}

// ---- 2. Header Scroll-Effekt ----
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ---- 3. Aktiver Nav-Link beim Scrollen ----
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = document.querySelectorAll('section[id]');

function setActiveNavLink() {
  let currentSection = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentSection) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', setActiveNavLink, { passive: true });

// ---- 4. Mobile Menü ----
const menuBtn = document.getElementById('mobile-menu-btn');
const navLinksContainer = document.getElementById('nav-links');

if (menuBtn && navLinksContainer) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navLinksContainer.classList.toggle('active');
    menuBtn.classList.toggle('active', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Menü schließen wenn ein Link geklickt wird
  navLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinksContainer.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Menü schließen bei Klick außerhalb
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && navLinksContainer.classList.contains('active')) {
      navLinksContainer.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// ---- 5. Scroll-Animationen (IntersectionObserver) ----
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

if (revealElements.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// ---- 6. Kontaktformular ----
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  const submitBtn = document.getElementById('form-submit-btn');
  const formContent = document.getElementById('form-content');
  const formSuccess = document.getElementById('form-success');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name')?.value?.trim(),
      email: document.getElementById('email')?.value?.trim(),
      phone: document.getElementById('phone')?.value?.trim(),
      service: document.getElementById('service')?.value,
      message: document.getElementById('message')?.value?.trim(),
    };

    // Validierung
    if (!formData.name || !formData.email || !formData.message) {
      showFormError('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    // E-Mail-Format prüfen
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showFormError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    // Button-Zustand: Laden
    if (submitBtn) {
      submitBtn.textContent = '⏳ Wird gesendet...';
      submitBtn.disabled = true;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Erfolg anzeigen
        if (formContent) formContent.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
        contactForm.reset();
      } else {
        showFormError('Fehler: ' + (result.message || 'Unbekannter Fehler.'));
        resetSubmitBtn();
      }
    } catch (error) {
      showFormError('Verbindungsfehler. Bitte versuchen Sie es später erneut oder rufen Sie uns direkt an.');
      resetSubmitBtn();
    }
  });

  function showFormError(msg) {
    // Altes Error-Element entfernen
    const existing = contactForm.querySelector('.form-error-msg');
    if (existing) existing.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-msg';
    errorDiv.style.cssText = 'background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;padding:12px 16px;border-radius:8px;font-size:0.85rem;margin-bottom:16px;';
    errorDiv.textContent = '❌ ' + msg;
    if (submitBtn) submitBtn.before(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  function resetSubmitBtn() {
    if (submitBtn) {
      submitBtn.textContent = 'Nachricht senden';
      submitBtn.disabled = false;
    }
  }
}

// ---- 7. Testimonials Karussell ----
function initCarousel() {
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track) return;

  // Immer frische DOM-Referenzen holen (wichtig nach API-Reload!)
  function getCards() {
    return track.querySelectorAll('.testimonial-card');
  }

  function getCardsPerView() {
    return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  }

  let currentIndex = 0;
  let autoPlayInterval = null;

  // Transition einmalig setzen
  track.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';

  function getMaxIndex() {
    const cards = getCards();
    const perView = getCardsPerView();
    return Math.max(0, cards.length - perView);
  }

  function goTo(index) {
    const cards = getCards();
    if (cards.length === 0) return;

    const max = getMaxIndex();
    currentIndex = Math.max(0, Math.min(index, max));

    const firstCard = cards[0];
    const cardWidth = firstCard.getBoundingClientRect().width + 24; // 24px = gap
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    updateDots();
  }

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const max = getMaxIndex();
    for (let i = 0; i <= max; i++) {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
      dot.addEventListener('click', () => { goTo(i); resetAutoPlay(); });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(() => {
      const max = getMaxIndex();
      const next = currentIndex >= max ? 0 : currentIndex + 1;
      goTo(next);
    }, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Buttons
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(currentIndex - 1); resetAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(currentIndex + 1); resetAutoPlay(); });

  // Swipe-Unterstützung
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
      resetAutoPlay();
    }
  }, { passive: true });

  // Resize-Handler
  window.addEventListener('resize', () => {
    const max = getMaxIndex();
    if (currentIndex > max) currentIndex = max;
    renderDots();
    goTo(currentIndex);
  }, { passive: true });

  // Echte Bewertungen laden (falls API verfügbar)
  fetch('/api/public/reviews')
    .then(r => r.json())
    .then(data => {
      if (data.reviews && data.reviews.length >= 3) {
        // Transition kurz ausschalten für den Inhaltswechsel
        track.style.transition = 'none';
        currentIndex = 0;
        track.style.transform = 'translateX(0)';

        track.innerHTML = data.reviews.map(r => `
          <div class="testimonial-card">
            <div class="testimonial-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <p class="testimonial-quote">${r.comment || 'Sehr zufrieden mit der Reinigung!'}</p>
            <div class="testimonial-name">${r.name}</div>
            <div class="testimonial-service">${r.service}</div>
          </div>
        `).join('');

        // Transition nach einem Frame wieder einschalten
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            track.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
          });
        });
      }
    })
    .catch(() => { })
    .finally(() => {
      renderDots();
      startAutoPlay();
    });

  // Sofort-Init mit Fallback-Karten
  renderDots();
  startAutoPlay();
}

document.addEventListener('DOMContentLoaded', initCarousel);

// ---- 8. FAQ Akkordeon ----
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Alle anderen schließen
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherQ = other.querySelector('.faq-question');
          if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
        }
      });

      // Aktuelles Item umschalten
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', !isOpen);
    });
  });
}

document.addEventListener('DOMContentLoaded', initFAQ);

// ---- 9. Back-to-top Button ----
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- 10. WhatsApp-Button Tooltip ----
const whatsappFloat = document.getElementById('whatsapp-float');
if (whatsappFloat) {
  // Nach kurzer Zeit Tooltip zeigen
  setTimeout(() => {
    whatsappFloat.style.animation = 'none';
  }, 3500);
}

// ---- 11. Öffnungszeiten: Heute hervorheben ----
function highlightTodaysHours() {
  const now = new Date();
  const day = now.getDay(); // 0=So, 1=Mo, ..., 6=Sa
  const hour = now.getHours();

  // Mo-Fr markieren
  const moRow = document.getElementById('hours-mo');
  if (moRow && day >= 1 && day <= 5) {
    const timeEl = moRow.querySelector('.hours-time');
    if (timeEl && hour >= 7 && hour < 18) {
      timeEl.innerHTML = '<span class="hours-dot"></span>' + timeEl.textContent;
      timeEl.classList.add('today');
    }
  }
}

document.addEventListener('DOMContentLoaded', highlightTodaysHours);

// ---- 12. Smooth Scroll für Anker-Links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ---- 13. Lazy-Load für Bilder ----
if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
}

// ---- 14. Keyboard Accessibility ----
document.addEventListener('keydown', (e) => {
  // ESC schließt mobile Menü
  if (e.key === 'Escape') {
    if (navLinksContainer && navLinksContainer.classList.contains('active')) {
      navLinksContainer.classList.remove('active');
      if (menuBtn) {
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }
    // ESC schließt FAQ
    document.querySelectorAll('.faq-item.open').forEach(item => {
      item.classList.remove('open');
    });
  }
});
