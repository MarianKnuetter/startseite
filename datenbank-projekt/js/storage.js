// Local Storage Manager for Personal Organizer
// Hinweis: Enthält ausschließlich fiktive Demo-Daten.

const STORAGE_KEYS = {
    LETTERS: 'organizer_letters',
    CARDS: 'organizer_cards',
    CONTRACTS: 'organizer_contracts',
    ACTIVITIES: 'organizer_activities'
};

// ----------------------------------------------------
// INDEXEDDB FOR PDF ATTACHMENTS (Avoids localStorage limit)
// ----------------------------------------------------
const DB_NAME = 'organizer_attachments_db';
const DB_VERSION = 1;
const STORE_NAME = 'pdfs';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function savePDFAttachment(itemId, fileData) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(fileData, itemId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getPDFAttachment(itemId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(itemId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deletePDFAttachment(itemId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(itemId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ----------------------------------------------------
// DYNAMIC MOCK DATA HELPERS (Ensures tests stay relevant)
// ----------------------------------------------------
function getRelativeDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().substring(0, 10);
}

function getRelativeDateTimeString(daysOffset, hoursOffset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(d.getHours() + hoursOffset);
    return d.toISOString();
}

function getRelativeCardExpiry(monthsOffset) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsOffset);
    return {
        month: d.getMonth() + 1, // 1-indexed
        year: d.getFullYear()
    };
}

// Initialize Storage with fictional mock data if empty
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.LETTERS)) {
        const mockLetters = [
            {
                id: 'l-1',
                category: 'letter',
                sender: 'Finanzamt Berlin-Mitte',
                date: getRelativeDateString(-4),
                status: 'action_required',
                deadline: getRelativeDateString(6), // Critical!
                tags: 'steuer',
                notes: 'Steuernachzahlung für das Jahr 2024. Betrag: 342,50 €.',
                createdAt: getRelativeDateTimeString(-4, -2)
            },
            {
                id: 'l-2',
                category: 'letter',
                sender: 'Rundfunkbeitrag (GEZ)',
                date: getRelativeDateString(-10),
                status: 'unread',
                notes: 'Zahlungsaufforderung für das 2. Quartal. Keine direkte Frist angegeben.',
                createdAt: getRelativeDateTimeString(-10, -1)
            },
            {
                id: 'l-3',
                category: 'letter',
                sender: 'Allianz Versicherung',
                date: getRelativeDateString(-42),
                status: 'read',
                tags: 'versicherung',
                notes: 'Bestätigung über Beitragsanpassung für die Hausratversicherung.',
                createdAt: getRelativeDateTimeString(-42, 4)
            }
        ];
        localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(mockLetters));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
        const expActive = getRelativeCardExpiry(27);
        const expSoon = getRelativeCardExpiry(2);
        const expExpired = getRelativeCardExpiry(-1);

        const mockCards = [
            {
                id: 'c-1',
                category: 'card',
                bank: 'DKB Bank',
                cardName: 'DKB Visa Debit',
                expiryMonth: expActive.month,
                expiryYear: expActive.year, // Active
                creditLimit: 5000,
                status: 'active',
                createdAt: getRelativeDateTimeString(-300)
            },
            {
                id: 'c-2',
                category: 'card',
                bank: 'N26 Bank',
                cardName: 'N26 Mastercard Black',
                expiryMonth: expSoon.month,
                expiryYear: expSoon.year, // Expiring soon - Warning!
                creditLimit: 3000,
                status: 'active',
                createdAt: getRelativeDateTimeString(-700)
            },
            {
                id: 'c-3',
                category: 'card',
                bank: 'Sparkasse',
                cardName: 'Girocard Gold',
                expiryMonth: expExpired.month,
                expiryYear: expExpired.year, // Expired last month
                creditLimit: 1000,
                status: 'expired',
                createdAt: getRelativeDateTimeString(-1000)
            }
        ];
        localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(mockCards));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CONTRACTS)) {
        const mockContracts = [
            {
                id: 'co-1',
                category: 'contract',
                provider: 'Vodafone GmbH',
                planName: 'Red Internet & Phone 250 Cable',
                customerNumber: 'DE-23948710',
                monthlyCost: 39.99,
                cancellationDeadline: getRelativeDateString(177), // Active, far deadline
                status: 'active',
                createdAt: getRelativeDateTimeString(-500)
            },
            {
                id: 'co-2',
                category: 'contract',
                provider: 'Netflix Inc.',
                planName: 'Netflix Premium (4K)',
                customerNumber: 'NET-991204',
                monthlyCost: 17.99,
                cancellationDeadline: getRelativeDateString(14), // Cancellable soon - Warning!
                status: 'active',
                createdAt: getRelativeDateTimeString(-1200)
            },
            {
                id: 'co-3',
                category: 'contract',
                provider: 'McFit Berlin',
                planName: 'Classic Membership',
                customerNumber: 'MF-88371',
                monthlyCost: 24.90,
                cancellationDeadline: getRelativeDateString(-52), // Already cancelled
                status: 'cancelled',
                createdAt: getRelativeDateTimeString(-400)
            }
        ];
        localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(mockContracts));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
        const mockActivities = [
            {
                id: 'act-1',
                timestamp: getRelativeDateTimeString(-4, 0.1),
                type: 'create',
                itemCategory: 'letter',
                itemName: 'Finanzamt Berlin-Mitte',
                description: 'Brief von Finanzamt Berlin-Mitte hinzugefügt.'
            },
            {
                id: 'act-2',
                timestamp: getRelativeDateTimeString(-10, 0.2),
                type: 'create',
                itemCategory: 'letter',
                itemName: 'Rundfunkbeitrag (GEZ)',
                description: 'Brief von Rundfunkbeitrag (GEZ) hinzugefügt.'
            },
            {
                id: 'act-3',
                timestamp: getRelativeDateTimeString(-21, 0.5),
                type: 'update',
                itemCategory: 'card',
                itemName: 'Sparkasse Girocard Gold',
                description: 'Status für Sparkasse Girocard Gold auf abgelaufen gesetzt.'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mockActivities));
    }
}

// Helper to get data from local storage
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Helper to save data to local storage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Retrieve items
function getLetters() {
    return getData(STORAGE_KEYS.LETTERS);
}

function getCards() {
    return getData(STORAGE_KEYS.CARDS);
}

function getContracts() {
    return getData(STORAGE_KEYS.CONTRACTS);
}

function getActivities() {
    // Sort activities by timestamp descending
    return getData(STORAGE_KEYS.ACTIVITIES).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Add/Update methods
function saveLetter(letter) {
    const letters = getLetters();
    const isNew = !letter.id;

    if (isNew) {
        letter.id = 'l-' + Date.now();
        letter.createdAt = new Date().toISOString();
        letters.push(letter);
        addActivity('create', 'letter', letter.sender, `Brief von ${letter.sender} hinzugefügt.`);
    } else {
        const index = letters.findIndex(l => l.id === letter.id);
        if (index !== -1) {
            letters[index] = { ...letters[index], ...letter };
            addActivity('update', 'letter', letter.sender, `Brief von ${letter.sender} aktualisiert.`);
        }
    }

    saveData(STORAGE_KEYS.LETTERS, letters);
    return letter;
}

function saveCard(card) {
    const cards = getCards();
    const isNew = !card.id;

    // Auto status calculation for safety
    const expiryMonth = parseInt(card.expiryMonth);
    const expiryYear = parseInt(card.expiryYear);
    const today = new Date(); // Dynamic now
    const cardExpiry = new Date(expiryYear, expiryMonth - 1, 28); // end of month roughly

    if (cardExpiry < today) {
        card.status = 'expired';
    } else if (card.status === 'expired') {
        card.status = 'active'; // Reset if user changed expiration date
    }

    if (isNew) {
        card.id = 'c-' + Date.now();
        card.createdAt = new Date().toISOString();
        cards.push(card);
        addActivity('create', 'card', card.bank + ' - ' + card.cardName, `Kreditkarte ${card.cardName} (${card.bank}) hinzugefügt.`);
    } else {
        const index = cards.findIndex(c => c.id === card.id);
        if (index !== -1) {
            cards[index] = { ...cards[index], ...card };
            addActivity('update', 'card', card.bank + ' - ' + card.cardName, `Kreditkarte ${card.cardName} (${card.bank}) aktualisiert.`);
        }
    }

    saveData(STORAGE_KEYS.CARDS, cards);
    return card;
}

function saveContract(contract) {
    const contracts = getContracts();
    const isNew = !contract.id;

    if (isNew) {
        contract.id = 'co-' + Date.now();
        contract.createdAt = new Date().toISOString();
        contracts.push(contract);
        addActivity('create', 'contract', contract.provider + ' (' + contract.planName + ')', `Vertrag ${contract.planName} bei ${contract.provider} hinzugefügt.`);
    } else {
        const index = contracts.findIndex(c => c.id === contract.id);
        if (index !== -1) {
            contracts[index] = { ...contracts[index], ...contract };
            addActivity('update', 'contract', contract.provider + ' (' + contract.planName + ')', `Vertrag ${contract.planName} bei ${contract.provider} aktualisiert.`);
        }
    }

    saveData(STORAGE_KEYS.CONTRACTS, contracts);
    return contract;
}

// Delete methods
function deleteItem(id, category) {
    let key;
    let itemName = '';
    let itemCategoryName = '';

    if (category === 'letter') {
        key = STORAGE_KEYS.LETTERS;
        const letters = getLetters();
        const item = letters.find(l => l.id === id);
        if (item) itemName = item.sender;
        itemCategoryName = 'letter';
        saveData(key, letters.filter(l => l.id !== id));
    } else if (category === 'card') {
        key = STORAGE_KEYS.CARDS;
        const cards = getCards();
        const item = cards.find(c => c.id === id);
        if (item) itemName = item.bank + ' - ' + item.cardName;
        itemCategoryName = 'card';
        saveData(key, cards.filter(c => c.id !== id));
    } else if (category === 'contract') {
        key = STORAGE_KEYS.CONTRACTS;
        const contracts = getContracts();
        const item = contracts.find(c => c.id === id);
        if (item) itemName = item.provider + ' (' + item.planName + ')';
        itemCategoryName = 'contract';
        saveData(key, contracts.filter(c => c.id !== id));
    }

    if (itemName) {
        addActivity('delete', itemCategoryName, itemName, `Eintrag "${itemName}" gelöscht.`);
    }

    // Cascading delete for IndexedDB PDF attachment
    deletePDFAttachment(id).catch(err => console.error('Fehler beim Löschen des PDF-Anhangs in IndexedDB:', err));
}

// Activity tracker
function addActivity(type, itemCategory, itemName, description) {
    const activities = getData(STORAGE_KEYS.ACTIVITIES);
    const newActivity = {
        id: 'act-' + Date.now(),
        timestamp: new Date().toISOString(),
        type,
        itemCategory,
        itemName,
        description
    };
    activities.push(newActivity);
    // Keep last 100 activities
    if (activities.length > 100) {
        activities.shift();
    }
    saveData(STORAGE_KEYS.ACTIVITIES, activities);
}

// ----------------------------------------------------
// BACKUP EXPORT & IMPORT UTILITIES
// ----------------------------------------------------
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function getAllPDFAttachments() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.openCursor();
        const attachments = {};

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                attachments[cursor.key] = cursor.value;
                cursor.continue();
            } else {
                resolve(attachments);
            }
        };
        request.onerror = (event) => reject(request.error);
    });
}

async function clearAllPDFAttachments() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function exportBackupData() {
    const letters = getLetters();
    const cards = getCards();
    const contracts = getContracts();
    const activities = getActivities();

    const attachmentsRaw = await getAllPDFAttachments();
    const attachments = {};
    for (const key in attachmentsRaw) {
        attachments[key] = arrayBufferToBase64(attachmentsRaw[key]);
    }

    const backup = {
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
            letters,
            cards,
            contracts,
            activities,
            attachments
        }
    };

    return JSON.stringify(backup, null, 2);
}

async function importBackupData(jsonString) {
    const backup = JSON.parse(jsonString);
    if (!backup.version || !backup.data) {
        throw new Error('Ungültiges Backup-Format.');
    }

    const { letters, cards, contracts, activities, attachments } = backup.data;

    // Clear current database first
    localStorage.removeItem(STORAGE_KEYS.LETTERS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.CONTRACTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    await clearAllPDFAttachments();

    // Save metadata to localStorage
    if (letters) saveData(STORAGE_KEYS.LETTERS, letters);
    if (cards) saveData(STORAGE_KEYS.CARDS, cards);
    if (contracts) saveData(STORAGE_KEYS.CONTRACTS, contracts);
    if (activities) saveData(STORAGE_KEYS.ACTIVITIES, activities);

    // Save attachments to IndexedDB
    if (attachments) {
        for (const key in attachments) {
            const arrayBuffer = base64ToArrayBuffer(attachments[key]);
            await savePDFAttachment(key, arrayBuffer);
        }
    }

    addActivity('import', 'system', 'Backup Import', 'Daten erfolgreich aus lokaler Backup-Datei wiederhergestellt.');
}

// Remove attachment metadata from an item
function removeItemAttachmentMetadata(itemId, category) {
    if (category === 'letter') {
        const letters = getLetters();
        const index = letters.findIndex(l => l.id === itemId);
        if (index !== -1) {
            delete letters[index].attachmentName;
            saveData(STORAGE_KEYS.LETTERS, letters);
        }
    } else if (category === 'card') {
        const cards = getCards();
        const index = cards.findIndex(c => c.id === itemId);
        if (index !== -1) {
            delete cards[index].attachmentName;
            saveData(STORAGE_KEYS.CARDS, cards);
        }
    } else if (category === 'contract') {
        const contracts = getContracts();
        const index = contracts.findIndex(co => co.id === itemId);
        if (index !== -1) {
            delete contracts[index].attachmentName;
            saveData(STORAGE_KEYS.CONTRACTS, contracts);
        }
    }
}

// Auto-run initialization
initializeStorage();
