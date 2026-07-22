# Reinigungsfirma Team Hamburg

Full-Stack-Firmenwebsite mit Node.js-Backend.

## Features

Kunden-Registrierung mit E-Mail-Verifizierung, Login mit JWT (24h gültig), drei Rollen (Admin, Mitarbeiter, Kunde), Auftragsverwaltung mit Zuweisung und Status-Tracking, Kommentare & Bewertungen, Passwort-Reset per E-Mail, Kontaktformular, Rate Limiting & Helmet-Sicherheitsheader, zweisprachig (DE/PL).

## Starten

```bash
npm install
npm start
# → http://localhost:3000
```

## Konfiguration (.env, optional)

```
PORT=3000
JWT_SECRET=dein-geheimes-secret
EMAIL_USER=deine@gmail.com
EMAIL_PASS=dein-app-passwort
```

Ohne SMTP-Konfiguration läuft der E-Mail-Versand im Test-Modus (Ethereal) und neue Konten werden automatisch verifiziert.

## Struktur

`server.js` — Express-Server mit allen API-Routen · `public/` — Frontend (HTML/CSS/JS) · `data/` — JSON-"Datenbank" (wird automatisch angelegt, nicht im Repo)
