# Portfolio — Marian Knütter

Angehender Fachinformatiker für Anwendungsentwicklung aus Hamburg. Dieses Repository enthält meine persönliche Portfolio-Website sowie sechs selbst entwickelte Web-Projekte — vom Konzept bis zum Code.

**Live ansehen:** Einfach `index.html` im Browser öffnen (oder via GitHub Pages hosten — die Startseite verlinkt alle Projekte mit Live-Vorschau).

## Projekte

| Projekt | Beschreibung | Technologien |
|---|---|---|
| [Portfolio-Startseite](index.html) | Apple-inspirierte Portfolio-Website mit Typing-Animation, Scroll-Reveal und Live-Projekt-Vorschau im Overlay | HTML5, CSS3, Vanilla JS |
| [Organizer Pro](datenbank-projekt/) | Dokumenten-Manager mit Dashboard, Kalender, Kreditkarten- & Vertragsverwaltung, clientseitigem PDF-Import (PDF.js), IndexedDB-Anhängen und Dark/Light-Mode | JavaScript, LocalStorage, IndexedDB, Canvas |
| [T-Shirt Designer](tshirt-projekt/) | Interaktiver Produkt-Customizer: Farben, Muster, Text und Bild-Upload auf Canvas, inkl. Warenkorb & Checkout-Simulation | Canvas API, SVG, FileReader API |
| [SmartHome Control Panel](smarthome-projekt/) | Glassmorphes Dashboard mit SVG-Thermostat, Live-Verbrauchs-Chart und Gerätesteuerung | SVG, Vanilla JS |
| [Finanz-Tracker](finanz-projekt/) | Budgetplaner mit Transaktionen, Budget-Limits und dynamischem SVG-Donut-Chart | SVG, Vanilla JS |
| [Energie-Rechner](Energie_rechner/) | Stromkosten-Kalkulator mit Live-Berechnung und Spartipps | HTML5, CSS Grid, Vanilla JS |
| [Reinigungsfirma Team Hamburg](reinigungsfirma-projekt/) | Full-Stack-Firmenwebsite mit Node.js-Backend: JWT-Login, Rollen (Admin/Mitarbeiter/Kunde), Auftragsverwaltung, E-Mail-Versand | Node.js, Express, JWT, bcrypt |

## Technologien

Frontend: HTML5, CSS3 (Grid, Flexbox, Animationen, Glassmorphism), JavaScript (ES6+), Canvas & SVG.
Backend: Node.js, Express, JWT-Authentifizierung, bcrypt, Nodemailer, Helmet, Rate Limiting.
Tools: Git & GitHub, VS Code, Browser DevTools.

## Reinigungsfirma-Projekt lokal starten

```bash
cd reinigungsfirma-projekt
npm install
npm start
# → http://localhost:3000
```

Optional eine `.env`-Datei anlegen (siehe Kommentare in `server.js`) für JWT-Secret und SMTP-Zugangsdaten.

## Kontakt

📍 Hamburg · 📧 Marianknuetter@outlook.de

Ich suche eine Ausbildung als Fachinformatiker für Anwendungsentwicklung ab September 2027 — melde dich gerne!

## Lizenz

Veröffentlicht unter der [MIT-Lizenz](LICENSE).
