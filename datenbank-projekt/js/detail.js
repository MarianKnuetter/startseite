document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initTheme();

    const detailId = sessionStorage.getItem('detail_id');
    const detailCategory = sessionStorage.getItem('detail_category');

    if (!detailId || !detailCategory) {
        document.getElementById('detail-content').innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: var(--color-danger);"></i>
                <h3 style="margin-top: 1rem; color: var(--text-primary);">Fehler: Keine Daten gefunden</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Es wurde kein Eintrag ausgewählt.</p>
                <button class="btn btn-primary" onclick="window.location.href='index.html'">Zurück zum Dashboard</button>
            </div>`;
        lucide.createIcons();
        return;
    }

    loadAndRenderDetails(detailId, detailCategory);
});

// =========================================================================
// THEME HANDLING
// =========================================================================
function initTheme() {
    const isDark = localStorage.getItem('organizer_theme') === 'dark';
    document.body.classList.toggle('light-mode', !isDark);

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        lucide.createIcons();
    }

    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const willBeDark = document.body.classList.contains('light-mode');
            document.body.classList.toggle('light-mode');
            localStorage.setItem('organizer_theme', willBeDark ? 'dark' : 'light');
            themeIcon.setAttribute('data-lucide', willBeDark ? 'sun' : 'moon');
            lucide.createIcons();
        });
    }
}

// =========================================================================
// RENDER DETAILS
// =========================================================================
function loadAndRenderDetails(id, category) {
    let item = null;
    let iconName = '';
    let categoryLabel = '';

    if (category === 'letter') {
        const letters = getLetters();
        item = letters.find(l => l.id === id);
        iconName = 'mail';
        categoryLabel = 'Brief / Dokument';
    } else if (category === 'card') {
        const cards = getCards();
        item = cards.find(c => c.id === id);
        iconName = 'credit-card';
        categoryLabel = 'Kreditkarte';
    } else if (category === 'contract') {
        const contracts = getContracts();
        item = contracts.find(co => co.id === id);
        iconName = 'file-text';
        categoryLabel = 'Vertrag / Abo';
    }

    if (!item) {
        document.getElementById('detail-content').innerHTML = `<h3 style="text-align:center; color:var(--text-primary); margin-top:3rem;">Eintrag nicht gefunden.</h3>`;
        return;
    }

    // Helper functions
    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    };

    let title = '';
    let subtitle = '';
    let infoGridHtml = '';
    let customVisualHtml = '';
    let notesRaw = item.notes || ''; // For the textarea

    // Generate Category specific HTML
    if (category === 'letter') {
        title = escapeHtml(item.sender);
        subtitle = `${escapeHtml(item.category || 'Brief')} · ${formatDate(item.date)}`;

        let statusText = 'Ungelesen';
        let statusBadge = 'badge-muted';
        if (item.status === 'read') { statusText = 'Gelesen'; statusBadge = 'badge-success'; }
        else if (item.status === 'action_required') { statusText = 'Aktion erforderlich'; statusBadge = 'badge-danger'; }

        const TAG_LABELS = {
            steuer: '🟡 Steuer', versicherung: '🟣 Versicherung', behoerde: '🔴 Behörde',
            gesundheit: '🟢 Gesundheit', wohnen: '🔵 Wohnen', arbeit: '🟠 Arbeit'
        };
        const tagLabel = item.tags ? (TAG_LABELS[item.tags] || escapeHtml(item.tags)) : '-';

        infoGridHtml = `
            <div class="info-tile">
                <span class="info-tile-label">Frist / Deadline</span>
                <span class="info-tile-value">${formatDate(item.deadline)}</span>
            </div>
            <div class="info-tile">
                <span class="info-tile-label">Status</span>
                <span class="info-tile-value"><span class="badge ${statusBadge}">${statusText}</span></span>
            </div>
            <div class="info-tile">
                <span class="info-tile-label">Tag</span>
                <span class="info-tile-value">${tagLabel}</span>
            </div>
        `;

    } else if (category === 'card') {
        title = escapeHtml(item.bank);
        subtitle = `Inhaber: ${escapeHtml(item.cardName)}`;

        infoGridHtml = `
            <div class="info-tile">
                <span class="info-tile-label">Ablaufdatum</span>
                <span class="info-tile-value">${String(item.expiryMonth).padStart(2, '0')}/${item.expiryYear}</span>
            </div>
            <div class="info-tile">
                <span class="info-tile-label">Kreditlimit</span>
                <span class="info-tile-value">${item.creditLimit ? item.creditLimit + ' €' : '-'}</span>
            </div>
            <div class="info-tile">
                <span class="info-tile-label">Status</span>
                <span class="info-tile-value">${item.status === 'active' ? '<span class="badge badge-success">Aktiv</span>' : '<span class="badge badge-danger">Gesperrt</span>'}</span>
            </div>
        `;

        // Visual Card
        const networkLogos = {
            'visa': 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png',
            'mastercard': 'https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg',
            'amex': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
            'girocard': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Girocard_logo.svg'
        };

        const networks = ['visa', 'mastercard', 'amex', 'girocard'];
        const textToMatch = `${item.bank} ${item.notes || ''}`.toLowerCase();
        let detectedNetwork = 'girocard';
        for (const net of networks) {
            if (textToMatch.includes(net)) { detectedNetwork = net; break; }
        }

        const bgColors = [
            'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            'linear-gradient(135deg, #111 0%, #434343 100%)',
            'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
            'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            'linear-gradient(135deg, #00b09b, #96c93d)',
            'linear-gradient(135deg, #b92b27, #1565C0)'
        ];

        let hash = 0;
        for (let i = 0; i < item.bank.length; i++) { hash = item.bank.charCodeAt(i) + ((hash << 5) - hash); }
        const gradient = bgColors[Math.abs(hash) % bgColors.length];

        const logoUrl = networkLogos[detectedNetwork];

        customVisualHtml = `
            <div class="detail-card-preview">
                <div style="width:340px; height:210px; border-radius:18px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between; color:white; font-family:'Courier New', Courier, monospace; background:${gradient}; box-shadow:var(--shadow-card); position:relative; overflow:hidden;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <h3 style="margin:0; font-family:'Outfit', sans-serif; font-size:1.2rem; font-weight:600; text-shadow:0 1px 2px rgba(0,0,0,0.5);">${escapeHtml(item.bank)}</h3>
                        ${logoUrl ? `<img src="${logoUrl}" alt="${detectedNetwork}" style="height:24px; max-width:60px; object-fit:contain; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.3));">` : ''}
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.5rem;">
                        <div style="width:45px; height:35px; background:linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); border-radius:6px; opacity:0.8; box-shadow:inset 0 0 4px rgba(0,0,0,0.2);"></div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                            <div>
                                <div style="font-size:0.7rem; opacity:0.8; margin-bottom:2px; font-family:'Outfit', sans-serif;">Cardholder</div>
                                <div style="font-size:1rem; letter-spacing:1px; text-shadow:0 1px 2px rgba(0,0,0,0.5);">${escapeHtml(item.cardName).toUpperCase()}</div>
                            </div>
                            <div>
                                <div style="font-size:0.7rem; opacity:0.8; margin-bottom:2px; font-family:'Outfit', sans-serif;">Expires</div>
                                <div style="font-size:1rem; text-shadow:0 1px 2px rgba(0,0,0,0.5);">${String(item.expiryMonth).padStart(2, '0')}/${item.expiryYear}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } else if (category === 'contract') {
        title = escapeHtml(item.provider);
        subtitle = escapeHtml(item.planName);

        infoGridHtml = `
            <div class="info-tile">
                <span class="info-tile-label">Kosten</span>
                <span class="info-tile-value">${item.monthlyCost} € / Monat</span>
            </div>
            <div class="info-tile">
                <span class="info-tile-label">Kundennummer</span>
                <span class="info-tile-value">${escapeHtml(item.customerNumber) || '-'}</span>
            </div>
            <div class="info-tile">
                <span class="info-tile-label">Kündigungsfrist</span>
                <span class="info-tile-value">${formatDate(item.cancellationDeadline)}</span>
            </div>
            <div class="info-tile">
                <span class="info-tile-label">Status</span>
                <span class="info-tile-value">${item.status === 'active' ? '<span class="badge badge-success">Aktiv</span>' : '<span class="badge badge-danger">Gekündigt</span>'}</span>
            </div>
        `;

        const yearly = parseFloat(item.monthlyCost || 0) * 12;
        customVisualHtml = `
            <div class="detail-timeline" style="margin: 1rem 0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <span style="font-weight:600; color:var(--text-primary);">Jahreskosten</span>
                    <span style="font-weight:700; color:var(--text-primary);">${yearly.toFixed(2)} €</span>
                </div>
                <div class="detail-cost-bar">
                    <div class="detail-cost-bar-fill" style="width: 100%;"></div>
                </div>
            </div>
        `;
    }

    // Timeline Section
    const createdAt = item.createdAt ? escapeHtml(item.createdAt) : 'Unbekannt';
    const lastModified = escapeHtml(item.lastModified || item.createdAt || 'Unbekannt');

    const timelineHtml = `
        <div class="detail-timeline">
            <h3 class="detail-section-title"><i data-lucide="clock"></i> Aktivitäts-Zeitstrahl</h3>
            <div class="timeline-event">
                <div class="timeline-event-icon"><i data-lucide="plus"></i></div>
                <div class="timeline-event-content">
                    <div class="timeline-event-text">Eintrag erstellt</div>
                    <div class="timeline-event-date">${createdAt}</div>
                </div>
            </div>
            ${lastModified !== createdAt ? `
            <div class="timeline-event">
                <div class="timeline-event-icon"><i data-lucide="edit-2"></i></div>
                <div class="timeline-event-content">
                    <div class="timeline-event-text">Zuletzt bearbeitet</div>
                    <div class="timeline-event-date">${lastModified}</div>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    // RENDER 3-COLUMN LAYOUT
    document.getElementById('detail-content').innerHTML = `
        <div class="detail-grid">

            <!-- LEFT COLUMN: DOCUMENT -->
            <div class="detail-column-left">
                <div class="document-viewer-container">
                    <div class="document-viewer-header">
                        <i data-lucide="paperclip"></i> ${item.hasAttachment ? escapeHtml(item.attachmentFilename || 'Dokument') : 'Dokument / Anhang'}
                    </div>
                    ${item.hasAttachment ? `
                        <div class="document-viewer-content" id="pdf-inline-container">
                            <canvas id="pdf-inline-canvas" style="width:100%; display:none;"></canvas>
                            <div id="pdf-loading" style="display:flex; flex-direction:column; align-items:center; color:var(--color-primary); gap:1rem;">
                                <i data-lucide="loader-2" class="spin" style="width:32px;height:32px;"></i>
                                <span>Lade Dokument...</span>
                            </div>
                        </div>
                    ` : `
                        <div class="document-viewer-content">
                            <div class="document-empty-state">
                                <i data-lucide="file-x" style="width:48px;height:48px;opacity:0.5;"></i>
                                <span>Kein Anhang vorhanden.</span>
                            </div>
                        </div>
                    `}
                </div>
            </div>

            <!-- CENTER COLUMN: METADATA -->
            <div class="detail-column-center">
                <div class="detail-hero">
                    <div class="detail-icon-box">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <div class="detail-title-area">
                        <span class="detail-category-label">${categoryLabel}</span>
                        <h1 class="detail-title">${title}</h1>
                        <div class="detail-subtitle">${subtitle}</div>
                    </div>
                    ${item.status === 'action_required' ? '<span class="badge badge-danger" style="align-self:flex-start;">Aktion Erforderlich</span>' : ''}
                </div>

                ${customVisualHtml}

                <div class="detail-info-grid">
                    ${infoGridHtml}
                </div>

                ${timelineHtml}

                <div class="detail-actions">
                    <button class="btn btn-outline" onclick="window.print()">
                        <i data-lucide="printer"></i> Drucken / PDF
                    </button>
                    <button class="btn btn-primary" onclick="editItemFromDetail()">
                        <i data-lucide="edit"></i> Bearbeiten
                    </button>
                    <button class="btn btn-outline" style="color:var(--color-danger); border-color:var(--color-danger);" onclick="deleteItemFromDetail()">
                        <i data-lucide="trash-2"></i> Löschen
                    </button>
                </div>
            </div>

            <!-- RIGHT COLUMN: NOTES -->
            <div class="detail-column-right">
                <div class="editable-notes-container">
                    <div class="editable-notes-header">
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <i data-lucide="edit-3"></i> Meine Notizen
                        </div>
                        <span class="badge badge-success" id="notes-status-badge" style="opacity:0; transition:opacity 0.3s;">Gespeichert ✓</span>
                    </div>
                    <textarea class="editable-notes-textarea" id="detail-notes-textarea" placeholder="Tippe hier, um Notizen zu erstellen... Damit du immer auf dem Laufenden bleibst!">${escapeHtml(notesRaw)}</textarea>
                    <div class="editable-notes-actions">
                        <button class="btn btn-primary" onclick="saveNotesFromDetail('${id}', '${category}')">
                            <i data-lucide="save"></i> Notizen speichern
                        </button>
                    </div>
                </div>
            </div>

        </div>
    `;

    lucide.createIcons();

    // Load PDF automatically if exists
    if (item.hasAttachment) {
        viewPdfAttachment(id, category);
    }
}

// =========================================================================
// ATTACHMENT VIEWER
// =========================================================================
window.viewPdfAttachment = async function(id, category) {
    try {
        const fileData = await window.getAttachment(id);
        const container = document.getElementById('pdf-inline-container');
        const canvas = document.getElementById('pdf-inline-canvas');
        const loading = document.getElementById('pdf-loading');

        if (!fileData) {
            container.innerHTML = `<div class="document-empty-state"><i data-lucide="alert-circle" style="color:var(--color-danger);"></i><span>Anhang konnte nicht geladen werden.</span></div>`;
            lucide.createIcons();
            return;
        }

        if (fileData.type && fileData.type.startsWith('image/')) {
            const img = new Image();
            img.src = URL.createObjectURL(new Blob([fileData.data], {type: fileData.type}));
            img.style.width = '100%';
            img.style.maxHeight = '800px';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
            container.innerHTML = '';
            container.appendChild(img);
            return;
        }

        // Render PDF
        const loadingTask = pdfjsLib.getDocument({ data: fileData.data });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        if(loading) loading.style.display = 'none';
        canvas.style.display = 'block';

    } catch (error) {
        console.error('Fehler beim Laden des Anhangs:', error);
        const container = document.getElementById('pdf-inline-container');
        if(container) {
            container.innerHTML = `<div class="document-empty-state"><i data-lucide="alert-triangle" style="color:var(--color-danger);"></i><span>Fehler beim Rendern des Dokuments.</span></div>`;
            lucide.createIcons();
        }
    }
};

// =========================================================================
// NOTES SAVING
// =========================================================================
window.saveNotesFromDetail = function(id, category) {
    const newNotes = document.getElementById('detail-notes-textarea').value;

    let items = [];
    let storageKey = '';

    if (category === 'letter') {
        items = getLetters();
        storageKey = STORAGE_KEYS.LETTERS;
    } else if (category === 'card') {
        items = getCards();
        storageKey = STORAGE_KEYS.CARDS;
    } else if (category === 'contract') {
        items = getContracts();
        storageKey = STORAGE_KEYS.CONTRACTS;
    }

    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
        items[idx].notes = newNotes;
        items[idx].lastModified = new Date().toISOString();
        saveData(storageKey, items);

        // Show success badge
        const badge = document.getElementById('notes-status-badge');
        badge.style.opacity = '1';
        setTimeout(() => { badge.style.opacity = '0'; }, 3000);

        logActivity('edit', `Notizen für Eintrag ${id} aktualisiert`);

        // Refresh detail view to update timeline
        setTimeout(() => {
            loadAndRenderDetails(id, category);
        }, 1000); // Reload after 1s so user sees the save badge
    }
};

// =========================================================================
// QUICK ACTIONS
// =========================================================================
window.editItemFromDetail = function() {
    sessionStorage.setItem('edit_on_load', sessionStorage.getItem('detail_id'));
    sessionStorage.setItem('edit_category_on_load', sessionStorage.getItem('detail_category'));
    window.location.href = 'index.html';
};

window.deleteItemFromDetail = function() {
    if(confirm('Möchten Sie diesen Eintrag wirklich unwiderruflich löschen?')) {
        const id = sessionStorage.getItem('detail_id');
        const cat = sessionStorage.getItem('detail_category');

        if (cat === 'letter') {
            const data = getLetters().filter(i => i.id !== id);
            saveData(STORAGE_KEYS.LETTERS, data);
        } else if (cat === 'card') {
            const data = getCards().filter(i => i.id !== id);
            saveData(STORAGE_KEYS.CARDS, data);
        } else if (cat === 'contract') {
            const data = getContracts().filter(i => i.id !== id);
            saveData(STORAGE_KEYS.CONTRACTS, data);
        }

        window.deleteAttachment(id); // Fire and forget

        logActivity('delete', `Eintrag ${id} gelöscht`);
        window.location.href = 'index.html';
    }
};
