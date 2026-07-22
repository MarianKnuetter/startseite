// =============================================
// SPRACHUMSCHALTER – Deutsch / Polnisch
// Erweitert mit neuen Sektionen
// =============================================

const translations = {
  de: {
    // Navigation
    'nav-leistungen': 'Leistungen',
    'nav-bereiche': 'Bereiche',
    'nav-preise': 'Preise',
    'nav-ueber': 'Über uns',
    'nav-kontakt': 'Kontakt',
    'nav-login': 'Kunden-Login',

    // Hero
    'hero-tagline': 'Reinigungsfirma Team Hamburg',
    'hero-title': 'Einfach immer<br><span class="hero-highlight">sauber</span>',
    'hero-subtitle': 'Professionelle Reinigung für Büros, Praxen, Kitas und Privathaushalte in Hamburg. Zuverlässig, gründlich und fair.',
    'hero-btn-1': 'Erstgespräch vereinbaren',
    'hero-btn-2': 'Unsere Leistungen',
    'hero-trust-1': 'Kostenlose Beratung',
    'hero-trust-2': 'Faire Preise',
    'hero-trust-3': 'Hamburg & Umgebung',
    'hero-trust-4': 'Schnelle Reaktionszeit',

    // Leistungen
    'leistungen-tag': 'Was wir bieten',
    'leistungen-title': 'Unsere Leistungen',
    'leistungen-sub': 'Von der regelmäßigen Unterhaltsreinigung bis zur Privatreinigung – für Gewerbe und Privathaushalte.',
    'sicht-title': 'Sichtreinigung',
    'sicht-desc': 'Schnelle Reinigung der sichtbaren Bereiche. Ideal für den ersten Eindruck bei Kunden und Besuchern.',
    'unterhalt-title': 'Unterhaltsreinigung',
    'unterhalt-desc': 'Regelmäßige Reinigung nach festem Plan. Wöchentlich, mehrmals pro Woche oder täglich – wie Sie es brauchen.',
    'grund-title': 'Grundreinigung',
    'grund-desc': 'Intensive Tiefenreinigung aller Oberflächen. Für einen sauberen Neustart in Ihren Räumlichkeiten.',
    'end-title': 'Endreinigung',
    'end-desc': 'Gründliche Reinigung bei Umzug oder Übergabe. Damit alles in bestem Zustand hinterlassen wird.',
    'fenster-title': 'Fensterreinigung',
    'fenster-desc': 'Streifenfreie Fenster für Ihr Zuhause oder Büro. Innen und außen, auch bei schwer erreichbaren Fenstern.',
    'treppen-title': 'Treppenhausreinigung',
    'treppen-desc': 'Saubere Treppenhäuser und Gemeinschaftsflächen. Regelmäßig oder einmalig nach Vereinbarung.',

    // Bereiche
    'bereiche-tag': 'Wo wir arbeiten',
    'bereiche-title': 'Unsere Einsatzbereiche',
    'buero-title': 'Büro',
    'buero-desc': 'Saubere Arbeitsplätze für zufriedene Mitarbeiter. Wir reinigen Büros jeder Größe.',
    'praxis-title': 'Praxis',
    'praxis-desc': 'Hygienische Reinigung für Arztpraxen und Therapieräume nach höchsten Standards.',
    'kita-title': 'Kita',
    'kita-desc': 'Kindgerechte Sauberkeit für Krippen und Kindergärten. Sicher und gründlich.',
    'privat-title': 'Privathaushalt',
    'privat-desc': 'Wohnungen und Häuser gründlich reinigen. Regelmäßig oder als Frühjahrsputz – ganz wie Sie möchten.',

    // Preise
    'preise-tag': 'Transparente Kosten',
    'preise-title': 'Preisbeispiele',
    'preise-sub': 'Alle Preise sind Richtwerte. Das genaue Angebot erhalten Sie nach einem kostenlosen Erstgespräch.',
    'price-privat-title': 'Privathaushalt',
    'price-privat-hint': 'Regelmäßige Reinigung Ihrer Wohnung oder Ihres Hauses',
    'price-privat-f1': 'Wohnungsreinigung ab 2h',
    'price-privat-f2': 'Flexible Termine',
    'price-privat-f3': 'Eigene Reinigungsmittel',
    'price-privat-f4': 'Vertrauensvolle Mitarbeiter',
    'price-buero-title': 'Büro & Gewerbe',
    'price-buero-hint': 'Professionelle Unterhaltsreinigung für Ihr Unternehmen',
    'price-buero-f1': 'Ab 3× pro Woche möglich',
    'price-buero-f2': 'Früh-, Spät- & Wochenendservice',
    'price-buero-f3': 'Sanitär & Küche inklusive',
    'price-buero-f4': 'Vertragskunden mit Rabatt',
    'price-grund-title': 'Grund- & Endreinigung',
    'price-grund-hint': 'Intensive Tiefenreinigung – einmalig oder nach Bedarf',
    'price-grund-f1': 'Komplettreinigung aller Flächen',
    'price-grund-f2': 'Ideal bei Umzug / Übergabe',
    'price-grund-f3': 'Professionelle Geräte',
    'price-grund-f4': 'Auf Wunsch Übergabe-Zeugnis',
    'price-btn': 'Angebot anfragen',
    'price-note': 'Kostenlose Erstberatung',

    // Über uns
    'about-tag': 'Wer wir sind',
    'about-title': 'Ihr Partner für Sauberkeit in Hamburg',
    'about-desc': 'Wir sind ein zuverlässiges Reinigungsteam aus Hamburg. Unsere Arbeit ist gründlich, pünktlich und transparent. Wir passen unsere Leistungen an Ihre Bedürfnisse an – ob Privatwohnung, kleine Praxis oder großes Bürogebäude.',
    'about-li-1': 'Zuverlässig und pünktlich',
    'about-li-2': 'Faire und transparente Preise',
    'about-li-3': 'Flexible Einsatzzeiten',
    'about-li-4': 'Erfahrenes und freundliches Team',
    'about-badge': 'Einfach immer sauber',
    'stat-1-num': '100%', 'stat-1-label': 'Einsatz',
    'stat-2-num': 'Hamburg', 'stat-2-label': '& Umgebung',
    'stat-3-num': 'Flexibel', 'stat-3-label': 'Einsatzzeiten',
    'stat-4-num': 'Fair', 'stat-4-label': 'Preise',

    // FAQ
    'faq-tag': 'Häufige Fragen',
    'faq-title': 'FAQ – Ihre Fragen, unsere Antworten',
    'faq-q1': 'Wie bekomme ich ein Angebot?',
    'faq-a1': 'Einfach das Kontaktformular ausfüllen oder direkt anrufen. Wir melden uns innerhalb von 24 Stunden für ein kostenloses Erstgespräch. Das Angebot ist immer unverbindlich.',
    'faq-q2': 'In welchen Bereichen arbeiten Sie?',
    'faq-a2': 'Wir sind in Hamburg und dem gesamten Hamburger Umland tätig. Dazu gehören Hamburger Stadtteile sowie angrenzende Städte wie Norderstedt, Ahrensburg, Buxtehude und weitere.',
    'faq-q3': 'Wie oft wird gereinigt?',
    'faq-a3': 'Das entscheiden Sie! Wir bieten tägliche, wöchentliche oder monatliche Reinigung an. Für Unternehmen empfehlen wir mindestens 2–3× pro Woche, für Privathaushalte reicht oft 1× wöchentlich.',
    'faq-q4': 'Bringen Sie eigene Reinigungsmittel mit?',
    'faq-a4': 'Ja! Wir bringen professionelle Reinigungsmittel und Geräte mit. Auf Wunsch können wir auch Ihre bevorzugten Produkte verwenden – zum Beispiel bei Allergien oder Umweltzertifizierungen.',
    'faq-q5': 'Gibt es einen festen Ansprechpartner?',
    'faq-a5': 'Ja. Stammkunden erhalten nach Möglichkeit immer dasselbe Team, das Ihre Räumlichkeiten kennt. So entsteht Vertrauen und die Qualität bleibt konstant hoch.',
    'faq-q6': 'Was kostet die Reinigung?',
    'faq-a6': 'Der Preis hängt von Größe, Art und Häufigkeit der Reinigung ab. Wir erstellen Ihnen nach einem kostenlosen Erstgespräch ein individuelles Angebot. Es gibt keine versteckten Kosten.',

    // Kontakt
    'kontakt-tag': 'Kontakt aufnehmen',
    'kontakt-title': 'Jetzt Erstgespräch vereinbaren',
    'kontakt-sub': 'Schreiben Sie uns eine Nachricht oder rufen Sie direkt an. Wir melden uns schnell zurück.',
    'form-name': 'Name *',
    'form-email': 'E-Mail *',
    'form-phone': 'Telefon',
    'form-service': 'Gewünschte Leistung',
    'form-select': 'Bitte wählen...',
    'form-message': 'Nachricht *',
    'form-submit': 'Nachricht senden',
    'form-name-ph': 'Ihr Name',
    'form-email-ph': 'ihre@email.de',
    'form-msg-ph': 'Beschreiben Sie kurz, was gereinigt werden soll...',
    'contact-phone': 'Telefon',
    'contact-email': 'E-Mail',
    'contact-location': 'Standort',
    'contact-location-val': 'Hamburg & Umgebung',
    'opt-sicht': 'Sichtreinigung',
    'opt-unterhalt': 'Unterhaltsreinigung',
    'opt-grund': 'Grundreinigung',
    'opt-end': 'Endreinigung',
    'opt-fenster': 'Fensterreinigung',
    'opt-treppen': 'Treppenhausreinigung',
    'opt-privat': 'Privathaushalt (regelmäßig)',

    // Öffnungszeiten
    'hours-title': 'Erreichbarkeit',
    'hours-mon': 'Mo – Fr',
    'hours-mon-time': '07:00 – 18:00 Uhr',
    'hours-sat': 'Samstag',
    'hours-sat-time': '09:00 – 14:00 Uhr',
    'hours-sun': 'Sonntag',
    'hours-sun-time': 'Geschlossen',

    // Footer
    'footer-slogan': 'Einfach immer sauber',
    'footer-copy': '© 2026 Reinigungsfirma Team Hamburg. Alle Rechte vorbehalten.',
  },

  pl: {
    // Navigation
    'nav-leistungen': 'Usługi',
    'nav-bereiche': 'Obszary',
    'nav-preise': 'Cennik',
    'nav-ueber': 'O nas',
    'nav-kontakt': 'Kontakt',
    'nav-login': 'Logowanie klienta',

    // Hero
    'hero-tagline': 'Firma Sprzątająca Team Hamburg',
    'hero-title': 'Po prostu zawsze<br><span class="hero-highlight">czysto</span>',
    'hero-subtitle': 'Profesjonalne sprzątanie biur, gabinetów, przedszkoli i mieszkań prywatnych w Hamburgu. Niezawodnie, dokładnie i uczciwie.',
    'hero-btn-1': 'Umów rozmowę',
    'hero-btn-2': 'Nasze usługi',
    'hero-trust-1': 'Bezpłatna konsultacja',
    'hero-trust-2': 'Uczciwe ceny',
    'hero-trust-3': 'Hamburg i okolice',
    'hero-trust-4': 'Szybki czas reakcji',

    // Leistungen
    'leistungen-tag': 'Co oferujemy',
    'leistungen-title': 'Nasze usługi',
    'leistungen-sub': 'Od regularnego sprzątania po sprzątanie prywatne – dla firm i gospodarstw domowych.',
    'sicht-title': 'Sprzątanie wizualne',
    'sicht-desc': 'Szybkie sprzątanie widocznych powierzchni. Idealne na pierwsze wrażenie u klientów i gości.',
    'unterhalt-title': 'Sprzątanie regularne',
    'unterhalt-desc': 'Regularne sprzątanie według ustalonego planu. Co tydzień, kilka razy w tygodniu lub codziennie.',
    'grund-title': 'Sprzątanie gruntowne',
    'grund-desc': 'Intensywne czyszczenie wszystkich powierzchni. Na nowy, czysty początek w Twoich pomieszczeniach.',
    'end-title': 'Sprzątanie końcowe',
    'end-desc': 'Dokładne sprzątanie przy przeprowadzce lub przekazaniu. Aby wszystko zostało w najlepszym stanie.',
    'fenster-title': 'Mycie okien',
    'fenster-desc': 'Okna bez smug w domu i biurze. Wewnątrz i na zewnątrz, również trudno dostępne.',
    'treppen-title': 'Sprzątanie klatek schodowych',
    'treppen-desc': 'Czyste klatki schodowe i części wspólne. Regularnie lub jednorazowo.',

    // Bereiche
    'bereiche-tag': 'Gdzie pracujemy',
    'bereiche-title': 'Nasze obszary działania',
    'buero-title': 'Biuro',
    'buero-desc': 'Czyste stanowiska pracy dla zadowolonych pracowników. Sprzątamy biura każdej wielkości.',
    'praxis-title': 'Gabinet',
    'praxis-desc': 'Higieniczne sprzątanie gabinetów lekarskich i terapeutycznych według najwyższych standardów.',
    'kita-title': 'Przedszkole',
    'kita-desc': 'Czystość dostosowana do dzieci w żłobkach i przedszkolach. Bezpiecznie i dokładnie.',
    'privat-title': 'Mieszkanie prywatne',
    'privat-desc': 'Dokładne sprzątanie mieszkań i domów. Regularnie lub jako generalne porządki.',

    // Preise
    'preise-tag': 'Transparentne koszty',
    'preise-title': 'Przykładowe ceny',
    'preise-sub': 'Wszystkie ceny są orientacyjne. Dokładną ofertę otrzymasz po bezpłatnej konsultacji.',
    'price-privat-title': 'Mieszkanie prywatne',
    'price-privat-hint': 'Regularne sprzątanie Twojego mieszkania lub domu',
    'price-privat-f1': 'Sprzątanie od 2h',
    'price-privat-f2': 'Elastyczne terminy',
    'price-privat-f3': 'Własne środki czystości',
    'price-privat-f4': 'Zaufani pracownicy',
    'price-buero-title': 'Biuro i firmy',
    'price-buero-hint': 'Profesjonalne sprzątanie regularne dla Twojej firmy',
    'price-buero-f1': 'Od 3× w tygodniu',
    'price-buero-f2': 'Serwis poranny, wieczorny i weekendowy',
    'price-buero-f3': 'Sanitariaty i kuchnia w cenie',
    'price-buero-f4': 'Rabaty dla klientów długoterminowych',
    'price-grund-title': 'Sprzątanie gruntowne',
    'price-grund-hint': 'Intensywne czyszczenie – jednorazowe lub według potrzeb',
    'price-grund-f1': 'Pełne czyszczenie wszystkich powierzchni',
    'price-grund-f2': 'Idealne przy przeprowadzce',
    'price-grund-f3': 'Profesjonalny sprzęt',
    'price-grund-f4': 'Protokół zdawczo-odbiorczy na życzenie',
    'price-btn': 'Zapytaj o ofertę',
    'price-note': 'Bezpłatna pierwsza konsultacja',

    // Über uns
    'about-tag': 'Kim jesteśmy',
    'about-title': 'Twój partner w czystości w Hamburgu',
    'about-desc': 'Jesteśmy niezawodnym zespołem sprzątającym z Hamburga. Nasza praca jest dokładna, punktualna i przejrzysta. Dopasowujemy nasze usługi do Twoich potrzeb – mieszkanie, gabinet czy duży biurowiec.',
    'about-li-1': 'Niezawodnie i punktualnie',
    'about-li-2': 'Uczciwe i przejrzyste ceny',
    'about-li-3': 'Elastyczne godziny pracy',
    'about-li-4': 'Doświadczony i przyjazny zespół',
    'about-badge': 'Po prostu zawsze czysto',
    'stat-1-num': '100%', 'stat-1-label': 'Zaangażowanie',
    'stat-2-num': 'Hamburg', 'stat-2-label': 'i okolice',
    'stat-3-num': 'Elastyczne', 'stat-3-label': 'Godziny pracy',
    'stat-4-num': 'Uczciwe', 'stat-4-label': 'Ceny',

    // FAQ
    'faq-tag': 'Często zadawane pytania',
    'faq-title': 'FAQ – Twoje pytania, nasze odpowiedzi',
    'faq-q1': 'Jak mogę otrzymać ofertę?',
    'faq-a1': 'Wystarczy wypełnić formularz kontaktowy lub zadzwonić bezpośrednio. Skontaktujemy się w ciągu 24 godzin na bezpłatną konsultację. Oferta jest zawsze niewiążąca.',
    'faq-q2': 'W jakich obszarach Państwo pracują?',
    'faq-a2': 'Działamy w Hamburgu i całych okolicach Hamburga. Obejmuje to dzielnice Hamburga oraz sąsiednie miasta takie jak Norderstedt, Ahrensburg, Buxtehude i inne.',
    'faq-q3': 'Jak często odbywa się sprzątanie?',
    'faq-a3': 'To Twoja decyzja! Oferujemy sprzątanie codzienne, tygodniowe lub miesięczne. Dla firm zalecamy co najmniej 2–3× w tygodniu, dla mieszkań prywatnych często wystarczy 1× tygodniowo.',
    'faq-q4': 'Czy przynosicie własne środki czystości?',
    'faq-a4': 'Tak! Przynosimy profesjonalne środki czystości i sprzęt. Na życzenie możemy używać Twoich ulubionych produktów – np. przy alergiach lub certyfikatach środowiskowych.',
    'faq-q5': 'Czy jest stały opiekun klienta?',
    'faq-a5': 'Tak. Stali klienci otrzymują w miarę możliwości zawsze ten sam zespół, który zna Twoje pomieszczenia. Buduje to zaufanie i utrzymuje stale wysoką jakość.',
    'faq-q6': 'Ile kosztuje sprzątanie?',
    'faq-a6': 'Cena zależy od wielkości, rodzaju i częstotliwości sprzątania. Po bezpłatnej konsultacji przygotujemy indywidualną ofertę. Nie ma ukrytych kosztów.',

    // Kontakt
    'kontakt-tag': 'Skontaktuj się',
    'kontakt-title': 'Umów pierwszą rozmowę',
    'kontakt-sub': 'Napisz do nas lub zadzwoń. Oddzwonimy szybko.',
    'form-name': 'Imię i nazwisko *',
    'form-email': 'E-mail *',
    'form-phone': 'Telefon',
    'form-service': 'Wybierz usługę',
    'form-select': 'Proszę wybrać...',
    'form-message': 'Wiadomość *',
    'form-submit': 'Wyślij wiadomość',
    'form-name-ph': 'Twoje imię',
    'form-email-ph': 'twoj@email.pl',
    'form-msg-ph': 'Opisz krótko, co trzeba posprzątać...',
    'contact-phone': 'Telefon',
    'contact-email': 'E-mail',
    'contact-location': 'Lokalizacja',
    'contact-location-val': 'Hamburg i okolice',
    'opt-sicht': 'Sprzątanie wizualne',
    'opt-unterhalt': 'Sprzątanie regularne',
    'opt-grund': 'Sprzątanie gruntowne',
    'opt-end': 'Sprzątanie końcowe',
    'opt-fenster': 'Mycie okien',
    'opt-treppen': 'Klatki schodowe',
    'opt-privat': 'Mieszkanie (regularnie)',

    // Öffnungszeiten
    'hours-title': 'Dostępność',
    'hours-mon': 'Pon – Pt',
    'hours-mon-time': '07:00 – 18:00',
    'hours-sat': 'Sobota',
    'hours-sat-time': '09:00 – 14:00',
    'hours-sun': 'Niedziela',
    'hours-sun-time': 'Zamknięte',

    // Footer
    'footer-slogan': 'Po prostu zawsze czysto',
    'footer-copy': '© 2026 Firma Sprzątająca Team Hamburg. Wszelkie prawa zastrzeżone.',
  }
};

// Aktuelle Sprache
let currentLang = localStorage.getItem('lang') || 'de';

// Sprache anwenden
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  const t = translations[lang];
  if (!t) return;

  // Alle Elemente mit data-i18n übersetzen
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });

  // Placeholder übersetzen
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key] !== undefined) {
      el.placeholder = t[key];
    }
  });

  // Dropdown synchronisieren
  const select = document.getElementById('lang-select');
  if (select) select.value = lang;
}

// Beim Laden anwenden
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLang);
});
