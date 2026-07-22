/*
  script.js – Premium Animations & Interactive Logic

  Features:
  1. Smooth RAF-based Scroll-Reveal (3D rotateX emerge)
  2. Produkt-Filter
  3. Mobile Hamburger Menu
  4. Sticky Header
  5. Immersive 3D Hero: mouse-tracking + parallax depth layers
  6. 3D Card Tilt on all cards (Apple-style)
  7. Magnetic Buttons
  8. T-Shirt Designer (Farbe, Muster, Text, Canvas)
  9. Shopping Cart & Checkout
*/

// =============================================
// GLOBAL: Smooth mouse position tracker (RAF-based)
// =============================================
const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

document.addEventListener('mousemove', function (e) {
  mouse.tx = e.clientX / window.innerWidth;
  mouse.ty = e.clientY / window.innerHeight;
});

// Smooth interpolation loop
(function rafLoop() {
  mouse.x += (mouse.tx - mouse.x) * 0.06;
  mouse.y += (mouse.ty - mouse.y) * 0.06;
  requestAnimationFrame(rafLoop);
})();


// =============================================
// 1. SCROLL-REVEAL – 3D emerge from depth
// =============================================

const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      // Stagger based on sibling index
      const siblings = Array.from(entry.target.parentElement.children);
      const index = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = (index * 80) + 'ms';
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  root: null,
  rootMargin: '0px 0px -60px 0px',
  threshold: 0.08
});

revealElements.forEach(function (el) {
  revealObserver.observe(el);
});


// =============================================
// 2. PRODUKT-FILTER
// =============================================
// Filtert Produkt-Karten nach Kategorie (data-category).

const filterButtons = document.querySelectorAll('.filter-btn');
const produktCards = document.querySelectorAll('.produkt-card');

filterButtons.forEach(function (btn) {
  btn.addEventListener('click', function () {
    // Aktiven Button wechseln
    filterButtons.forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    // Filter auslesen
    const filter = btn.dataset.filter;

    // Karten filtern
    produktCards.forEach(function (card) {
      if (filter === 'alle' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        // Reveal-Animation nochmal auslösen
        card.classList.remove('revealed');
        setTimeout(function () {
          card.classList.add('revealed');
        }, 50);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});


// =============================================
// 3. MOBILE HAMBURGER MENÜ
// =============================================

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Menü schließen beim Klick auf einen Link
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}


// =============================================
// 4. STICKY HEADER EFFEKT
// =============================================
// Header bekommt einen Schatten beim Scrollen.

const header = document.getElementById('header');

window.addEventListener('scroll', function () {
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
  } else {
    header.style.boxShadow = 'none';
  }
});


// =============================================
// 5. IMMERSIVE 3D HERO – mouse-tracking + parallax
// =============================================

const tshirtScene = document.getElementById('tshirt-scene');
const tshirt3d = document.getElementById('tshirt-3d');
const heroContent = document.querySelector('.hero-content');
const heroSection = document.querySelector('.hero');

if (tshirt3d) {
  let floatPaused = false;
  let currentRotY = 0, currentRotX = 0;
  let targetRotY = 0, targetRotX = 0;

  // RAF animation loop for hero
  (function heroRaf() {
    if (!floatPaused) {
      // Only auto-float when not interacting
      requestAnimationFrame(heroRaf);
      return;
    }
    // Smooth interpolation toward target
    currentRotY += (targetRotY - currentRotY) * 0.08;
    currentRotX += (targetRotX - currentRotX) * 0.08;

    tshirt3d.style.transform =
      'translateY(-18px) rotateY(' + currentRotY + 'deg) rotateX(' + currentRotX + 'deg) scale(1.04)';

    // Hero content subtle counter-tilt (parallax)
    if (heroContent) {
      heroContent.style.transform =
        'translateX(' + (-currentRotY * 0.15) + 'px) translateY(' + (-currentRotX * 0.1) + 'px)';
    }

    requestAnimationFrame(heroRaf);
  })();

  // Global mouse → hero 3D
  document.addEventListener('mousemove', function (e) {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    // Only affect when cursor is in the upper half of page
    if (rect.bottom < 0) return;

    const cx = e.clientX / window.innerWidth - 0.5;  // -0.5 to 0.5
    const cy = e.clientY / window.innerHeight - 0.5;

    targetRotY = cx * 28;
    targetRotX = -cy * 18;

    if (!floatPaused) {
      floatPaused = true;
      tshirt3d.style.animation = 'none';
    }
  });

  // Scene mouse enter — increase intensity
  if (tshirtScene) {
    tshirtScene.addEventListener('mouseenter', function () {
      tshirt3d.style.transition = 'filter 0.4s ease';
      tshirt3d.style.filter = 'drop-shadow(0 40px 80px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(99,102,241,0.4))';
    });
    tshirtScene.addEventListener('mouseleave', function () {
      tshirt3d.style.filter = '';
    });
  }

  // On scroll past hero: restore float animation
  window.addEventListener('scroll', function () {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0 && floatPaused) {
      floatPaused = false;
      tshirt3d.style.animation = '';
      tshirt3d.style.transform = '';
      if (heroContent) heroContent.style.transform = '';
    }
  }, { passive: true });
}


// =============================================
// 5b. 3D CARD TILT – all cards (Apple-style)
// =============================================

function initCardTilt(selector, intensity) {
  intensity = intensity || 12;
  document.querySelectorAll(selector).forEach(function (card) {
    let rx = 0, ry = 0, trx = 0, try_ = 0;
    let rafId = null;
    let active = false;

    function animate() {
      rx += (trx - rx) * 0.1;
      ry += (try_ - ry) * 0.1;
      card.style.transform =
        'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(8px)';
      card.style.boxShadow =
        '0 ' + (20 + Math.abs(rx)) + 'px ' + (50 + Math.abs(ry) * 2) + 'px rgba(0,0,0,0.45), ' +
        '0 0 30px rgba(255,107,53,' + (0.05 + Math.abs(ry) / intensity * 0.15) + ')';

      if (active || Math.abs(rx) > 0.1 || Math.abs(ry) > 0.1) {
        rafId = requestAnimationFrame(animate);
      } else {
        card.style.transform = '';
        card.style.boxShadow = '';
      }
    }

    card.addEventListener('mousemove', function (e) {
      const r = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      trx = -cy * intensity;
      try_ = cx * intensity;
      if (!active) {
        active = true;
        rafId = requestAnimationFrame(animate);
      }
    });

    card.addEventListener('mouseleave', function () {
      active = false;
      trx = 0;
      try_ = 0;
    });
  });
}

initCardTilt('.produkt-card', 10);
initCardTilt('.step-card', 8);
initCardTilt('.vorteil-card', 7);


// =============================================
// 5c. MAGNETIC BUTTONS
// =============================================

document.querySelectorAll('.btn-primary, .btn-secondary').forEach(function (btn) {
  btn.addEventListener('mousemove', function (e) {
    const r = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    btn.style.transform = 'translate(' + dx * 0.25 + 'px, ' + dy * 0.25 + 'px) scale(1.04)';
  });
  btn.addEventListener('mouseleave', function () {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  });
});


// =============================================
// 5d. PARALLAX SCROLL – background depth
// =============================================

(function () {
  const glows = document.querySelectorAll('.ambient-glow-blob');
  const heroBadge = document.querySelector('.hero-badge');
  const heroH1 = document.querySelector('.hero h1');
  const heroP = document.querySelector('.hero p');

  window.addEventListener('scroll', function () {
    const sy = window.scrollY;
    const pct = Math.min(sy / window.innerHeight, 1);

    // Background glows move at different speeds
    glows.forEach(function (g, i) {
      const dir = i % 2 === 0 ? -1 : 1;
      g.style.transform = 'translateY(' + (sy * (0.15 + i * 0.08) * dir) + 'px)';
    });

    // Hero text parallax
    if (heroH1) heroH1.style.transform = 'translateY(' + (sy * 0.22) + 'px)';
    if (heroP) heroP.style.transform = 'translateY(' + (sy * 0.16) + 'px)';
    if (heroBadge) heroBadge.style.transform = 'translateY(' + (sy * 0.1) + 'px)';
  }, { passive: true });
})();


// =============================================
// 6. T-SHIRT DESIGNER
// =============================================
// Volle Designer-Logik: Farbe, Muster/Upload, Text.
// Verwendet HTML5 Canvas zum Zeichnen des Designs.

(function () {
  'use strict';

  // --- DOM-Elemente ---
  const tshirtBody = document.getElementById('tshirt-body');
  const canvas = document.getElementById('design-canvas');
  const dragHint = document.getElementById('drag-hint');
  if (!canvas || !tshirtBody) return; // Kein Designer auf der Seite

  const ctx = canvas.getContext('2d');

  // --- Designer State ---
  // Alle Daten, die das aktuelle Design beschreiben
  const state = {
    tshirtColor: '#ffffff',
    image: null,         // HTMLImageElement oder null
    imageX: 0,           // Position des Bildes auf dem Canvas
    imageY: 0,
    imageWidth: 0,
    imageHeight: 0,
    texts: [],           // Array von Text-Objekten
    isDragging: false,
    dragTarget: null,     // 'image' oder Index in texts[]
    dragOffsetX: 0,
    dragOffsetY: 0,
    activeProduct: 'Basic T-Shirt Herren',
    activeProductVal: 'herren-shirt',
    price: 12.99,
    size: 'M',
    quantity: 1
  };

  const svgPaths = {
    'herren-shirt': 'M80 120 L20 155 L55 210 L100 178 L100 410 L300 410 L300 178 L345 210 L380 155 L320 120 L270 100 L248 128 C230 150 170 150 152 128 L130 100 Z',
    'damen-shirt': 'M80 120 L20 150 L50 200 L95 175 L105 240 C110 320 120 380 120 410 L280 410 C280 380 290 320 295 240 L305 175 L350 200 L380 150 L320 120 L270 100 L248 128 C230 150 170 150 152 128 L130 100 Z',
    'hoodie': 'M80 120 L15 150 L35 280 L70 270 L100 200 L100 420 L300 420 L300 200 L330 270 L365 280 L385 150 L320 120 L280 90 L260 110 C230 125 170 125 152 110 L120 90 Z',
    'kinder-shirt': 'M80 120 L20 155 L55 210 L100 178 L100 410 L300 410 L300 178 L345 210 L380 155 L320 120 L270 100 L248 128 C230 150 170 150 152 128 L130 100 Z',
    'tank-top': 'M120 120 L100 150 L115 190 L125 410 L275 410 L285 190 L300 150 L280 120 L230 110 C210 135 190 135 170 110 Z',
    'cap': 'M130 250 C130 160 270 160 270 250 Z'
  };

  function updateProductView(productType) {
    const body = document.getElementById('tshirt-body');
    const svg = document.getElementById('preview-tshirt-svg');
    const previewContainer = document.getElementById('preview-container');
    if (!body || !svg) return;

    const paths = svg.querySelectorAll('path');

    let brim = document.getElementById('cap-brim');
    if (!brim) {
      brim = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      brim.setAttribute('id', 'cap-brim');
      brim.setAttribute('d', 'M110 250 C110 250 200 285 290 250 C300 275 280 285 200 285 C120 285 100 275 110 250 Z');
      brim.setAttribute('fill', '#d0d0d0');
      brim.setAttribute('stroke', 'rgba(0,0,0,0.1)');
      brim.setAttribute('stroke-width', '1.5');
      brim.style.display = 'none';
      svg.appendChild(brim);
    }

    let pocket = document.getElementById('hoodie-pocket');
    if (!pocket) {
      pocket = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pocket.setAttribute('id', 'hoodie-pocket');
      pocket.setAttribute('d', 'M140 310 L260 310 L275 365 L125 365 Z');
      pocket.setAttribute('fill', 'none');
      pocket.setAttribute('stroke', 'rgba(0,0,0,0.15)');
      pocket.setAttribute('stroke-width', '2');
      pocket.style.display = 'none';
      svg.appendChild(pocket);
    }

    paths.forEach(function (p) {
      if (p.id !== 'tshirt-body') p.style.display = '';
    });
    brim.style.display = 'none';
    pocket.style.display = 'none';
    if (previewContainer) previewContainer.classList.remove('cap-mode');

    body.setAttribute('d', svgPaths[productType] || svgPaths['herren-shirt']);

    if (productType === 'cap') {
      paths.forEach(function (p) {
        if (p.id !== 'tshirt-body') p.style.display = 'none';
      });
      brim.style.display = '';
      brim.setAttribute('fill', state.tshirtColor);
      if (previewContainer) previewContainer.classList.add('cap-mode');
    } else if (productType === 'hoodie') {
      pocket.style.display = '';
    } else if (productType === 'tank-top') {
      if (paths[2]) paths[2].style.display = 'none';
      if (paths[3]) paths[3].style.display = 'none';
    }
  }


  // ===== RENDER-FUNKTION =====
  // Zeichnet das gesamte Canvas neu.
  // Wird bei JEDER Änderung aufgerufen.
  function render() {
    // Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bild zeichnen (falls vorhanden)
    if (state.image) {
      ctx.drawImage(
        state.image,
        state.imageX, state.imageY,
        state.imageWidth, state.imageHeight
      );
    }

    // Alle Texte zeichnen
    state.texts.forEach(function (t) {
      var fontStyle = '';
      if (t.bold) fontStyle += 'bold ';
      if (t.italic) fontStyle += 'italic ';
      fontStyle += t.size + 'px ' + t.font;

      ctx.font = fontStyle;
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      var text = t.uppercase ? t.text.toUpperCase() : t.text;
      ctx.fillText(text, t.x, t.y);
    });
  }


  // ===== T-SHIRT FARBE =====

  // Farb-Swatches (vordefinierte Farben)
  var colorSwatches = document.querySelectorAll('.color-swatch');
  var customColorInput = document.getElementById('custom-color-input');

  function setTshirtColor(color) {
    state.tshirtColor = color;
    // SVG-Pfad-Farbe ändern
    tshirtBody.setAttribute('fill', color);
    var brim = document.getElementById('cap-brim');
    if (brim) brim.setAttribute('fill', color);

    // Aktiven Swatch markieren
    colorSwatches.forEach(function (s) {
      if (s.dataset.color === color) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });

    // Custom-Color-Input synchronisieren
    if (customColorInput) {
      customColorInput.value = color;
    }
  }

  colorSwatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      setTshirtColor(swatch.dataset.color);
    });
  });

  if (customColorInput) {
    customColorInput.addEventListener('input', function () {
      setTshirtColor(customColorInput.value);
    });
  }


  // ===== TAB-NAVIGATION =====

  var toolTabs = document.querySelectorAll('.tool-tab');
  var toolPanels = document.querySelectorAll('.tool-panel');

  toolTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      // Aktiven Tab wechseln
      toolTabs.forEach(function (t) { t.classList.remove('active'); });
      toolPanels.forEach(function (p) { p.classList.remove('active'); });

      tab.classList.add('active');
      var targetPanel = document.getElementById(tab.dataset.tab);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });


  // ===== BILD HOCHLADEN (FileReader API) =====

  var uploadZone = document.getElementById('upload-zone');
  var fileInput = document.getElementById('file-input');

  // Klick auf Upload-Zone öffnet den File-Dialog
  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', function () {
      fileInput.click();
    });

    // Datei ausgewählt
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) {
        loadImageFile(fileInput.files[0]);
      }
    });

    // Drag & Drop über die Upload-Zone
    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', function () {
      uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Bild laden mit der FileReader API
  function loadImageFile(file) {
    // Dateigröße prüfen (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Die Datei ist zu groß! Maximal 5 MB erlaubt.');
      return;
    }

    // Nur Bilder erlauben
    if (!file.type.startsWith('image/')) {
      alert('Bitte nur Bilddateien hochladen (JPG, PNG, SVG).');
      return;
    }

    var reader = new FileReader();

    reader.onload = function (e) {
      // Das Ergebnis ist eine Data-URL (base64-codiertes Bild)
      var img = new Image();
      img.onload = function () {
        placeImageOnCanvas(img);
        showDragHint();
      };
      img.src = e.target.result;
    };

    // Datei als Data-URL lesen
    reader.readAsDataURL(file);
  }

  // Bild auf dem Canvas platzieren (zentriert, skaliert)
  function placeImageOnCanvas(img) {
    state.image = img;

    // Skalieren, damit das Bild in den Canvas passt
    var maxW = canvas.width * 0.8;
    var maxH = canvas.height * 0.7;
    var scale = Math.min(maxW / img.width, maxH / img.height, 1);

    state.imageWidth = img.width * scale;
    state.imageHeight = img.height * scale;

    // Zentrieren
    state.imageX = (canvas.width - state.imageWidth) / 2;
    state.imageY = (canvas.height - state.imageHeight) / 2;

    render();
  }


  // ===== VORGEFERTIGTE MUSTER =====

  var patternCards = document.querySelectorAll('.pattern-card');

  patternCards.forEach(function (card) {
    card.addEventListener('click', function () {
      // Aktives Muster markieren
      patternCards.forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');

      // Muster laden
      var patternSrc = card.dataset.pattern;
      var img = new Image();
      img.onload = function () {
        placeImageOnCanvas(img);
        showDragHint();
      };
      img.src = patternSrc;
    });
  });


  // ===== TEXT HINZUFÜGEN =====

  var textInput = document.getElementById('text-input');
  var fontSelect = document.getElementById('font-select');
  var fontSizeSlider = document.getElementById('font-size');
  var fontSizeValue = document.getElementById('font-size-value');
  var textColorInput = document.getElementById('text-color');
  var btnBold = document.getElementById('btn-bold');
  var btnItalic = document.getElementById('btn-italic');
  var btnUppercase = document.getElementById('btn-uppercase');
  var btnAddText = document.getElementById('btn-add-text');

  // Text-Stile toggeln
  var isBold = false;
  var isItalic = false;
  var isUppercase = false;

  if (btnBold) {
    btnBold.addEventListener('click', function () {
      isBold = !isBold;
      btnBold.classList.toggle('active');
    });
  }

  if (btnItalic) {
    btnItalic.addEventListener('click', function () {
      isItalic = !isItalic;
      btnItalic.classList.toggle('active');
    });
  }

  if (btnUppercase) {
    btnUppercase.addEventListener('click', function () {
      isUppercase = !isUppercase;
      btnUppercase.classList.toggle('active');
    });
  }

  // Font-Size Label aktualisieren
  if (fontSizeSlider && fontSizeValue) {
    fontSizeSlider.addEventListener('input', function () {
      fontSizeValue.textContent = fontSizeSlider.value + 'px';
    });
  }

  // Text auf Canvas setzen
  if (btnAddText) {
    btnAddText.addEventListener('click', function () {
      var text = textInput ? textInput.value.trim() : '';
      if (!text) {
        alert('Bitte gib einen Text ein!');
        return;
      }

      var newText = {
        text: text,
        font: fontSelect ? fontSelect.value : 'Outfit',
        size: fontSizeSlider ? parseInt(fontSizeSlider.value) : 24,
        color: textColorInput ? textColorInput.value : '#000000',
        bold: isBold,
        italic: isItalic,
        uppercase: isUppercase,
        x: canvas.width / 2,
        y: canvas.height / 2 + (state.texts.length * 30) // Versetzt stapeln
      };

      state.texts.push(newText);
      render();
      showDragHint();

      // Input leeren für nächsten Text
      if (textInput) textInput.value = '';
    });
  }


  // ===== DRAG & DROP auf dem Canvas =====

  // Erkennt, ob Maus auf Bild oder Text trifft
  function getHitTarget(mx, my) {
    // Texte zuerst prüfen (obendrauf)
    for (var i = state.texts.length - 1; i >= 0; i--) {
      var t = state.texts[i];
      var fontStyle = '';
      if (t.bold) fontStyle += 'bold ';
      if (t.italic) fontStyle += 'italic ';
      fontStyle += t.size + 'px ' + t.font;
      ctx.font = fontStyle;

      var textStr = t.uppercase ? t.text.toUpperCase() : t.text;
      var metrics = ctx.measureText(textStr);
      var tw = metrics.width;
      var th = t.size;

      // Trefferfläche (zentriert)
      if (mx >= t.x - tw / 2 && mx <= t.x + tw / 2 &&
          my >= t.y - th / 2 && my <= t.y + th / 2) {
        return { type: 'text', index: i };
      }
    }

    // Bild prüfen
    if (state.image &&
        mx >= state.imageX && mx <= state.imageX + state.imageWidth &&
        my >= state.imageY && my <= state.imageY + state.imageHeight) {
      return { type: 'image' };
    }

    return null;
  }

  // Mausposition relativ zum Canvas berechnen
  function getCanvasPos(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  canvas.addEventListener('mousedown', function (e) {
    var pos = getCanvasPos(e);
    var hit = getHitTarget(pos.x, pos.y);

    if (hit) {
      state.isDragging = true;
      state.dragTarget = hit;

      if (hit.type === 'image') {
        state.dragOffsetX = pos.x - state.imageX;
        state.dragOffsetY = pos.y - state.imageY;
      } else if (hit.type === 'text') {
        var t = state.texts[hit.index];
        state.dragOffsetX = pos.x - t.x;
        state.dragOffsetY = pos.y - t.y;
      }
      canvas.style.cursor = 'grabbing';
    }
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!state.isDragging || !state.dragTarget) return;

    var pos = getCanvasPos(e);

    if (state.dragTarget.type === 'image') {
      state.imageX = pos.x - state.dragOffsetX;
      state.imageY = pos.y - state.dragOffsetY;
    } else if (state.dragTarget.type === 'text') {
      var t = state.texts[state.dragTarget.index];
      t.x = pos.x - state.dragOffsetX;
      t.y = pos.y - state.dragOffsetY;
    }

    render();
  });

  canvas.addEventListener('mouseup', function () {
    state.isDragging = false;
    state.dragTarget = null;
    canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('mouseleave', function () {
    state.isDragging = false;
    state.dragTarget = null;
    canvas.style.cursor = 'grab';
  });

  // --- Touch-Support für Mobile ---
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    var touch = e.touches[0];
    var pos = getCanvasPos(touch);
    var hit = getHitTarget(pos.x, pos.y);

    if (hit) {
      state.isDragging = true;
      state.dragTarget = hit;

      if (hit.type === 'image') {
        state.dragOffsetX = pos.x - state.imageX;
        state.dragOffsetY = pos.y - state.imageY;
      } else if (hit.type === 'text') {
        var t = state.texts[hit.index];
        state.dragOffsetX = pos.x - t.x;
        state.dragOffsetY = pos.y - t.y;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (!state.isDragging || !state.dragTarget) return;

    var touch = e.touches[0];
    var pos = getCanvasPos(touch);

    if (state.dragTarget.type === 'image') {
      state.imageX = pos.x - state.dragOffsetX;
      state.imageY = pos.y - state.dragOffsetY;
    } else if (state.dragTarget.type === 'text') {
      var t = state.texts[state.dragTarget.index];
      t.x = pos.x - state.dragOffsetX;
      t.y = pos.y - state.dragOffsetY;
    }

    render();
  }, { passive: false });

  canvas.addEventListener('touchend', function () {
    state.isDragging = false;
    state.dragTarget = null;
  });


  // ===== ZURÜCKSETZEN =====

  var btnReset = document.getElementById('btn-reset');

  if (btnReset) {
    btnReset.addEventListener('click', function () {
      // State zurücksetzen
      state.image = null;
      state.imageX = 0;
      state.imageY = 0;
      state.imageWidth = 0;
      state.imageHeight = 0;
      state.texts = [];

      // Farbe auf Weiß
      setTshirtColor('#ffffff');

      // Muster-Auswahl aufheben
      patternCards.forEach(function (c) { c.classList.remove('active'); });

      // File-Input zurücksetzen
      if (fileInput) fileInput.value = '';

      // Canvas leeren
      render();
    });
  }


  // ===== DESIGN SPEICHERN (Download) =====

  var btnDownload = document.getElementById('btn-download');

  if (btnDownload) {
    btnDownload.addEventListener('click', function () {
      // Kombiniertes Bild erstellen:
      // T-Shirt SVG + Canvas-Design

      var exportCanvas = document.createElement('canvas');
      exportCanvas.width = 800;
      exportCanvas.height = 920;
      var exportCtx = exportCanvas.getContext('2d');

      // Hintergrund
      exportCtx.fillStyle = '#1a1a2e';
      exportCtx.fillRect(0, 0, 800, 920);

      // T-Shirt Farbe als großen Körper zeichnen
      exportCtx.fillStyle = state.tshirtColor;
      exportCtx.beginPath();
      // Vereinfachte T-Shirt-Form
      exportCtx.moveTo(160, 240);
      exportCtx.lineTo(40, 310);
      exportCtx.lineTo(110, 420);
      exportCtx.lineTo(200, 356);
      exportCtx.lineTo(200, 820);
      exportCtx.lineTo(600, 820);
      exportCtx.lineTo(600, 356);
      exportCtx.lineTo(690, 420);
      exportCtx.lineTo(760, 310);
      exportCtx.lineTo(640, 240);
      exportCtx.lineTo(540, 200);
      exportCtx.lineTo(496, 256);
      exportCtx.quadraticCurveTo(400, 310, 304, 256);
      exportCtx.lineTo(260, 200);
      exportCtx.closePath();
      exportCtx.fill();
      exportCtx.strokeStyle = '#e0e0e0';
      exportCtx.lineWidth = 2;
      exportCtx.stroke();

      // Design-Canvas drüber zeichnen (skaliert auf Export-Größe)
      var designScaleX = 360 / canvas.width;
      var designScaleY = 400 / canvas.height;
      exportCtx.drawImage(canvas, 220, 300, 360, 400);

      // Wasserzeichen
      exportCtx.font = '14px Inter, sans-serif';
      exportCtx.fillStyle = 'rgba(255,255,255,0.3)';
      exportCtx.textAlign = 'center';
      exportCtx.fillText('Erstellt mit TShirtDruck Designer', 400, 900);

      // Download auslösen
      var link = document.createElement('a');
      link.download = 'mein-tshirt-design.png';
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    });
  }


  // ===== DRAG-HINT =====

  function showDragHint() {
    if (dragHint) {
      dragHint.classList.add('visible');
      setTimeout(function () {
        dragHint.classList.remove('visible');
      }, 3000);
    }
  }

  // ===== E-COMMERCE SHOPPING CART & CHECKOUT SYSTEM =====

  var cart = [];
  try {
    var savedCart = localStorage.getItem('tshirt_cart');
    if (savedCart) cart = JSON.parse(savedCart);
  } catch (e) {
    console.error('Error loading cart:', e);
  }

  var cartToggleBtn = document.getElementById('cart-toggle-btn');
  var cartCloseBtn = document.getElementById('cart-close-btn');
  var cartOverlay = document.getElementById('cart-overlay');
  var cartSidebar = document.getElementById('cart-sidebar');
  var cartBadge = document.getElementById('cart-badge');
  var cartSidebarCount = document.getElementById('cart-sidebar-count');
  var cartItemsList = document.getElementById('cart-items-list');
  var cartEmptyState = document.getElementById('cart-empty-state');
  var cartFooter = document.getElementById('cart-footer');

  var cartSubtotal = document.getElementById('cart-subtotal');
  var cartShipping = document.getElementById('cart-shipping');
  var cartTax = document.getElementById('cart-tax');
  var cartTotal = document.getElementById('cart-total');

  var btnCheckout = document.getElementById('btn-checkout');
  var checkoutOverlay = document.getElementById('checkout-overlay');
  var checkoutCloseBtn = document.getElementById('checkout-close-btn');
  var checkoutForm = document.getElementById('checkout-form');
  var checkoutSummaryItems = document.getElementById('checkout-summary-items');
  var checkoutSubtotal = document.getElementById('checkout-subtotal');
  var checkoutShipping = document.getElementById('checkout-shipping');
  var checkoutTotal = document.getElementById('checkout-total');

  var checkoutLoading = document.getElementById('checkout-loading');
  var checkoutSuccess = document.getElementById('checkout-success');
  var checkoutMainView = document.getElementById('checkout-main-view');

  var sizeSelector = document.getElementById('size-selector');
  var productSelect = document.getElementById('product-select');
  var qtyMinus = document.getElementById('qty-minus');
  var qtyPlus = document.getElementById('qty-plus');
  var qtyInput = document.getElementById('qty-input');

  var summarySinglePrice = document.getElementById('summary-single-price');
  var summaryTotalPrice = document.getElementById('summary-total-price');
  var btnAddToCart = document.getElementById('btn-add-to-cart');
  var btnSuccessClose = document.getElementById('btn-success-close');

  function saveCart() {
    localStorage.setItem('tshirt_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    var totalCount = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    if (cartBadge) cartBadge.textContent = totalCount;
    if (cartSidebarCount) cartSidebarCount.textContent = totalCount;

    if (!cartItemsList) return;

    var itemCards = cartItemsList.querySelectorAll('.cart-item');
    itemCards.forEach(function (card) { card.remove(); });

    if (cart.length === 0) {
      if (cartEmptyState) cartEmptyState.style.display = 'block';
      if (cartFooter) cartFooter.style.display = 'none';
    } else {
      if (cartEmptyState) cartEmptyState.style.display = 'none';
      if (cartFooter) cartFooter.style.display = 'block';

      cart.forEach(function (item) {
        var itemHtml =
          '<div class="cart-item" data-id="' + item.id + '">' +
            '<div class="cart-item-img">' +
              '<img src="' + item.thumbnail + '" alt="' + item.productName + '">' +
            '</div>' +
            '<div class="cart-item-details">' +
              '<div class="cart-item-title">' + item.productName + '</div>' +
              '<div class="cart-item-meta">' +
                '<span>Größe: ' + item.size + '</span>' +
                '<span class="color-indicator-span" style="display:inline-flex; align-items:center; gap:4px;">' +
                  'Farbe: <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:' + item.color + '; border:1px solid rgba(255,255,255,0.2);"></span>' +
                '</span>' +
              '</div>' +
              '<div class="cart-item-bottom">' +
                '<div class="cart-item-qty">' +
                  '<button class="qty-btn cart-qty-minus" data-id="' + item.id + '">−</button>' +
                  '<span class="qty-val">' + item.quantity + '</span>' +
                  '<button class="qty-btn cart-qty-plus" data-id="' + item.id + '">+</button>' +
                '</div>' +
                '<div class="cart-item-price">' + (item.price * item.quantity).toFixed(2).replace('.', ',') + ' €</div>' +
              '</div>' +
            '</div>' +
            '<button class="cart-item-delete" data-id="' + item.id + '">×</button>' +
          '</div>';
        cartItemsList.insertAdjacentHTML('beforeend', itemHtml);
      });
    }

    var subtotal = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
    var shipping = subtotal > 100 || subtotal === 0 ? 0.00 : 4.90;
    var total = subtotal + shipping;
    var tax = subtotal * 0.19;

    if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';
    if (cartShipping) cartShipping.textContent = (shipping === 0 ? 'Gratis' : shipping.toFixed(2).replace('.', ',') + ' €');
    if (cartTax) cartTax.textContent = tax.toFixed(2).replace('.', ',') + ' €';
    if (cartTotal) cartTotal.textContent = total.toFixed(2).replace('.', ',') + ' €';
  }

  function generateDesignThumbnail() {
    var thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 150;
    thumbCanvas.height = 170;
    var thumbCtx = thumbCanvas.getContext('2d');

    thumbCtx.clearRect(0, 0, 150, 170);

    thumbCtx.fillStyle = state.tshirtColor;
    thumbCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    thumbCtx.lineWidth = 1;
    thumbCtx.beginPath();

    if (state.activeProductVal === 'cap') {
      thumbCtx.arc(75, 75, 45, Math.PI, 0, false);
      thumbCtx.lineTo(125, 95);
      thumbCtx.quadraticCurveTo(75, 95, 25, 95);
      thumbCtx.closePath();
      thumbCtx.fill();
      thumbCtx.stroke();

      thumbCtx.drawImage(canvas, 50, 50, 50, 55);
    } else {
      thumbCtx.moveTo(75, 30);
      thumbCtx.bezierCurveTo(85, 38, 95, 38, 105, 30);
      thumbCtx.lineTo(120, 20);
      thumbCtx.lineTo(145, 35);
      thumbCtx.lineTo(130, 60);
      thumbCtx.lineTo(110, 50);
      thumbCtx.lineTo(110, 140);
      thumbCtx.lineTo(40, 140);
      thumbCtx.lineTo(40, 50);
      thumbCtx.lineTo(20, 60);
      thumbCtx.lineTo(5, 35);
      thumbCtx.lineTo(30, 20);
      thumbCtx.closePath();
      thumbCtx.fill();
      thumbCtx.stroke();

      thumbCtx.beginPath();
      thumbCtx.arc(75, 30, 15, 0, Math.PI);
      thumbCtx.strokeStyle = 'rgba(255,255,255,0.2)';
      thumbCtx.stroke();

      thumbCtx.drawImage(canvas, 40, 50, 70, 78);
    }

    return thumbCanvas.toDataURL('image/png');
  }

  if (cartToggleBtn) {
    cartToggleBtn.addEventListener('click', function () {
      cartSidebar.classList.add('open');
      cartOverlay.classList.add('open');
    });
  }

  var closeCart = function () {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
  };

  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  if (cartItemsList) {
    cartItemsList.addEventListener('click', function (e) {
      var target = e.target;
      var itemId = target.dataset.id;
      if (!itemId) return;

      if (target.classList.contains('cart-qty-plus')) {
        var item = cart.find(function (i) { return i.id === itemId; });
        if (item) {
          item.quantity++;
          saveCart();
        }
      } else if (target.classList.contains('cart-qty-minus')) {
        var item = cart.find(function (i) { return i.id === itemId; });
        if (item && item.quantity > 1) {
          item.quantity--;
          saveCart();
        }
      } else if (target.classList.contains('cart-item-delete') || target.closest('.cart-item-delete')) {
        var idToDelete = target.classList.contains('cart-item-delete') ? itemId : target.closest('.cart-item-delete').dataset.id;
        cart = cart.filter(function (i) { return i.id !== idToDelete; });
        saveCart();
      }
    });
  }

  if (sizeSelector) {
    sizeSelector.addEventListener('click', function (e) {
      var target = e.target;
      if (target.classList.contains('size-chip')) {
        sizeSelector.querySelectorAll('.size-chip').forEach(function (c) { c.classList.remove('active'); });
        target.classList.add('active');
        state.size = target.dataset.size;
      }
    });
  }

  function updatePurchasePrices() {
    if (summarySinglePrice) {
      summarySinglePrice.textContent = state.price.toFixed(2).replace('.', ',') + ' €';
    }
    if (summaryTotalPrice) {
      const total = state.price * state.quantity;
      summaryTotalPrice.textContent = total.toFixed(2).replace('.', ',') + ' €';
    }
  }

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', function () {
      var val = parseInt(qtyInput.value);
      if (val > 1) {
        val--;
        qtyInput.value = val;
        state.quantity = val;
        updatePurchasePrices();
      }
    });

    qtyPlus.addEventListener('click', function () {
      var val = parseInt(qtyInput.value);
      if (val < 99) {
        val++;
        qtyInput.value = val;
        state.quantity = val;
        updatePurchasePrices();
      }
    });
  }

  if (productSelect) {
    productSelect.addEventListener('change', function () {
      var selectedOption = productSelect.options[productSelect.selectedIndex];
      state.activeProduct = selectedOption.text.split(' — ')[0];
      state.activeProductVal = productSelect.value;
      state.price = parseFloat(selectedOption.dataset.price);
      updatePurchasePrices();
      updateProductView(state.activeProductVal);
    });
  }

  var buyButtons = document.querySelectorAll('.produkt-card .btn-sm, .hero-buttons .btn-secondary, .nav-cta');
  buyButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.produkt-card');
      if (!card) return;

      var title = card.querySelector('h3').textContent;
      var priceText = card.querySelector('.produkt-preis').textContent;
      var price = parseFloat(priceText.replace('ab ', '').replace(' €', '').replace(',', '.'));

      if (productSelect) {
        for (var i = 0; i < productSelect.options.length; i++) {
          var opt = productSelect.options[i];
          if (opt.text.includes(title)) {
            productSelect.selectedIndex = i;
            state.activeProduct = opt.text.split(' — ')[0];
            state.activeProductVal = productSelect.value;
            state.price = price;
            updatePurchasePrices();
            updateProductView(state.activeProductVal);
            break;
          }
        }
      }

      var buyTab = document.getElementById('tab-kauf-btn');
      if (buyTab) buyTab.click();
    });
  });

  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', function () {
      var thumb = generateDesignThumbnail();

      var cartItem = {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        productName: state.activeProduct,
        productVal: state.activeProductVal,
        price: state.price,
        size: state.size,
        color: state.tshirtColor,
        quantity: state.quantity,
        thumbnail: thumb
      };

      cart.push(cartItem);
      saveCart();

      setTimeout(function () {
        if (cartSidebar) cartSidebar.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('open');
      }, 300);
    });
  }

  var paymentCards = document.querySelectorAll('.payment-card');
  var ccDetails = document.getElementById('credit-card-details');

  paymentCards.forEach(function (card) {
    card.addEventListener('click', function () {
      paymentCards.forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');

      var method = card.dataset.method;
      if (method === 'credit-card') {
        if (ccDetails) ccDetails.style.display = 'block';
      } else {
        if (ccDetails) ccDetails.style.display = 'none';
      }
    });
  });

  if (btnCheckout) {
    btnCheckout.addEventListener('click', function () {
      closeCart();
      if (checkoutOverlay) checkoutOverlay.classList.add('open');
      renderCheckoutSummary();
    });
  }

  function closeCheckout() {
    if (checkoutOverlay) checkoutOverlay.classList.remove('open');
    if (checkoutMainView) checkoutMainView.style.display = '';
    if (checkoutLoading) checkoutLoading.style.display = 'none';
    if (checkoutSuccess) checkoutSuccess.style.display = 'none';
  }

  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckout);
  if (btnSuccessClose) btnSuccessClose.addEventListener('click', closeCheckout);

  function renderCheckoutSummary() {
    if (!checkoutSummaryItems) return;
    checkoutSummaryItems.innerHTML = '';

    cart.forEach(function (item) {
      var itemHtml =
        '<div class="checkout-item">' +
          '<div class="checkout-item-img">' +
            '<img src="' + item.thumbnail + '" alt="' + item.productName + '">' +
          '</div>' +
          '<div class="checkout-item-details">' +
            '<div class="checkout-item-title">' + item.productName + ' (x' + item.quantity + ')</div>' +
            '<div class="checkout-item-meta">Größe: ' + item.size + ' | Farbe: ' + item.color + '</div>' +
          '</div>' +
          '<div class="checkout-item-price">' + (item.price * item.quantity).toFixed(2).replace('.', ',') + ' €</div>' +
        '</div>';
      checkoutSummaryItems.insertAdjacentHTML('beforeend', itemHtml);
    });

    var subtotal = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
    var shipping = subtotal > 100 ? 0.00 : 4.90;
    var total = subtotal + shipping;

    if (checkoutSubtotal) checkoutSubtotal.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';
    if (checkoutShipping) checkoutShipping.textContent = (shipping === 0 ? 'Gratis' : shipping.toFixed(2).replace('.', ',') + ' €');
    if (checkoutTotal) checkoutTotal.textContent = total.toFixed(2).replace('.', ',') + ' €';
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (checkoutMainView) checkoutMainView.style.display = 'none';
      if (checkoutLoading) checkoutLoading.style.display = 'flex';

      setTimeout(function () {
        if (checkoutLoading) checkoutLoading.style.display = 'none';
        if (checkoutSuccess) checkoutSuccess.style.display = 'flex';

        var successOrderId = document.getElementById('success-order-id');
        if (successOrderId) {
          var randNum = Math.floor(100000 + Math.random() * 900000);
          successOrderId.textContent = 'DE-' + randNum;
        }

        cart = [];
        saveCart();
      }, 2000);
    });
  }

  // Initial cart count and view update
  updateCartUI();
  updateProductView('herren-shirt');

})();
