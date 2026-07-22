// =============================================
// REINIGUNGSFIRMA TEAM HAMBURG – Backend Server
// =============================================
// Dieser Server macht folgendes:
// 1. Stellt die HTML/CSS/JS-Dateien bereit (Frontend)
// 2. Verarbeitet Kontaktformular-Nachrichten
// 3. Registrierung neuer Benutzer
// 4. Login mit Passwort-Prüfung und Token-Erstellung
// 5. Passwort zurücksetzen & Konto löschen

require('dotenv').config();            // .env-Datei laden
const express = require('express');    // Web-Framework
const bcrypt = require('bcryptjs');    // Passwort-Verschlüsselung
const jwt = require('jsonwebtoken');   // Login-Tokens
const fs = require('fs');              // Dateien lesen/schreiben
const path = require('path');          // Dateipfade
const crypto = require('crypto');      // Zufällige Tokens erzeugen
const nodemailer = require('nodemailer'); // E-Mails versenden
const helmet = require('helmet');      // Sicherheits-Header
const rateLimit = require('express-rate-limit'); // Rate Limiting

// ---- Server erstellen ----
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'reinigungsfirma-geheim-2026';

// ---- E-Mail Konfiguration ----
// Für Gmail: Gehe zu https://myaccount.google.com/apppasswords
// und erstelle ein "App-Passwort". Das trägst du unten ein.
// Für Tests: Wir nutzen Ethereal (Fake-E-Mail-Dienst) als Fallback.
let transporter = null;

// Versuche echten SMTP-Transport (Gmail)
const EMAIL_USER = process.env.EMAIL_USER || '';  // Deine Gmail-Adresse
const EMAIL_PASS = process.env.EMAIL_PASS || '';  // Dein App-Passwort

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
  console.log(`📧 E-Mail: Echte Mails über ${EMAIL_USER}`);
} else {
  // Fallback: Ethereal (Test-E-Mails, kein echtes Senden)
  nodemailer.createTestAccount().then(account => {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: account.user, pass: account.pass }
    });
    console.log('📧 E-Mail: Test-Modus (Ethereal) – Links erscheinen im Terminal');
  });
}

// ---- Sicherheits-Middleware ----
// Helmet: Setzt sichere HTTP-Header (XSS-Schutz, etc.)
app.use(helmet({ contentSecurityPolicy: false }));

// Rate Limiting: Max. 100 Anfragen pro 15 Min pro IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Zu viele Anfragen. Bitte warte 15 Minuten.' }
});

// Strengeres Limit für Login/Register (Brute-Force-Schutz)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Zu viele Versuche. Bitte warte 15 Minuten.' }
});

app.use('/api/', apiLimiter);

// ---- Middleware ----
// JSON-Daten aus dem Body lesen können
app.use(express.json({ limit: '1mb' }));

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

// ---- XSS-Schutz: HTML-Zeichen entfernen ----
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>"'&]/g, c => ({
    '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;', '&':'&amp;'
  })[c]);
}

// ---- Hilfsfunktionen für die "Datenbank" (JSON-Dateien) ----
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Benutzer laden
function loadUsers() {
  const filePath = path.join(DATA_DIR, 'users.json');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Benutzer speichern
function saveUsers(users) {
  const filePath = path.join(DATA_DIR, 'users.json');
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

// Nachrichten laden
function loadMessages() {
  const filePath = path.join(DATA_DIR, 'messages.json');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Nachrichten speichern
function saveMessages(messages) {
  const filePath = path.join(DATA_DIR, 'messages.json');
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
}

// =============================================
// API-ROUTEN
// =============================================

// ---- 1. REGISTRIERUNG ----
app.post('/api/register', authLimiter, async (req, res) => {
  const name = sanitize(req.body.name);
  const email = req.body.email;
  const phone = sanitize(req.body.phone);
  const password = req.body.password;

  // Pflichtfelder prüfen
  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: 'Bitte alle Pflichtfelder ausfüllen.'
    });
  }

  // Passwort-Länge prüfen
  if (password.length < 6) {
    return res.json({
      success: false,
      message: 'Passwort muss mindestens 6 Zeichen haben.'
    });
  }

  // Prüfen ob E-Mail schon existiert
  const users = loadUsers();
  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.json({
      success: false,
      message: 'Diese E-Mail ist bereits registriert.'
    });
  }

  // Passwort verschlüsseln (hashen)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Verifizierungs-Token erzeugen (zufälliger Code)
  const verifyToken = crypto.randomBytes(32).toString('hex');

  // Neuen User speichern (auto-verifiziert, falls kein E-Mail-Server konfiguriert ist)
  const isEmailConfigured = !!(EMAIL_USER && EMAIL_PASS);
  const newUser = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    password: hashedPassword,
    role: 'kunde',
    verified: !isEmailConfigured,    // ← Auto-verifiziert, wenn kein E-Mail-Server konfiguriert ist!
    verifyToken: isEmailConfigured ? verifyToken : null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // Bestätigungs-E-Mail senden (nur wenn konfiguriert)
  const host = req.get('host') || `localhost:${PORT}`;
  const verifyUrl = `${req.protocol}://${host}/api/verify?token=${verifyToken}`;

  if (isEmailConfigured) {
    try {
      if (transporter) {
        const info = await transporter.sendMail({
          from: '"Team Hamburg" <noreply@team-hamburg.de>',
          to: email,
          subject: '✅ E-Mail bestätigen – Reinigungsfirma Team Hamburg',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#f8f9fb;border-radius:12px">
              <h2 style="color:#1e2d4a">Willkommen, ${name}! 👋</h2>
              <p>Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren:</p>
              <a href="${verifyUrl}" style="display:inline-block;padding:14px 28px;background:#4a90d9;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;margin:20px 0">E-Mail bestätigen</a>
              <p style="color:#6b7280;font-size:0.85rem">Oder kopiere diesen Link:<br>${verifyUrl}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
              <p style="color:#9ca3af;font-size:0.78rem">Reinigungsfirma Team Hamburg – Einfach immer sauber</p>
            </div>
          `
        });

        // Falls Ethereal (Test): Link in der Konsole anzeigen
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`📧 Test-E-Mail Vorschau: ${previewUrl}`);
        }
      }
    } catch (err) {
      console.log('⚠️ E-Mail konnte nicht gesendet werden:', err.message);
    }

    // Bestätigungslink im Terminal anzeigen
    console.log(`✅ Neuer User registriert (Verifizierung ausstehend): ${email}`);
    console.log(`🔗 Bestätigungslink: ${verifyUrl}`);
  } else {
    console.log(`✅ Neuer User registriert (Auto-verifiziert, da kein SMTP konfiguriert): ${email}`);
  }

  res.json({
    success: true,
    message: isEmailConfigured
      ? 'Konto erstellt! Bitte prüfe dein E-Mail-Postfach und bestätige deine Adresse.'
      : 'Konto erstellt! Du kannst dich jetzt direkt einloggen.'
  });
});

// ---- E-MAIL BESTÄTIGUNG ----
app.get('/api/verify', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.send('<h2>Ungültiger Link.</h2>');
  }

  const users = loadUsers();
  const user = users.find(u => u.verifyToken === token);

  if (!user) {
    return res.send('<h2>❌ Token nicht gefunden oder bereits verwendet.</h2>');
  }

  if (user.verified) {
    return res.send('<h2>✅ Deine E-Mail ist bereits bestätigt! Du kannst dich einloggen.</h2>');
  }

  // User verifizieren
  user.verified = true;
  user.verifyToken = null;  // Token löschen (einmalig!)
  saveUsers(users);

  console.log(`✅ E-Mail bestätigt: ${user.email}`);

  res.send(`
    <div style="font-family:Arial,sans-serif;text-align:center;padding:60px 20px">
      <h1 style="color:#22c55e">✅ E-Mail bestätigt!</h1>
      <p style="font-size:1.1rem;color:#333">Hallo ${user.name}, dein Konto ist jetzt aktiv.</p>
      <a href="/login.html" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#1e2d4a;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold">Jetzt einloggen</a>
    </div>
  `);
});

// ---- 2. LOGIN ----
app.post('/api/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: 'Bitte E-Mail und Passwort eingeben.'
    });
  }

  // User in der "Datenbank" suchen
  const users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.json({
      success: false,
      message: 'E-Mail oder Passwort falsch.'
    });
  }

  // Passwort prüfen
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.json({
      success: false,
      message: 'E-Mail oder Passwort falsch.'
    });
  }

  // Prüfen ob E-Mail bestätigt wurde
  if (user.verified === false) {
    return res.json({
      success: false,
      message: 'Bitte bestätige zuerst deine E-Mail-Adresse. Prüfe dein Postfach!'
    });
  }

  // JWT-Token erstellen (gültig für 24 Stunden)
  // Die Rolle wird im Token gespeichert!
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'kunde' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  console.log(`✅ Login erfolgreich: ${email} (Rolle: ${user.role || 'kunde'})`);

  res.json({
    success: true,
    token,
    user: { name: user.name, email: user.email, role: user.role || 'kunde' }
  });
});

// Hinweis: Passwort-Reset- und Konto-Löschen-Routen sind weiter unten definiert (einmalig)

// ---- 3. KONTAKTFORMULAR ----
app.post('/api/contact', (req, res) => {
  const name = sanitize(req.body.name);
  const email = req.body.email;
  const phone = sanitize(req.body.phone);
  const service = sanitize(req.body.service);
  const message = sanitize(req.body.message);

  if (!name || !email || !message) {
    return res.json({
      success: false,
      message: 'Bitte Name, E-Mail und Nachricht ausfüllen.'
    });
  }

  // Nachricht speichern
  const messages = loadMessages();
  messages.push({
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    service: service || 'Nicht angegeben',
    message,
    receivedAt: new Date().toISOString(),
    read: false
  });
  saveMessages(messages);

  console.log(`📩 Neue Kontaktanfrage von: ${name} (${email})`);

  res.json({ success: true, message: 'Nachricht erfolgreich gesendet!' });
});

// ---- 4. NACHRICHTEN ABRUFEN (geschützt) ----
app.get('/api/messages', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Nicht eingeloggt.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET);
    const messages = loadMessages();
    res.json({ success: true, messages });
  } catch {
    res.status(401).json({ success: false, message: 'Token ungültig.' });
  }
});

// ---- Hilfsfunktionen für Aufträge ----
function loadOrders() {
  const filePath = path.join(DATA_DIR, 'orders.json');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveOrders(orders) {
  const filePath = path.join(DATA_DIR, 'orders.json');
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
}

// Auth-Middleware: Token prüfen
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Nicht eingeloggt.' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token ungültig.' });
  }
}

// Admin-Middleware: Prüft ob User die Rolle "admin" hat
function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Kein Admin-Zugang.' });
  }
  next();
}

// ---- ADMIN: Kunde manuell anlegen ----
app.post('/api/admin/create-customer', authMiddleware, adminMiddleware, async (req, res) => {
  const name = sanitize(req.body.name);
  const email = req.body.email?.trim()?.toLowerCase();
  const phone = sanitize(req.body.phone || '');
  const address = sanitize(req.body.address || '');
  const notes = sanitize(req.body.notes || '');

  if (!name || !email) {
    return res.json({ success: false, message: 'Name und E-Mail sind Pflichtfelder.' });
  }

  const users = loadUsers();
  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: 'Ein Benutzer mit dieser E-Mail existiert bereits.' });
  }

  // Zufälliges Passwort generieren (Kunde kann es per "Passwort vergessen" ändern)
  const tempPassword = 'Kunde' + Math.random().toString(36).slice(2, 8);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    phone,
    address,
    notes,
    password: hashedPassword,
    role: 'kunde',
    verified: true,
    verifyToken: null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  console.log(`👤 Neuer Kunde angelegt: ${name} (${email}) – Temp-PW: ${tempPassword}`);
  res.json({
    success: true,
    message: `Kunde "${name}" angelegt! Temporäres Passwort: ${tempPassword}`,
    tempPassword
  });
});

// ---- ADMIN: Kunde löschen ----
app.delete('/api/admin/users/:email', authMiddleware, adminMiddleware, (req, res) => {
  const email = req.params.email;
  let users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) return res.json({ success: false, message: 'Benutzer nicht gefunden.' });
  if (user.role === 'admin') return res.json({ success: false, message: 'Admin-Konten können nicht gelöscht werden.' });

  users = users.filter(u => u.email !== email);
  saveUsers(users);
  console.log(`🗑️ Benutzer gelöscht: ${email}`);
  res.json({ success: true, message: `Benutzer ${user.name} gelöscht.` });
});

// ---- ADMIN: Mitarbeiter manuell anlegen ----
app.post('/api/admin/create-employee', authMiddleware, adminMiddleware, async (req, res) => {
  const name = sanitize(req.body.name);
  const email = req.body.email?.trim()?.toLowerCase();
  const phone = sanitize(req.body.phone || '');

  if (!name || !email) {
    return res.json({ success: false, message: 'Name und E-Mail sind Pflichtfelder.' });
  }

  const users = loadUsers();
  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: 'Ein Benutzer mit dieser E-Mail existiert bereits.' });
  }

  const tempPassword = 'Team' + Math.random().toString(36).slice(2, 8);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    phone,
    password: hashedPassword,
    role: 'mitarbeiter',
    verified: true,
    verifyToken: null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  console.log(`🧑‍💼 Neuer Mitarbeiter angelegt: ${name} (${email}) – Temp-PW: ${tempPassword}`);
  res.json({
    success: true,
    message: `Mitarbeiter "${name}" angelegt! Temporäres Passwort: ${tempPassword}`,
    tempPassword
  });
});

// ---- 5. AUFTRÄGE – Abrufen (Admin=alle, Mitarbeiter=nur eigene) ----
app.get('/api/orders', authMiddleware, (req, res) => {
  let orders = loadOrders();

  // Mitarbeiter sehen NUR ihre zugewiesenen Aufträge
  if (req.user.role === 'mitarbeiter') {
    orders = orders.filter(o => o.assignedTo === req.user.email);
  }

  res.json({ success: true, orders });
});

// ---- 6. AUFTRAG – Neu erstellen (nur Admin) ----
app.post('/api/orders', authMiddleware, adminMiddleware, (req, res) => {
  const { customer, service, address, date, notes, status, assignedTo } = req.body;

  if (!customer || !service) {
    return res.json({ success: false, message: 'Kunde und Leistung sind Pflichtfelder.' });
  }

  const orders = loadOrders();
  const newOrder = {
    id: Date.now(),
    customer,
    customerEmail: '',
    service,
    address: address || '',
    date: date || '',
    notes: notes || '',
    status: status || 'neu',
    recurring: req.body.recurring || '',
    assignedTo: assignedTo || '',      // ← Zugewiesener Mitarbeiter (Email)
    assignedName: '',                  // ← Name des Mitarbeiters
    completedBy: null,                 // ← Wer hat es erledigt?
    completedAt: null,                 // ← Wann erledigt?
    createdAt: new Date().toISOString()
  };

  // Kunden-E-Mail ermitteln
  const users = loadUsers();
  const customerUser = users.find(u => u.name === customer);
  if (customerUser) newOrder.customerEmail = customerUser.email;

  // Mitarbeiter-Name ermitteln
  if (assignedTo) {
    const users = loadUsers();
    const employee = users.find(u => u.email === assignedTo);
    if (employee) newOrder.assignedName = employee.name;
  }

  orders.push(newOrder);
  saveOrders(orders);

  console.log(`📋 Neuer Auftrag: ${customer} – ${service} (zugewiesen: ${assignedTo || 'niemand'})`);
  res.json({ success: true, order: newOrder });
});

// ---- 7. AUFTRAG – Bearbeiten ----
app.put('/api/orders/:id', authMiddleware, (req, res) => {
  const orderId = parseInt(req.params.id);
  const orders = loadOrders();
  const index = orders.findIndex(o => o.id === orderId);

  if (index === -1) {
    return res.json({ success: false, message: 'Auftrag nicht gefunden.' });
  }

  const { customer, service, address, date, notes, status, assignedTo } = req.body;

  // Alten Status merken für E-Mail-Benachrichtigung
  orders[index]._prevStatus = orders[index].status;

  // Wenn Status auf "bearbeitung" geändert wird → Startzeit speichern
  if (status === 'bearbeitung' && orders[index].status !== 'bearbeitung') {
    orders[index].startedAt = new Date().toISOString();
  }

  // Wenn Status auf "erledigt" geändert wird → Endzeit + wer es gemacht hat
  if (status === 'erledigt' && orders[index].status !== 'erledigt') {
    orders[index].completedBy = req.user.email;
    orders[index].completedAt = new Date().toISOString();

    // Name des Mitarbeiters ermitteln
    const users = loadUsers();
    const completer = users.find(u => u.email === req.user.email);
    if (completer) orders[index].completedByName = completer.name;
  }

  // Felder aktualisieren
  if (customer) orders[index].customer = customer;
  if (service) orders[index].service = service;
  if (address !== undefined) orders[index].address = address;
  if (date !== undefined) orders[index].date = date;
  if (notes !== undefined) orders[index].notes = notes;
  if (status) orders[index].status = status;
  if (assignedTo !== undefined) {
    orders[index].assignedTo = assignedTo;
    const users = loadUsers();
    const employee = users.find(u => u.email === assignedTo);
    orders[index].assignedName = employee ? employee.name : '';
  }
  // Wiederholung speichern
  if (req.body.recurring !== undefined) orders[index].recurring = req.body.recurring;

  orders[index].updatedAt = new Date().toISOString();

  // E-Mail Benachrichtigung bei Statusänderung
  const oldStatus = orders[index]._prevStatus;
  if (status && status !== oldStatus && orders[index].customerEmail) {
    const statusLabels = { neu:'Eingegangen', bearbeitung:'In Bearbeitung', erledigt:'Erledigt', storniert:'Storniert' };
    try {
      if (transporter) {
        transporter.sendMail({
          from: '"Team Hamburg" <noreply@team-hamburg.de>',
          to: orders[index].customerEmail,
          subject: `📋 Auftragsstatus: ${statusLabels[status] || status} – Team Hamburg`,
          html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#f8f9fb;border-radius:12px">
            <h2 style="color:#1e2d4a">Auftragsstatus aktualisiert</h2>
            <p>Ihr Auftrag <strong>${orders[index].service}</strong> hat einen neuen Status:</p>
            <div style="display:inline-block;padding:8px 16px;background:${status==='erledigt'?'#22c55e':status==='bearbeitung'?'#f59e0b':'#4a90d9'};color:#fff;border-radius:8px;font-weight:bold;margin:12px 0">${statusLabels[status] || status}</div>
            <p style="color:#6b7280;font-size:0.85rem;margin-top:16px">Bei Fragen kontaktieren Sie uns gerne.</p>
          </div>`
        }).catch(() => {});
      }
    } catch(e) {}
  }
  delete orders[index]._prevStatus;

  saveOrders(orders);
  console.log(`✏️ Auftrag bearbeitet: #${orderId}`);
  res.json({ success: true, order: orders[index] });
});

// ---- 8. AUFTRAG – Löschen/Stornieren ----
app.delete('/api/orders/:id', authMiddleware, (req, res) => {
  const orderId = parseInt(req.params.id);
  let orders = loadOrders();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.json({ success: false, message: 'Auftrag nicht gefunden.' });
  }

  orders = orders.filter(o => o.id !== orderId);
  saveOrders(orders);

  console.log(`❌ Auftrag storniert: #${orderId} (${order.customer})`);
  res.json({ success: true, message: 'Auftrag storniert.' });
});

// ---- 9. ADMIN: Alle User abrufen (nur für Admins!) ----
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = loadUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role || 'kunde',
    createdAt: u.createdAt
    // Passwort wird NICHT mitgesendet!
  }));
  res.json({ success: true, users });
});

// ---- 10. KOMMENTARE – Zum Auftrag hinzufügen ----
app.post('/api/orders/:id/comments', authMiddleware, (req, res) => {
  const orderId = parseInt(req.params.id);
  const { text, rating } = req.body;

  if (!text || text.trim().length === 0) {
    return res.json({ success: false, message: 'Kommentar darf nicht leer sein.' });
  }

  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.json({ success: false, message: 'Auftrag nicht gefunden.' });
  }

  // Kommentare-Array anlegen falls nicht vorhanden
  if (!order.comments) order.comments = [];

  // Name des Kommentar-Autors ermitteln
  const users = loadUsers();
  const author = users.find(u => u.email === req.user.email);

  const comment = {
    id: Date.now(),
    author: author ? author.name : req.user.email,
    email: req.user.email,
    role: req.user.role || 'kunde',
    text: text.trim(),
    rating: rating || null,  // 1-5 Sterne (nur Kunden)
    createdAt: new Date().toISOString()
  };

  order.comments.push(comment);

  // Wenn Kunde eine Bewertung abgibt, auf dem Auftrag speichern
  if (rating && req.user.role === 'kunde') {
    order.rating = rating;
  }

  saveOrders(orders);
  console.log(`💬 Neuer Kommentar zu Auftrag #${orderId} von ${comment.author} (${comment.role})`);
  res.json({ success: true, comment });
});

// ---- 11. KOMMENTARE – Alle zu einem Auftrag abrufen ----
app.get('/api/orders/:id/comments', authMiddleware, (req, res) => {
  const orderId = parseInt(req.params.id);
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.json({ success: false, message: 'Auftrag nicht gefunden.' });
  }

  res.json({ success: true, comments: order.comments || [], rating: order.rating || null });
});

// ---- 12. PASSWORT ZURÜCKSETZEN – Anfrage ----
app.post('/api/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Bitte E-Mail eingeben.' });

  const users = loadUsers();
  const user = users.find(u => u.email === email);

  // Aus Sicherheitsgründen immer die gleiche Meldung (kein Hinweis ob Email existiert)
  if (!user) {
    return res.json({ success: true, message: 'Falls ein Konto existiert, wurde eine E-Mail gesendet.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiry = Date.now() + 60 * 60 * 1000; // 1 Stunde gültig

  user.resetToken = resetToken;
  user.resetExpiry = resetExpiry;
  saveUsers(users);

  const resetUrl = `http://localhost:${PORT}/reset-password.html?token=${resetToken}`;

  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: '"Team Hamburg" <noreply@team-hamburg.de>',
        to: email,
        subject: '🔐 Passwort zurücksetzen – Team Hamburg',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#f8f9fb;border-radius:12px">
            <h2 style="color:#1e2d4a">Passwort zurücksetzen</h2>
            <p>Klicke auf den Button, um ein neues Passwort zu setzen:</p>
            <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:#4a90d9;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;margin:20px 0">Neues Passwort setzen</a>
            <p style="color:#6b7280;font-size:0.85rem">Link gültig für 1 Stunde.</p>
            <p style="color:#9ca3af;font-size:0.78rem">Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.</p>
          </div>
        `
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`📧 Reset-Link Vorschau: ${previewUrl}`);
    }
  } catch (err) {
    console.log('⚠️ Reset-E-Mail Fehler:', err.message);
  }

  console.log(`🔐 Passwort-Reset angefragt: ${email}`);
  console.log(`🔗 Reset-Link: ${resetUrl}`);

  res.json({ success: true, message: 'Falls ein Konto existiert, wurde eine E-Mail gesendet.' });
});

// ---- 13. PASSWORT ZURÜCKSETZEN – Ausführen ----
app.post('/api/reset-password', authLimiter, async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.json({ success: false, message: 'Token und Passwort erforderlich.' });
  }
  if (password.length < 6) {
    return res.json({ success: false, message: 'Passwort muss mindestens 6 Zeichen haben.' });
  }

  const users = loadUsers();
  const user = users.find(u => u.resetToken === token);

  if (!user || !user.resetExpiry || Date.now() > user.resetExpiry) {
    return res.json({ success: false, message: 'Link ist ungültig oder abgelaufen.' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetExpiry = null;
  saveUsers(users);

  console.log(`✅ Passwort zurückgesetzt: ${user.email}`);
  res.json({ success: true, message: 'Passwort erfolgreich geändert! Du kannst dich jetzt einloggen.' });
});

// ---- 14. KONTO LÖSCHEN ----
app.delete('/api/account', authMiddleware, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.json({ success: false, message: 'Passwort zur Bestätigung erforderlich.' });

  const users = loadUsers();
  const user = users.find(u => u.email === req.user.email);
  if (!user) return res.json({ success: false, message: 'Benutzer nicht gefunden.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: 'Falsches Passwort.' });

  // User löschen
  const filtered = users.filter(u => u.email !== req.user.email);
  saveUsers(filtered);

  console.log(`🗑️ Konto gelöscht: ${user.email}`);
  res.json({ success: true, message: 'Dein Konto wurde gelöscht.' });
});

// ---- 15. PROFIL – Abrufen ----
app.get('/api/profile', authMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find(u => u.email === req.user.email);
  if (!user) return res.status(404).json({ success: false, message: 'Nicht gefunden.' });

  res.json({
    success: true,
    profile: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'kunde',
      createdAt: user.createdAt
    }
  });
});

// ---- 16. KUNDEN: Eigene Aufträge abrufen ----
app.get('/api/my-orders', authMiddleware, (req, res) => {
  const orders = loadOrders();
  // Aufträge finden, die den Namen oder die E-Mail des Kunden enthalten
  const myOrders = orders.filter(o =>
    o.customerEmail === req.user.email ||
    o.customer?.toLowerCase().includes(req.user.email?.split('@')[0]?.toLowerCase())
  );
  res.json({ success: true, orders: myOrders });
});

// ---- 17. KUNDEN: Auftrag anfragen ----
app.post('/api/request-order', authMiddleware, (req, res) => {
  const service = sanitize(req.body.service);
  const address = sanitize(req.body.address);
  const date = req.body.date;
  const notes = sanitize(req.body.notes);

  if (!service) {
    return res.json({ success: false, message: 'Bitte eine Leistung auswählen.' });
  }

  // Kundeninfo ermitteln
  const users = loadUsers();
  const customer = users.find(u => u.email === req.user.email);
  const customerName = customer ? customer.name : req.user.email;

  const orders = loadOrders();
  const newOrder = {
    id: Date.now(),
    customer: customerName,
    customerEmail: req.user.email,
    service,
    address: address || '',
    date: date || '',
    notes: notes || '',
    status: 'neu',
    assignedTo: '',
    assignedName: '',
    completedBy: null,
    completedAt: null,
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  saveOrders(orders);

  console.log(`📋 Neue Kundenanfrage: ${customerName} – ${service}`);
  res.json({ success: true, order: newOrder, message: 'Auftrag erfolgreich angefragt!' });
});

// ---- 18. ÖFFENTLICH: Bewertungen laden ----
app.get('/api/public/reviews', (req, res) => {
  const orders = loadOrders();
  const reviews = orders
    .filter(o => o.rating && o.rating >= 4) // Nur 4-5 Sterne anzeigen
    .map(o => ({
      name: o.customer,
      service: o.service,
      rating: o.rating,
      comment: (o.comments || []).find(c => c.rating)?.text || '',
      date: o.completedAt || o.createdAt
    }))
    .slice(-6); // Max 6 Bewertungen
  res.json({ success: true, reviews });
});

// =============================================
// 404 – FALLBACK-ROUTE
// ==============================================

// API: 404 für nicht vorhandene API-Routen
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API-Route nicht gefunden.' });
});

// HTML: Eigene 404-Seite für nicht vorhandene Seiten
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// =============================================
// SERVER STARTEN
// ==============================================
app.listen(PORT, () => {
  console.log('');
  console.log('🧹 ==========================================');
  console.log('   REINIGUNGSFIRMA TEAM HAMBURG');
  console.log('   Server läuft!');
  console.log(`   🌐 http://localhost:${PORT}`);
  console.log(`   🔐 Admin: http://localhost:${PORT}/admin.html`);
  console.log('   📁 Frontend: /public');
  console.log('   📊 Daten:    /data');
  console.log('🧹 ==========================================');
  console.log('');
});
