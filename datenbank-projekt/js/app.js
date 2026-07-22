// =============================================================================
// ORGANIZER PRO — Main Application v2.0
// Features: Dark/Light Mode, Calendar View, Notification Bell, Donut Chart,
//           Flip Credit Cards, Tag System, Keyboard Shortcuts, Drag & Drop
// =============================================================================

const SYSTEM_DATE = new Date();

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------------
    // APPLICATION STATE
    // -------------------------------------------------------------------------
    const state = {
        currentRoute: '#/dashboard',
        searchQuery: '',
        activeFormCategory: 'letter',
        activePdfReviewCategory: 'letter',
        editingItemId: null,
        pdfParsedData: null,
        tempAttachmentFile: null,
        attachmentDeleted: false,
        ocrPdfFile: null,
        viewerBlobURL: null,
        calendarDate: new Date(SYSTEM_DATE.getFullYear(), SYSTEM_DATE.getMonth(), 1),
        isDarkMode: true,
        isNotifOpen: false
    };

    // -------------------------------------------------------------------------
    // UI ELEMENT REFERENCES
    // -------------------------------------------------------------------------
    const elements = {
        // Nav
        navDashboard: document.getElementById('nav-dashboard'),
        navLetters: document.getElementById('nav-letters'),
        navCards: document.getElementById('nav-cards'),
        navContracts: document.getElementById('nav-contracts'),
        navCalendar: document.getElementById('nav-calendar'),

        // Views
        viewDashboard: document.getElementById('view-dashboard'),
        viewLetters: document.getElementById('view-letters'),
        viewCards: document.getElementById('view-cards'),
        viewContracts: document.getElementById('view-contracts'),
        viewCalendar: document.getElementById('view-calendar'),

        // Header
        globalSearch: document.getElementById('global-search'),
        btnNotificationBell: document.getElementById('btn-notification-bell'),
        notificationDropdown: document.getElementById('notification-dropdown'),
        notificationCount: document.getElementById('notification-count'),
        notifList: document.getElementById('notif-list'),
        notifCountText: document.getElementById('notif-count-text'),
        btnThemeToggle: document.getElementById('btn-theme-toggle'),
        themeIcon: document.getElementById('theme-icon'),
        btnShortcuts: document.getElementById('btn-shortcuts'),

        // Dashboard
        countActionLetters: document.getElementById('count-action-letters'),
        countExpiringCards: document.getElementById('count-expiring-cards'),
        countUpcomingContracts: document.getElementById('count-upcoming-contracts'),
        totalMonthlyCosts: document.getElementById('total-monthly-costs'),
        dashboardRemindersList: document.getElementById('dashboard-reminders-list'),
        dashboardActivitiesList: document.getElementById('dashboard-activities-list'),
        dashboardGreeting: document.getElementById('dashboard-greeting'),
        dashboardDate: document.getElementById('dashboard-date'),
        dashboardYearlyCost: document.getElementById('dashboard-yearly-cost'),
        donutLegend: document.getElementById('donut-legend'),
        donutCenterValue: document.getElementById('donut-center-value'),

        // Grids
        lettersGrid: document.getElementById('letters-grid'),
        cardsGrid: document.getElementById('cards-grid'),
        contractsGrid: document.getElementById('contracts-grid'),
        contractsTotalCost: document.getElementById('contracts-total-cost'),
        contractsCostBar: document.getElementById('contracts-cost-bar'),
        contractsCostLegend: document.getElementById('contracts-cost-legend'),

        // Filters
        filterLetterStatus: document.getElementById('filter-letter-status'),
        filterLetterDate: document.getElementById('filter-letter-date'),
        filterLetterTag: document.getElementById('filter-letter-tag'),
        filterCardStatus: document.getElementById('filter-card-status'),
        filterContractStatus: document.getElementById('filter-contract-status'),
        filterContractSort: document.getElementById('filter-contract-sort'),

        // Add/Edit Modal
        modalAddEdit: document.getElementById('modal-add-edit'),
        modalAddEditTitle: document.getElementById('modal-add-edit-title'),
        organizerForm: document.getElementById('organizer-form'),
        formItemId: document.getElementById('form-item-id'),
        formItemCategory: document.getElementById('form-item-category'),
        modalCategoryTabs: document.getElementById('modal-category-tabs'),
        btnAddItemModal: document.getElementById('btn-add-item-modal'),
        btnCancelAddModal: document.getElementById('btn-cancel-add-modal'),
        btnCloseAddModal: document.getElementById('btn-close-add-modal'),
        formPdfAttachment: document.getElementById('form-pdf-attachment'),
        btnRemoveAttachment: document.getElementById('btn-remove-attachment'),
        formPdfStatus: document.getElementById('form-pdf-status'),
        fieldsLetter: document.getElementById('fields-letter'),
        fieldsCard: document.getElementById('fields-card'),
        fieldsContract: document.getElementById('fields-contract'),

        // PDF Modals
        pdfFileInput: document.getElementById('pdf-file-input'),
        btnTriggerPdfUpload: document.getElementById('btn-trigger-pdf-upload'),
        modalPdfReview: document.getElementById('modal-pdf-review'),
        pdfCategoryTabs: document.getElementById('pdf-category-tabs'),
        pdfReviewFieldsContainer: document.getElementById('pdf-review-fields-container'),
        pdfSnippetsList: document.getElementById('pdf-snippets-list'),
        btnCancelPdfModal: document.getElementById('btn-cancel-pdf-modal'),
        btnClosePdfModal: document.getElementById('btn-close-pdf-modal'),
        btnSavePdfImport: document.getElementById('btn-save-pdf-import'),

        // Delete Modal
        modalConfirmDelete: document.getElementById('modal-confirm-delete'),
        deleteItemName: document.getElementById('delete-item-name'),
        deleteItemId: document.getElementById('delete-item-id'),
        deleteItemCategory: document.getElementById('delete-item-category'),
        btnConfirmDelete: document.getElementById('btn-confirm-delete'),
        btnCancelDeleteModal: document.getElementById('btn-cancel-delete-modal'),
        btnCloseDeleteModal: document.getElementById('btn-close-delete-modal'),

        // Backup
        btnExportBackup: document.getElementById('btn-export-backup'),
        btnImportBackup: document.getElementById('btn-import-backup'),
        backupFileInput: document.getElementById('backup-file-input'),

        // Attachment Viewer
        modalAttachmentViewer: document.getElementById('modal-attachment-viewer'),
        attachmentViewerTitle: document.getElementById('attachment-viewer-title'),
        attachmentViewerBody: document.getElementById('attachment-viewer-body'),
        btnCloseAttachmentViewer: document.getElementById('btn-close-attachment-viewer'),
        btnDownloadAttachment: document.getElementById('btn-download-attachment'),

        // Shortcuts Modal
        modalShortcuts: document.getElementById('modal-shortcuts'),
        btnCloseShortcuts: document.getElementById('btn-close-shortcuts'),

        // Calendar
        calendarDaysGrid: document.getElementById('calendar-days-grid'),
        calendarMonthTitle: document.getElementById('calendar-month-title'),
        btnCalPrev: document.getElementById('btn-cal-prev'),
        btnCalNext: document.getElementById('btn-cal-next'),
        btnCalToday: document.getElementById('btn-cal-today'),
        calendarUpcomingList: document.getElementById('calendar-upcoming-list'),

        // Drag overlay
        dragOverlay: document.getElementById('drag-overlay'),

        // Nav badges
        navBadgeLetters: document.getElementById('nav-badge-letters'),

        // Mobile FAB
        fabAddBtn: document.getElementById('fab-add-btn'),

        // Toast container
        toastContainer: document.getElementById('toast-container')
    };

    // =========================================================================
    // ROUTING
    // =========================================================================
    function initRouter() {
        const handleHashChange = () => {
            const hash = window.location.hash || '#/dashboard';
            state.currentRoute = hash;

            const navItems = [
                elements.navDashboard,
                elements.navLetters,
                elements.navCards,
                elements.navContracts,
                elements.navCalendar
            ];
            const views = [
                elements.viewDashboard,
                elements.viewLetters,
                elements.viewCards,
                elements.viewContracts,
                elements.viewCalendar
            ];

            navItems.forEach(n => n && n.classList.remove('active'));
            views.forEach(v => v && v.classList.remove('active'));

            if (hash.startsWith('#/letters')) {
                elements.viewLetters.classList.add('active');
                elements.navLetters.classList.add('active');
            } else if (hash.startsWith('#/cards')) {
                elements.viewCards.classList.add('active');
                elements.navCards.classList.add('active');
            } else if (hash.startsWith('#/contracts')) {
                elements.viewContracts.classList.add('active');
                elements.navContracts.classList.add('active');
            } else if (hash.startsWith('#/calendar')) {
                elements.viewCalendar.classList.add('active');
                elements.navCalendar.classList.add('active');
            } else {
                elements.viewDashboard.classList.add('active');
                elements.navDashboard.classList.add('active');
            }

            renderAll();
            // Scroll to top on route change
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
    }

    // =========================================================================
    // THEME TOGGLE (Dark / Light Mode)
    // =========================================================================
    function initTheme() {
        const savedTheme = localStorage.getItem('organizer_theme') || 'dark';
        state.isDarkMode = savedTheme === 'dark';
        applyTheme();
    }

    function applyTheme() {
        if (state.isDarkMode) {
            document.body.classList.remove('light-mode');
            if (elements.themeIcon) elements.themeIcon.setAttribute('data-lucide', 'sun');
        } else {
            document.body.classList.add('light-mode');
            if (elements.themeIcon) elements.themeIcon.setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons();
    }

    function toggleTheme() {
        state.isDarkMode = !state.isDarkMode;
        localStorage.setItem('organizer_theme', state.isDarkMode ? 'dark' : 'light');
        applyTheme();
        showToast(state.isDarkMode ? 'Dunkles Design aktiviert' : 'Helles Design aktiviert', 'info', 2000);
    }

    // =========================================================================
    // NOTIFICATIONS SYSTEM
    // =========================================================================
    function buildNotifications(letters, cards, contracts) {
        const notifications = [];

        letters.forEach(l => {
            if (l.status === 'action_required' && l.deadline) {
                const daysLeft = getDaysLeft(l.deadline);
                if (daysLeft !== null && daysLeft <= 14) {
                    notifications.push({
                        type: 'danger',
                        title: l.sender,
                        text: `Brief-Frist: ${formatDateGerman(l.deadline)} (${daysLeft <= 0 ? 'Überfällig!' : `${daysLeft}d`})`,
                        route: '#/letters'
                    });
                }
            }
        });

        cards.forEach(c => {
            const alertInfo = getCardStatusAlert(c.expiryMonth, c.expiryYear);
            if (alertInfo.alert === 'danger' || alertInfo.alert === 'warning') {
                notifications.push({
                    type: alertInfo.alert,
                    title: `${c.bank} – ${c.cardName}`,
                    text: `Karte: ${alertInfo.label}`,
                    route: '#/cards'
                });
            }
        });

        contracts.forEach(co => {
            if (co.status === 'active' && co.cancellationDeadline) {
                const daysLeft = getDaysLeft(co.cancellationDeadline);
                if (daysLeft !== null && daysLeft <= 30) {
                    notifications.push({
                        type: daysLeft <= 7 ? 'danger' : 'warning',
                        title: `${co.provider}`,
                        text: `Kündigungsfrist: ${formatDateGerman(co.cancellationDeadline)} (${daysLeft <= 0 ? 'Überfällig!' : `${daysLeft}d`})`,
                        route: '#/contracts'
                    });
                }
            }
        });

        return notifications;
    }

    function updateNotificationBell(notifications) {
        const count = notifications.length;

        if (count > 0) {
            elements.notificationCount.textContent = count > 9 ? '9+' : count;
            elements.notificationCount.classList.add('visible');
            elements.btnNotificationBell.classList.add('has-alerts');
        } else {
            elements.notificationCount.classList.remove('visible');
            elements.btnNotificationBell.classList.remove('has-alerts');
        }

        elements.notifCountText.textContent = `${count} aktuell`;

        // Update nav badge for letters
        const letterAlerts = getLetters().filter(l => l.status === 'action_required').length;
        if (letterAlerts > 0 && elements.navBadgeLetters) {
            elements.navBadgeLetters.textContent = letterAlerts;
            elements.navBadgeLetters.style.display = 'block';
        } else if (elements.navBadgeLetters) {
            elements.navBadgeLetters.style.display = 'none';
        }

        if (count === 0) {
            elements.notifList.innerHTML = `
                <div class="notif-empty">
                    <i data-lucide="check-circle" style="width:28px;height:28px;color:var(--color-success);margin-bottom:8px;display:block;"></i>
                    <p>Alles im grünen Bereich!</p>
                </div>
            `;
        } else {
            elements.notifList.innerHTML = notifications.map(n => `
                <div class="notif-item" onclick="window.location.hash='${n.route}'; closeNotifDropdown();">
                    <span class="notif-dot ${n.type}"></span>
                    <div class="notif-text">
                        <strong>${escapeHtml(n.title)}</strong>
                        <p>${escapeHtml(n.text)}</p>
                    </div>
                </div>
            `).join('');
        }

        lucide.createIcons();
    }

    window.closeNotifDropdown = function() {
        elements.notificationDropdown.classList.remove('open');
        state.isNotifOpen = false;
    };

    // =========================================================================
    // DASHBOARD GREETING & DATE
    // =========================================================================
    function updateDashboardGreeting() {
        const hour = SYSTEM_DATE.getHours();
        let greeting = 'Willkommen zurück';
        if (hour >= 5 && hour < 12) greeting = 'Guten Morgen!';
        else if (hour >= 12 && hour < 17) greeting = 'Guten Tag!';
        else if (hour >= 17 && hour < 21) greeting = 'Guten Abend!';
        else greeting = 'Gute Nacht!';

        if (elements.dashboardGreeting) elements.dashboardGreeting.textContent = greeting;
        if (elements.dashboardDate) {
            elements.dashboardDate.textContent = SYSTEM_DATE.toLocaleDateString('de-DE', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
    }

    // =========================================================================
    // DONUT CHART (Canvas-based, no external library)
    // =========================================================================
    const CATEGORY_COLORS = {
        streaming:  'hsl(250, 89%, 65%)',
        internet:   'hsl(190, 90%, 50%)',
        energy:     'hsl(38, 92%, 50%)',
        fitness:    'hsl(320, 80%, 55%)',
        insurance:  'hsl(142, 71%, 45%)',
        miete:      'hsl(0, 84%, 60%)',
        other:      'hsl(215, 15%, 50%)'
    };

    const CATEGORY_LABELS = {
        streaming:  'Streaming & Medien',
        internet:   'Telefon & Internet',
        energy:     'Energie & Strom',
        fitness:    'Fitness & Sport',
        insurance:  'Versicherungen',
        miete:      'Miete & Wohnen',
        other:      'Sonstiges'
    };

    let donutAnimFrame = null;
    let donutSegmentsData = [];

    function renderDonutChart(segments, total) {
        const canvas = document.getElementById('donut-chart-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const size = 160;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        donutSegmentsData = segments;

        if (total === 0) {
            ctx.clearRect(0, 0, size, size);
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2);
            ctx.strokeStyle = 'hsla(223, 20%, 25%, 0.4)';
            ctx.lineWidth = 24;
            ctx.stroke();

            if (elements.donutCenterValue) elements.donutCenterValue.textContent = '0 €';
            if (elements.donutLegend) elements.donutLegend.innerHTML = '<span class="text-muted" style="font-size:0.8rem;">Keine Daten</span>';
            return;
        }

        // Animate with requestAnimationFrame
        if (donutAnimFrame) cancelAnimationFrame(donutAnimFrame);
        let progress = 0;
        const duration = 800;
        const startTime = performance.now();

        function animate(now) {
            progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            ctx.clearRect(0, 0, size, size);

            const cx = size / 2, cy = size / 2;
            const outerR = size / 2 - 8;
            const innerR = size / 2 - 32;

            // Background ring
            ctx.beginPath();
            ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
            ctx.strokeStyle = 'hsla(223, 20%, 20%, 0.3)';
            ctx.lineWidth = 24;
            ctx.stroke();

            let startAngle = -Math.PI / 2;
            segments.forEach(seg => {
                const sweepAngle = (seg.percentage / 100) * Math.PI * 2 * eased;
                ctx.beginPath();
                ctx.arc(cx, cy, outerR, startAngle, startAngle + sweepAngle);
                ctx.strokeStyle = seg.color;
                ctx.lineWidth = 24;
                ctx.lineCap = 'round';
                ctx.stroke();
                startAngle += sweepAngle;
            });

            if (progress < 1) {
                donutAnimFrame = requestAnimationFrame(animate);
            }
        }
        donutAnimFrame = requestAnimationFrame(animate);

        // Update center text
        if (elements.donutCenterValue) {
            elements.donutCenterValue.textContent = total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
        }

        // Update yearly cost
        if (elements.dashboardYearlyCost) {
            const yearly = (total * 12).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            elements.dashboardYearlyCost.textContent = `≈ ${yearly} / Jahr`;
        }

        // Render legend
        if (elements.donutLegend) {
            elements.donutLegend.innerHTML = segments.map(seg => `
                <div class="donut-legend-item" onclick="window.location.hash='#/contracts'">
                    <span class="donut-legend-dot" style="background:${seg.color};"></span>
                    <span class="donut-legend-name">${seg.label}</span>
                    <span class="donut-legend-amount">${seg.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                </div>
            `).join('');
        }
    }

    // =========================================================================
    // ANIMATED COUNTER (Count-up effect for stat cards)
    // =========================================================================
    function animateCounter(element, targetValue, duration = 600, isDecimal = false) {
        if (!element) return;
        const startTime = performance.now();
        const startVal = 0;

        function update(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 2);
            const current = startVal + (targetValue - startVal) * eased;

            if (isDecimal) {
                element.textContent = current.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            } else {
                element.textContent = Math.round(current);
            }

            if (progress < 1) requestAnimationFrame(update);
            else {
                if (isDecimal) {
                    element.textContent = targetValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                } else {
                    element.textContent = targetValue;
                }
            }
        }
        requestAnimationFrame(update);
    }

    // =========================================================================
    // HELPERS: Dates & Alerts
    // =========================================================================
    function getDaysLeft(dateStr) {
        if (!dateStr) return null;
        const targetDate = new Date(dateStr);
        const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const systemMidnight = new Date(SYSTEM_DATE.getFullYear(), SYSTEM_DATE.getMonth(), SYSTEM_DATE.getDate());
        return Math.ceil((targetMidnight - systemMidnight) / (1000 * 60 * 60 * 24));
    }

    function formatDateGerman(dateStr) {
        if (!dateStr) return '-';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }

    function getCardStatusAlert(month, year) {
        const expDate = new Date(year, month, 0);
        const targetMidnight = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
        const systemMidnight = new Date(SYSTEM_DATE.getFullYear(), SYSTEM_DATE.getMonth(), SYSTEM_DATE.getDate());
        const diffDays = Math.ceil((targetMidnight - systemMidnight) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { alert: 'danger', label: 'Abgelaufen', border: 'border-alert-danger' };
        if (diffDays <= 90) return { alert: 'warning', label: `Läuft bald ab (~${Math.ceil(diffDays / 30)} Mon.)`, border: 'border-alert-warning' };
        return { alert: 'success', label: 'Aktiv', border: '' };
    }

    function getDeadlineAlert(dateStr) {
        const daysLeft = getDaysLeft(dateStr);
        if (daysLeft === null) return { level: 'none', label: '', border: '', badge: 'badge-muted' };
        if (daysLeft < 0) return { level: 'danger', label: `Abgelaufen (vor ${Math.abs(daysLeft)} Tagen)`, border: 'border-alert-danger', badge: 'badge-danger' };
        if (daysLeft <= 7) return { level: 'danger', label: `Fällig in ${daysLeft} Tagen!`, border: 'border-alert-danger', badge: 'badge-danger' };
        if (daysLeft <= 30) return { level: 'warning', label: `Fällig in ${daysLeft} Tagen`, border: 'border-alert-warning', badge: 'badge-warning' };
        return { level: 'safe', label: `Fällig am ${formatDateGerman(dateStr)}`, border: '', badge: 'badge-success' };
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // =========================================================================
    // SEARCH HIGHLIGHTING
    // =========================================================================
    function highlightText(text, query) {
        if (!query || query.length < 2) return escapeHtml(text);
        const escaped = escapeHtml(text);
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return escaped.replace(new RegExp(`(${escapedQuery})`, 'gi'), '<mark class="search-highlight">$1</mark>');
    }

    // =========================================================================
    // CONTRACT CATEGORIZATION (for charts)
    // =========================================================================
    function getContractCategory(contract) {
        const text = `${contract.provider} ${contract.planName}`.toLowerCase();
        const cats = {
            streaming:  ['netflix', 'spotify', 'disney', 'prime', 'sky', 'dazn', 'apple tv', 'youtube', 'streaming', 'music', 'video', 'audible', 'deezer', 'rtl+'],
            internet:   ['vodafone', 'telekom', 'o2', 'telefonica', '1&1', 'congstar', 'dsl', 'cable', 'mobil', 'phone', 'internet', 'net', 'sim', 'blau', 'mobilcom', 'drillisch', 'handyvertrag'],
            energy:     ['vattenfall', 'e.on', 'eon', 'yello', 'gasag', 'stadtwerke', 'strom', 'gas', 'energie', 'wasser', 'lichtblick'],
            fitness:    ['mcfit', 'fitx', 'gym', 'fitness', 'sport', 'yoga', 'studio', 'urban sports'],
            insurance:  ['allianz', 'dak', 'barmer', 'techniker', 'versicherung', 'krankenkasse', 'haftpflicht', 'huk', 'axa', 'ergo', 'gez', 'rundfunk', 'beitragsservice', 'lvm', 'gev', 'schufa'],
            miete:      ['kfh', 'mietvertrag', 'miete', 'immobilien', 'wohnung', 'haushalts']
        };

        for (const [key, keywords] of Object.entries(cats)) {
            if (keywords.some(kw => text.includes(kw))) return key;
        }
        return 'other';
    }

    // =========================================================================
    // TAG SYSTEM HELPERS
    // =========================================================================
    const TAG_LABELS = {
        steuer: '🟡 Steuer',
        versicherung: '🟣 Versicherung',
        behoerde: '🔴 Behörde',
        gesundheit: '🟢 Gesundheit',
        wohnen: '🔵 Wohnen',
        arbeit: '🟠 Arbeit'
    };

    function renderTagChip(tag) {
        if (!tag) return '';
        const label = TAG_LABELS[tag] || tag;
        return `<span class="tag-chip tag-${tag}">${label}</span>`;
    }


    // =========================================================================
    // DETAIL PAGE NAVIGATION
    // =========================================================================
    window.openDetailPage = function(id, category) {
        sessionStorage.setItem('detail_id', id);
        sessionStorage.setItem('detail_category', category);
        window.location.href = 'detail.html';
    };

    // =========================================================================
    // RENDER ALL
    // =========================================================================
    function renderAll() {
        const letters = getLetters();
        const cards = getCards();
        const contracts = getContracts();
        const activities = getActivities();

        // Stats
        renderStats(letters, cards, contracts);

        // Cost breakdown (contracts view bar)
        updateContractsCostBreakdown(contracts);

        // Notifications
        const notifications = buildNotifications(letters, cards, contracts);
        updateNotificationBell(notifications);

        // View-specific rendering
        if (state.currentRoute === '#/dashboard' || state.currentRoute === '#/' || !state.currentRoute.includes('/')) {
            renderDashboard(letters, cards, contracts, activities);
        } else if (state.currentRoute.startsWith('#/letters')) {
            renderLettersList(letters);
        } else if (state.currentRoute.startsWith('#/cards')) {
            renderCardsList(cards);
        } else if (state.currentRoute.startsWith('#/contracts')) {
            renderContractsList(contracts);
        } else if (state.currentRoute.startsWith('#/calendar')) {
            renderCalendar(letters, cards, contracts);
        }

        // Init scroll animations
        initScrollAnimations();

        lucide.createIcons();
    }

    // =========================================================================
    // CHECK FOR EDIT REDIRECT FROM DETAIL PAGE
    // =========================================================================
    const editOnLoadId = sessionStorage.getItem('edit_on_load');
    const editOnLoadCat = sessionStorage.getItem('edit_category_on_load');
    if (editOnLoadId && editOnLoadCat) {
        sessionStorage.removeItem('edit_on_load');
        sessionStorage.removeItem('edit_category_on_load');
        setTimeout(() => {
            openEditModal(editOnLoadId, editOnLoadCat);
        }, 300);
    }

    // =========================================================================
    // STATS RENDERING
    // =========================================================================
    function renderStats(letters, cards, contracts) {
        const actionLetters = letters.filter(l => l.status === 'action_required').length;
        animateCounter(elements.countActionLetters, actionLetters);
        elements.countActionLetters.parentElement.parentElement.classList.toggle('border-alert-danger', actionLetters > 0);

        let expiringCardsCount = 0;
        cards.forEach(c => {
            const expAlert = getCardStatusAlert(c.expiryMonth, c.expiryYear);
            if (expAlert.alert === 'danger' || expAlert.alert === 'warning') expiringCardsCount++;
        });
        animateCounter(elements.countExpiringCards, expiringCardsCount);
        elements.countExpiringCards.parentElement.parentElement.classList.toggle('border-alert-warning', expiringCardsCount > 0);

        let expiringContracts = 0;
        contracts.forEach(co => {
            if (co.status === 'active' && co.cancellationDeadline) {
                const daysLeft = getDaysLeft(co.cancellationDeadline);
                if (daysLeft !== null && daysLeft <= 30) expiringContracts++;
            }
        });
        animateCounter(elements.countUpcomingContracts, expiringContracts);
        elements.countUpcomingContracts.parentElement.parentElement.classList.toggle('border-alert-warning', expiringContracts > 0);

        const monthlySum = contracts
            .filter(co => co.status === 'active')
            .reduce((sum, co) => sum + (parseFloat(co.monthlyCost) || 0), 0);

        animateCounter(elements.totalMonthlyCosts, monthlySum, 800, true);
        if (elements.contractsTotalCost) {
            elements.contractsTotalCost.textContent = monthlySum.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
        }
    }

    // =========================================================================
    // DASHBOARD RENDERING
    // =========================================================================
    function renderDashboard(letters, cards, contracts, activities) {
        updateDashboardGreeting();

        // Build donut chart data
        const activeContracts = contracts.filter(co => co.status === 'active');
        const categorySums = {};
        let totalCost = 0;

        activeContracts.forEach(co => {
            const cost = parseFloat(co.monthlyCost) || 0;
            const cat = getContractCategory(co);
            categorySums[cat] = (categorySums[cat] || 0) + cost;
            totalCost += cost;
        });

        const segments = Object.entries(categorySums)
            .filter(([, sum]) => sum > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([key, sum]) => ({
                key,
                label: CATEGORY_LABELS[key] || key,
                color: CATEGORY_COLORS[key] || CATEGORY_COLORS.other,
                amount: sum,
                percentage: totalCost > 0 ? (sum / totalCost) * 100 : 0
            }));

        renderDonutChart(segments, totalCost);

        // Reminders
        const reminders = [];

        letters.forEach(l => {
            if (l.status === 'action_required' && l.deadline) {
                const alertInfo = getDeadlineAlert(l.deadline);
                reminders.push({
                    type: 'letter',
                    name: l.sender,
                    info: `Frist: ${formatDateGerman(l.deadline)}`,
                    daysLeft: getDaysLeft(l.deadline),
                    alertLevel: alertInfo.level,
                    badgeText: 'Brief-Frist',
                    border: alertInfo.border,
                    id: l.id
                });
            }
        });

        cards.forEach(c => {
            const cardAlert = getCardStatusAlert(c.expiryMonth, c.expiryYear);
            if (cardAlert.alert !== 'success') {
                const expDateStr = `${c.expiryYear}-${c.expiryMonth.toString().padStart(2, '0')}-01`;
                reminders.push({
                    type: 'card',
                    name: `${c.bank} – ${c.cardName}`,
                    info: `Karte läuft ab: ${c.expiryMonth.toString().padStart(2, '0')}/${c.expiryYear}`,
                    daysLeft: getDaysLeft(expDateStr),
                    alertLevel: cardAlert.alert,
                    badgeText: cardAlert.label,
                    border: cardAlert.border,
                    id: c.id
                });
            }
        });

        contracts.forEach(co => {
            if (co.status === 'active' && co.cancellationDeadline) {
                const daysLeft = getDaysLeft(co.cancellationDeadline);
                const alertInfo = getDeadlineAlert(co.cancellationDeadline);
                if (daysLeft !== null && daysLeft <= 60) {
                    reminders.push({
                        type: 'contract',
                        name: `${co.provider} (${co.planName})`,
                        info: `Kündigungsfrist: ${formatDateGerman(co.cancellationDeadline)}`,
                        daysLeft,
                        alertLevel: alertInfo.level,
                        badgeText: 'Vertrags-Frist',
                        border: alertInfo.border,
                        id: co.id
                    });
                }
            }
        });

        reminders.sort((a, b) => a.daysLeft - b.daysLeft);

        if (reminders.length === 0) {
            elements.dashboardRemindersList.innerHTML = `<p class="text-muted" style="text-align:center; padding:2.5rem 0; font-size:0.875rem;">✓ Alles im grünen Bereich. Keine kritischen Fristen.</p>`;
        } else {
            elements.dashboardRemindersList.innerHTML = reminders.map(r => {
                const badgeClass = r.alertLevel === 'danger' ? 'badge-danger' : 'badge-warning';
                const route = r.type === 'letter' ? '#/letters' : (r.type === 'card' ? '#/cards' : '#/contracts');
                const typeIcon = r.type === 'letter' ? 'mail' : (r.type === 'card' ? 'credit-card' : 'file-text');
                return `
                    <div class="timeline-item ${r.border}" style="cursor:pointer;" onclick="window.location.hash='${route}'">
                        <div class="timeline-content">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:8px;">
                                <h4 style="font-size:0.875rem; font-weight:600;">${escapeHtml(r.name)}</h4>
                                <span class="badge ${badgeClass}">${r.badgeText}</span>
                            </div>
                            <p class="timeline-desc" style="color:var(--text-secondary);">${r.info}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Activity timeline
        const recentActivities = activities.slice(0, 8);
        if (recentActivities.length === 0) {
            elements.dashboardActivitiesList.innerHTML = `<p class="text-muted" style="text-align:center; padding:2.5rem 0; font-size:0.875rem;">Noch keine Aktivitäten protokolliert.</p>`;
        } else {
            elements.dashboardActivitiesList.innerHTML = recentActivities.map(act => {
                const timeString = new Date(act.timestamp).toLocaleString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                return `
                    <div class="timeline-item" style="padding:0.6rem 0.875rem;">
                        <span class="timeline-icon-dot ${act.type}"></span>
                        <div class="timeline-content">
                            <p class="timeline-desc">${escapeHtml(act.description)}</p>
                            <p class="timeline-time">${timeString}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // =========================================================================
    // LETTERS VIEW
    // =========================================================================
    function renderLettersList(letters) {
        let filtered = letters.filter(l =>
            l.sender.toLowerCase().includes(state.searchQuery) ||
            (l.notes && l.notes.toLowerCase().includes(state.searchQuery)) ||
            (l.tags && l.tags.toLowerCase().includes(state.searchQuery))
        );

        const statusVal = elements.filterLetterStatus.value;
        if (statusVal !== 'all') filtered = filtered.filter(l => l.status === statusVal);

        const tagVal = elements.filterLetterTag ? elements.filterLetterTag.value : 'all';
        if (tagVal !== 'all') filtered = filtered.filter(l => l.tags === tagVal);

        const dateVal = elements.filterLetterDate.value;
        filtered.sort((a, b) => dateVal === 'newest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));

        if (filtered.length === 0) {
            elements.lettersGrid.innerHTML = `
                <div class="glass-card empty-state">
                    <i data-lucide="mail-open"></i>
                    <h3>Keine Briefe gefunden</h3>
                    <p>Erstelle einen neuen Brief oder importiere ein PDF-Dokument.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('btn-add-item-modal').click()">
                        <i data-lucide="plus-circle"></i> Hinzufügen
                    </button>
                </div>
            `;
            return;
        }

        elements.lettersGrid.innerHTML = filtered.map(l => {
            const alertInfo = l.status === 'action_required' && l.deadline ? getDeadlineAlert(l.deadline) : { border: '', level: '' };
            let statusBadge;
            if (l.status === 'read') statusBadge = '<span class="badge badge-success">Gelesen</span>';
            else if (l.status === 'unread') statusBadge = '<span class="badge badge-muted">Ungelesen</span>';
            else statusBadge = '<span class="badge badge-danger">Aktion Erforderlich</span>';

            const notesText = l.notes ? l.notes.substring(0, 120) + (l.notes.length > 120 ? '…' : '') : 'Keine Notizen vorhanden.';

            return `
                <div class="glass-card item-card card-animate ${alertInfo.border}">
                    <div class="card-detail-overlay" onclick="window.openDetailPage('${l.id}', 'letter')">
                        <button class="card-detail-overlay-btn">
                            <i data-lucide="eye"></i> Details ansehen
                        </button>
                    </div>
                    <div>
                        <div class="item-card-header">
                            <div style="flex:1;min-width:0;">
                                <h3 class="item-card-title">${highlightText(l.sender, state.searchQuery)}</h3>
                                <p class="item-card-subtitle">${formatDateGerman(l.date)}</p>
                                ${l.tags ? `<div class="tags-container" style="margin-top:6px;">${renderTagChip(l.tags)}</div>` : ''}
                            </div>
                            <div style="flex-shrink:0;">${statusBadge}</div>
                        </div>
                        <p style="font-size:0.82rem; color:var(--text-secondary); line-height:1.55; margin-bottom:0.875rem; white-space:pre-wrap;">${highlightText(notesText, state.searchQuery)}</p>
                    </div>
                    <div>
                        <div class="item-details-grid">
                            <div>
                                <span class="detail-label">Frist</span>
                                <span class="detail-value ${alertInfo.level === 'danger' ? 'text-danger' : alertInfo.level === 'warning' ? 'text-warning' : ''}">${formatDateGerman(l.deadline)}</span>
                            </div>
                            <div>
                                <span class="detail-label">Status</span>
                                <span class="detail-value">${l.status === 'action_required' ? 'Aktion nötig' : l.status === 'unread' ? 'Ungelesen' : 'Erledigt'}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            ${l.attachmentName ? `
                            <button class="btn btn-secondary btn-pdf-view" style="padding:0.35rem 0.7rem;font-size:0.75rem;" onclick="viewAttachment('${l.id}', '${escapeHtml(l.attachmentName)}')">
                                <i data-lucide="${getAttachmentIcon(l.attachmentName)}" style="width:13px;height:13px;"></i> ${getAttachmentLabel(l.attachmentName)}
                            </button>
                            ` : ''}
                            <button class="btn btn-secondary" style="padding:0.35rem 0.7rem;font-size:0.75rem;" onclick="editItem('${l.id}', 'letter')">
                                <i data-lucide="edit" style="width:13px;height:13px;"></i> Bearbeiten
                            </button>
                            <button class="btn btn-danger" style="padding:0.35rem 0.7rem;font-size:0.75rem;" onclick="triggerDelete('${l.id}', 'letter', '${escapeHtml(l.sender)}')">
                                <i data-lucide="trash-2" style="width:13px;height:13px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // CREDIT CARDS VIEW — FLIP CARDS
    // =========================================================================
    const CARD_GRADIENTS = [
        'card-gradient-1', 'card-gradient-2', 'card-gradient-3',
        'card-gradient-4', 'card-gradient-5', 'card-gradient-6'
    ];

    function getCardGradient(bank, id) {
        const index = (bank.charCodeAt(0) + (id ? id.charCodeAt(id.length - 1) : 0)) % CARD_GRADIENTS.length;
        return CARD_GRADIENTS[index];
    }

    function detectCardNetwork(cardName, bank) {
        const text = `${cardName} ${bank}`.toLowerCase();
        if (text.includes('visa')) return 'VISA';
        if (text.includes('mastercard') || text.includes('master')) return 'MC';
        if (text.includes('amex') || text.includes('american express')) return 'AMEX';
        if (text.includes('girocard') || text.includes('giropluskarte') || text.includes('debitkarte') || text.includes('sparkassen-card')) return 'Girocard';
        return 'CARD';
    }

    function renderCardsList(cards) {
        let filtered = cards.filter(c =>
            c.bank.toLowerCase().includes(state.searchQuery) ||
            c.cardName.toLowerCase().includes(state.searchQuery)
        );

        const statusVal = elements.filterCardStatus.value;
        if (statusVal !== 'all') {
            filtered = filtered.filter(c => {
                const alertInfo = getCardStatusAlert(c.expiryMonth, c.expiryYear);
                if (statusVal === 'expiring_soon') return alertInfo.alert === 'warning';
                if (statusVal === 'expired') return alertInfo.alert === 'danger';
                return c.status === statusVal;
            });
        }

        if (filtered.length === 0) {
            elements.cardsGrid.innerHTML = `
                <div class="glass-card empty-state">
                    <i data-lucide="credit-card"></i>
                    <h3>Keine Kreditkarten gefunden</h3>
                    <p>Füge deine erste Kreditkarte oder Debitkarte hinzu.</p>
                </div>
            `;
            return;
        }

        elements.cardsGrid.innerHTML = filtered.map(c => {
            const alertInfo = getCardStatusAlert(c.expiryMonth, c.expiryYear);
            const isExpired = alertInfo.alert === 'danger';
            const gradient = isExpired ? 'card-gradient-expired' : getCardGradient(c.bank, c.id);
            const network = detectCardNetwork(c.cardName, c.bank);
            const initials = (c.bank || '?').substring(0, 2).toUpperCase();

            let badgeClass = 'badge-success';
            if (alertInfo.alert === 'danger') badgeClass = 'badge-danger';
            if (alertInfo.alert === 'warning') badgeClass = 'badge-warning';

            return `
                <div class="glass-card item-card card-animate ${alertInfo.border}">
                    <!-- Flip Card -->
                    <div class="credit-card-container">
                        <div class="card-detail-overlay" onclick="window.openDetailPage('${c.id}', 'card')">
                            <button class="card-detail-overlay-btn">
                                <i data-lucide="eye"></i> Details ansehen
                            </button>
                        </div>
                        <div class="credit-card-inner">
                            <!-- Front Face -->
                            <div class="card-face card-front ${gradient}">
                                ${isExpired ? '<div class="card-expired-overlay"><span class="card-expired-stamp">ABGELAUFEN</span></div>' : ''}
                                <div class="card-front-top">
                                    <span class="card-bank-name">${escapeHtml(c.bank)}</span>
                                    <span class="card-network-badge">${network}</span>
                                </div>
                                <div class="card-chip"></div>
                                <div class="card-number-row">•••• •••• •••• ••••</div>
                                <div class="card-front-bottom">
                                    <div>
                                        <span class="card-holder-name">${escapeHtml(c.cardName)}</span>
                                    </div>
                                    <div style="text-align:right;">
                                        <span class="card-expiry-label">Gültig bis</span>
                                        <div class="card-expiry-value">${c.expiryMonth.toString().padStart(2, '0')}/${c.expiryYear}</div>
                                    </div>
                                </div>
                            </div>
                            <!-- Back Face -->
                            <div class="card-face card-back ${gradient}">
                                <div class="card-back-stripe"></div>
                                <div style="padding: 0 1rem;">
                                    <span class="card-back-label">Kreditlimit</span>
                                    <div class="card-back-info">${c.creditLimit > 0 ? parseFloat(c.creditLimit).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : 'Kein Limit'}</div>
                                </div>
                                ${c.notes ? `
                                <div style="padding: 0.5rem 1rem 0;">
                                    <span class="card-back-label">Notizen</span>
                                    <div class="card-back-info" style="font-size:0.72rem; line-height:1.3; opacity:0.85;">${escapeHtml(c.notes.substring(0, 80))}</div>
                                </div>` : ''}
                                <div style="padding: 0 1rem; margin-top:auto;">
                                    <span class="card-back-label">Status</span>
                                    <div class="card-back-info">${alertInfo.label}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Card Footer -->
                    <div class="card-item-footer">
                        <div>
                            <span class="badge ${badgeClass}">${alertInfo.label}</span>
                        </div>
                        <div class="item-actions" style="margin-top:0;">
                            ${c.attachmentName ? `
                            <button class="btn btn-secondary btn-pdf-view" style="padding:0.3rem 0.6rem;font-size:0.72rem;" onclick="viewAttachment('${c.id}', '${escapeHtml(c.attachmentName)}')">
                                <i data-lucide="${getAttachmentIcon(c.attachmentName)}" style="width:12px;height:12px;"></i>
                            </button>` : ''}
                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.72rem;" onclick="editItem('${c.id}', 'card')">
                                <i data-lucide="edit" style="width:12px;height:12px;"></i>
                            </button>
                            <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.72rem;" onclick="triggerDelete('${c.id}', 'card', '${escapeHtml(c.bank + ' ' + c.cardName)}')">
                                <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // CONTRACTS VIEW
    // =========================================================================
    function renderContractsList(contracts) {
        let filtered = contracts.filter(co =>
            co.provider.toLowerCase().includes(state.searchQuery) ||
            co.planName.toLowerCase().includes(state.searchQuery) ||
            (co.customerNumber && co.customerNumber.toLowerCase().includes(state.searchQuery))
        );

        const statusVal = elements.filterContractStatus.value;
        if (statusVal !== 'all') filtered = filtered.filter(co => co.status === statusVal);

        const sortVal = elements.filterContractSort.value;
        filtered.sort((a, b) => {
            if (sortVal === 'cost_desc') return parseFloat(b.monthlyCost) - parseFloat(a.monthlyCost);
            if (sortVal === 'cost_asc') return parseFloat(a.monthlyCost) - parseFloat(b.monthlyCost);
            if (sortVal === 'deadline') {
                if (!a.cancellationDeadline) return 1;
                if (!b.cancellationDeadline) return -1;
                return new Date(a.cancellationDeadline) - new Date(b.cancellationDeadline);
            }
            return 0;
        });

        if (filtered.length === 0) {
            elements.contractsGrid.innerHTML = `
                <div class="glass-card empty-state">
                    <i data-lucide="file-text"></i>
                    <h3>Keine Verträge gefunden</h3>
                    <p>Trage deine Verträge und Abonnements ein.</p>
                </div>
            `;
            return;
        }

        elements.contractsGrid.innerHTML = filtered.map(co => {
            const hasAlert = co.status === 'active' && co.cancellationDeadline;
            const alertInfo = hasAlert ? getDeadlineAlert(co.cancellationDeadline) : { border: '', level: '' };
            const cat = getContractCategory(co);
            const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;

            let statusBadge;
            if (co.status === 'active') statusBadge = '<span class="badge badge-success">Aktiv</span>';
            else if (co.status === 'cancelled') statusBadge = '<span class="badge badge-danger">Gekündigt</span>';
            else statusBadge = '<span class="badge badge-muted">Pausiert</span>';

            return `
                <div class="glass-card item-card card-animate ${alertInfo.border}" style="border-left: 3px solid ${catColor};">
                    <div>
                        <div class="item-card-header">
                            <div>
                                <h3 class="item-card-title">${highlightText(co.provider, state.searchQuery)}</h3>
                                <p class="item-card-subtitle">${highlightText(co.planName, state.searchQuery)}</p>
                            </div>
                            <div>${statusBadge}</div>
                        </div>
                        ${co.customerNumber ? `
                        <div style="font-size:0.78rem; margin-bottom:0.75rem;">
                            <span class="detail-label" style="display:inline;">Kundennr.:</span>
                            <span style="font-weight:600;">${highlightText(co.customerNumber, state.searchQuery)}</span>
                        </div>` : ''}
                    </div>
                    <div>
                        <div class="item-details-grid">
                            <div>
                                <span class="detail-label">Kosten/Monat</span>
                                <span class="detail-value text-success" style="font-weight:700;">${parseFloat(co.monthlyCost).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                            </div>
                            <div>
                                <span class="detail-label">Kündigungsfrist</span>
                                <span class="detail-value ${alertInfo.level === 'danger' ? 'text-danger' : alertInfo.level === 'warning' ? 'text-warning' : ''}">${formatDateGerman(co.cancellationDeadline)}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            ${co.attachmentName ? `
                            <button class="btn btn-secondary btn-pdf-view" style="padding:0.35rem 0.7rem;font-size:0.75rem;" onclick="viewAttachment('${co.id}', '${escapeHtml(co.attachmentName)}')">
                                <i data-lucide="${getAttachmentIcon(co.attachmentName)}" style="width:13px;height:13px;"></i> ${getAttachmentLabel(co.attachmentName)}
                            </button>` : ''}
                            <button class="btn btn-secondary" style="padding:0.35rem 0.7rem;font-size:0.75rem;" onclick="editItem('${co.id}', 'contract')">
                                <i data-lucide="edit" style="width:13px;height:13px;"></i> Bearbeiten
                            </button>
                            <button class="btn btn-danger" style="padding:0.35rem 0.7rem;font-size:0.75rem;" onclick="triggerDelete('${co.id}', 'contract', '${escapeHtml(co.provider + ' – ' + co.planName)}')">
                                <i data-lucide="trash-2" style="width:13px;height:13px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // CALENDAR VIEW
    // =========================================================================
    const GERMAN_MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    function renderCalendar(letters, cards, contracts) {
        const year = state.calendarDate.getFullYear();
        const month = state.calendarDate.getMonth();

        if (elements.calendarMonthTitle) {
            elements.calendarMonthTitle.textContent = `${GERMAN_MONTHS[month]} ${year}`;
        }

        // Collect all events
        const events = {};

        function addEvent(dateStr, text, type) {
            if (!dateStr) return;
            if (!events[dateStr]) events[dateStr] = [];
            events[dateStr].push({ text, type });
        }

        letters.forEach(l => {
            if (l.status === 'action_required' && l.deadline) {
                const daysLeft = getDaysLeft(l.deadline);
                addEvent(l.deadline, l.sender, daysLeft !== null && daysLeft <= 7 ? 'danger' : 'warning');
            }
        });

        cards.forEach(c => {
            const expDateStr = `${c.expiryYear}-${c.expiryMonth.toString().padStart(2, '0')}-01`;
            const alertInfo = getCardStatusAlert(c.expiryMonth, c.expiryYear);
            if (alertInfo.alert !== 'success') {
                addEvent(expDateStr, `${c.bank} Karte`, 'primary');
            }
        });

        contracts.forEach(co => {
            if (co.cancellationDeadline) {
                const daysLeft = getDaysLeft(co.cancellationDeadline);
                addEvent(co.cancellationDeadline, co.provider, daysLeft !== null && daysLeft <= 7 ? 'danger' : 'warning');
            }
        });

        // Build calendar grid
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Monday = 0 (adjust Sunday)
        let startDow = firstDay.getDay() - 1;
        if (startDow < 0) startDow = 6;

        const today = new Date();
        const todayStr = today.toISOString().substring(0, 10);

        const days = [];

        // Prev month padding
        for (let i = startDow - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, currentMonth: false });
        }

        // Current month days
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push({ date: new Date(year, month, d), currentMonth: true });
        }

        // Next month padding to complete 6 rows
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            days.push({ date: new Date(year, month + 1, d), currentMonth: false });
        }

        if (elements.calendarDaysGrid) {
            elements.calendarDaysGrid.innerHTML = days.map(({ date, currentMonth }) => {
                const dateStr = date.toISOString().substring(0, 10);
                const isToday = dateStr === todayStr;
                const dayEvents = events[dateStr] || [];
                const maxVisible = 2;
                const visibleEvents = dayEvents.slice(0, maxVisible);
                const moreCount = dayEvents.length - maxVisible;

                return `
                    <div class="calendar-day ${!currentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}">
                        <span class="day-number">${date.getDate()}</span>
                        ${visibleEvents.map(ev => `<div class="cal-event ${ev.type}" title="${escapeHtml(ev.text)}">${escapeHtml(ev.text)}</div>`).join('')}
                        ${moreCount > 0 ? `<span class="cal-more">+${moreCount} weitere</span>` : ''}
                    </div>
                `;
            }).join('');
        }

        // Upcoming list (next 90 days)
        const upcomingEvents = [];
        const now = new Date();
        const maxFuture = new Date();
        maxFuture.setDate(maxFuture.getDate() + 90);

        for (const [dateStr, evList] of Object.entries(events)) {
            const d = new Date(dateStr);
            if (d >= now && d <= maxFuture) {
                evList.forEach(ev => upcomingEvents.push({ dateStr, ...ev }));
            }
        }

        upcomingEvents.sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr));

        if (elements.calendarUpcomingList) {
            if (upcomingEvents.length === 0) {
                elements.calendarUpcomingList.innerHTML = `<div class="glass-card"><p class="text-muted" style="text-align:center;padding:2rem;">Keine Ereignisse in den nächsten 90 Tagen.</p></div>`;
            } else {
                elements.calendarUpcomingList.innerHTML = upcomingEvents.slice(0, 12).map(ev => {
                    const daysLeft = getDaysLeft(ev.dateStr);
                    const urgency = daysLeft !== null && daysLeft <= 7 ? 'danger' : daysLeft !== null && daysLeft <= 14 ? 'warning' : 'success';
                    return `
                        <div class="glass-card card-animate" style="padding:1rem; border-left:3px solid var(--color-${urgency});">
                            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                                <span style="font-weight:600;font-size:0.875rem;">${escapeHtml(ev.text)}</span>
                                <span class="badge badge-${urgency}">${daysLeft !== null && daysLeft <= 0 ? 'Überfällig' : `${daysLeft}d`}</span>
                            </div>
                            <p style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px;">${formatDateGerman(ev.dateStr)}</p>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    // =========================================================================
    // CONTRACTS COST BREAKDOWN (Progress Bar for Contracts View)
    // =========================================================================
    function updateContractsCostBreakdown(contracts) {
        const activeContracts = contracts.filter(co => co.status === 'active');
        const categorySums = {};
        let totalCost = 0;

        activeContracts.forEach(co => {
            const cost = parseFloat(co.monthlyCost) || 0;
            const cat = getContractCategory(co);
            categorySums[cat] = (categorySums[cat] || 0) + cost;
            totalCost += cost;
        });

        if (!elements.contractsCostBar || !elements.contractsCostLegend) return;

        elements.contractsCostBar.innerHTML = '';
        elements.contractsCostLegend.innerHTML = '';

        if (totalCost === 0) {
            elements.contractsCostLegend.innerHTML = '<span class="text-muted">Keine aktiven Verträge.</span>';
            return;
        }

        const segments = Object.entries(categorySums)
            .filter(([, sum]) => sum > 0)
            .sort(([, a], [, b]) => b - a);

        segments.forEach(([key, sum]) => {
            const color = CATEGORY_COLORS[key] || CATEGORY_COLORS.other;
            const pct = (sum / totalCost) * 100;
            const seg = document.createElement('div');
            seg.className = 'progress-segment';
            seg.style.width = `${pct}%`;
            seg.style.backgroundColor = color;
            seg.title = `${CATEGORY_LABELS[key]}: ${sum.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`;
            elements.contractsCostBar.appendChild(seg);

            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;"></span>
                <span>${CATEGORY_LABELS[key] || key}:</span>
                <span style="color:var(--text-primary);font-weight:600;">${sum.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
            `;
            elements.contractsCostLegend.appendChild(item);
        });
    }

    // =========================================================================
    // ADD / EDIT MODAL
    // =========================================================================
    function openAddModal(editingItem = null) {
        state.editingItemId = editingItem ? editingItem.id : null;
        elements.formItemId.value = state.editingItemId || '';

        state.tempAttachmentFile = null;
        state.attachmentDeleted = false;
        elements.formPdfAttachment.value = '';

        if (editingItem) {
            elements.modalAddEditTitle.textContent = 'Eintrag bearbeiten';
            setFormCategory(editingItem.category);
            elements.modalCategoryTabs.style.display = 'none';

            if (editingItem.attachmentName) {
                elements.formPdfStatus.textContent = `Vorhandener Anhang: ${editingItem.attachmentName}`;
                elements.btnRemoveAttachment.style.display = 'inline-flex';
            } else {
                elements.formPdfStatus.textContent = 'Kein Dokument angehängt.';
                elements.btnRemoveAttachment.style.display = 'none';
            }

            if (editingItem.category === 'letter') {
                document.getElementById('letter-sender').value = editingItem.sender || '';
                document.getElementById('letter-date').value = editingItem.date || '';
                document.getElementById('letter-status').value = editingItem.status || 'unread';
                document.getElementById('letter-deadline').value = editingItem.deadline || '';
                document.getElementById('letter-notes').value = editingItem.notes || '';
                const tagsEl = document.getElementById('letter-tags');
                if (tagsEl) tagsEl.value = editingItem.tags || '';
            } else if (editingItem.category === 'card') {
                document.getElementById('card-bank').value = editingItem.bank || '';
                document.getElementById('card-name').value = editingItem.cardName || '';
                document.getElementById('card-expiry-month').value = editingItem.expiryMonth || '';
                document.getElementById('card-expiry-year').value = editingItem.expiryYear || '';
                document.getElementById('card-limit').value = editingItem.creditLimit || '';
                document.getElementById('card-status').value = editingItem.status || 'active';
                const cardNotesEl = document.getElementById('card-notes');
                if (cardNotesEl) cardNotesEl.value = editingItem.notes || '';
            } else if (editingItem.category === 'contract') {
                document.getElementById('contract-provider').value = editingItem.provider || '';
                document.getElementById('contract-plan').value = editingItem.planName || '';
                document.getElementById('contract-customer-num').value = editingItem.customerNumber || '';
                document.getElementById('contract-cost').value = editingItem.monthlyCost || '';
                document.getElementById('contract-deadline').value = editingItem.cancellationDeadline || '';
                document.getElementById('contract-status').value = editingItem.status || 'active';
            }
        } else {
            elements.modalAddEditTitle.textContent = 'Eintrag hinzufügen';
            elements.modalCategoryTabs.style.display = 'flex';
            elements.organizerForm.reset();
            elements.formPdfStatus.textContent = 'Kein Dokument angehängt.';
            elements.btnRemoveAttachment.style.display = 'none';

            const todayStr = SYSTEM_DATE.toISOString().substring(0, 10);
            document.getElementById('letter-date').value = todayStr;
            setFormCategory('letter');
        }

        elements.modalAddEdit.classList.add('active');
    }

    function closeAddModal() {
        elements.modalAddEdit.classList.remove('active');
        state.editingItemId = null;
        elements.organizerForm.reset();
    }

    function setFormCategory(category) {
        state.activeFormCategory = category;
        elements.formItemCategory.value = category;

        document.querySelectorAll('#modal-category-tabs .category-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === category);
        });

        elements.fieldsLetter.style.display = category === 'letter' ? 'block' : 'none';
        elements.fieldsCard.style.display = category === 'card' ? 'block' : 'none';
        elements.fieldsContract.style.display = category === 'contract' ? 'block' : 'none';

        toggleFormValidationRequirements(category);
    }

    function toggleFormValidationRequirements(category) {
        const lSender = document.getElementById('letter-sender');
        const lDate = document.getElementById('letter-date');
        const cBank = document.getElementById('card-bank');
        const cName = document.getElementById('card-name');
        const cMonth = document.getElementById('card-expiry-month');
        const cYear = document.getElementById('card-expiry-year');
        const cLimit = document.getElementById('card-limit');
        const coProvider = document.getElementById('contract-provider');
        const coPlan = document.getElementById('contract-plan');
        const coCost = document.getElementById('contract-cost');

        lSender.required = lDate.required = category === 'letter';
        cBank.required = cName.required = cMonth.required = cYear.required = cLimit.required = category === 'card';
        coProvider.required = coPlan.required = coCost.required = category === 'contract';
    }

    async function submitForm() {
        const cat = state.activeFormCategory;
        const itemId = state.editingItemId;
        let savedItem = null;

        if (cat === 'letter') {
            const letter = {
                id: itemId,
                category: 'letter',
                sender: document.getElementById('letter-sender').value.trim(),
                date: document.getElementById('letter-date').value,
                status: document.getElementById('letter-status').value,
                deadline: document.getElementById('letter-deadline').value || '',
                notes: document.getElementById('letter-notes').value.trim(),
                tags: document.getElementById('letter-tags').value || ''
            };
            if (itemId) {
                const existing = getLetters().find(l => l.id === itemId);
                if (existing && existing.attachmentName && !state.attachmentDeleted) {
                    letter.attachmentName = existing.attachmentName;
                }
            }
            savedItem = saveLetter(letter);
        } else if (cat === 'card') {
            const cardNotesEl = document.getElementById('card-notes');
            const card = {
                id: itemId,
                category: 'card',
                bank: document.getElementById('card-bank').value.trim(),
                cardName: document.getElementById('card-name').value.trim(),
                expiryMonth: parseInt(document.getElementById('card-expiry-month').value),
                expiryYear: parseInt(document.getElementById('card-expiry-year').value),
                creditLimit: parseFloat(document.getElementById('card-limit').value) || 0,
                status: document.getElementById('card-status').value,
                notes: cardNotesEl ? cardNotesEl.value.trim() : ''
            };
            if (itemId) {
                const existing = getCards().find(c => c.id === itemId);
                if (existing && existing.attachmentName && !state.attachmentDeleted) {
                    card.attachmentName = existing.attachmentName;
                }
            }
            savedItem = saveCard(card);
        } else if (cat === 'contract') {
            const contract = {
                id: itemId,
                category: 'contract',
                provider: document.getElementById('contract-provider').value.trim(),
                planName: document.getElementById('contract-plan').value.trim(),
                customerNumber: document.getElementById('contract-customer-num').value.trim(),
                monthlyCost: parseFloat(document.getElementById('contract-cost').value) || 0,
                cancellationDeadline: document.getElementById('contract-deadline').value || '',
                status: document.getElementById('contract-status').value
            };
            if (itemId) {
                const existing = getContracts().find(c => c.id === itemId);
                if (existing && existing.attachmentName && !state.attachmentDeleted) {
                    contract.attachmentName = existing.attachmentName;
                }
            }
            savedItem = saveContract(contract);
        }

        if (savedItem) await handleAttachmentSave(savedItem.id, cat);

        closeAddModal();
        showToast(state.editingItemId ? 'Eintrag aktualisiert!' : 'Eintrag hinzugefügt!', 'success');
        renderAll();
    }

    window.editItem = function(id, category) {
        let item = null;
        if (category === 'letter') item = getLetters().find(l => l.id === id);
        else if (category === 'card') item = getCards().find(c => c.id === id);
        else if (category === 'contract') item = getContracts().find(co => co.id === id);
        if (item) openAddModal(item);
    };

    // =========================================================================
    // DELETE
    // =========================================================================
    window.triggerDelete = function(id, category, name) {
        elements.deleteItemId.value = id;
        elements.deleteItemCategory.value = category;
        elements.deleteItemName.textContent = name;
        elements.modalConfirmDelete.classList.add('active');
    };

    function closeDeleteModal() {
        elements.modalConfirmDelete.classList.remove('active');
    }

    function confirmDelete() {
        const id = elements.deleteItemId.value;
        const category = elements.deleteItemCategory.value;
        deleteItem(id, category);
        closeDeleteModal();
        showToast('Eintrag gelöscht.', 'warning');
        renderAll();
    }

    // =========================================================================
    // PDF UPLOAD & PARSE
    // =========================================================================
    async function handlePdfUpload(e) {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            showToast('Bitte eine gültige PDF-Datei auswählen.', 'error');
            return;
        }

        const originalBtnHTML = elements.btnTriggerPdfUpload.innerHTML;
        elements.btnTriggerPdfUpload.disabled = true;
        elements.btnTriggerPdfUpload.innerHTML = `<i data-lucide="loader" class="animate-spin"></i> <span>Analysiere...</span>`;
        lucide.createIcons();

        try {
            const arrayBuffer = await file.arrayBuffer();
            const rawText = await extractTextFromPDF(arrayBuffer);
            state.pdfParsedData = parseExtractedText(rawText);
            state.ocrPdfFile = file;
            openPdfReviewModal();
        } catch (err) {
            showToast('Fehler beim Einlesen des PDFs: ' + err.message, 'error');
        } finally {
            elements.btnTriggerPdfUpload.disabled = false;
            elements.btnTriggerPdfUpload.innerHTML = originalBtnHTML;
            elements.pdfFileInput.value = '';
            lucide.createIcons();
        }
    }

    function openPdfReviewModal() {
        if (!state.pdfParsedData) return;
        elements.pdfSnippetsList.innerHTML = state.pdfParsedData.snippets.map(s => `<div class="snippet-tag">${escapeHtml(s)}</div>`).join('');
        setPdfReviewCategory(state.pdfParsedData.category);
        elements.modalPdfReview.classList.add('active');
    }

    function closePdfModal() {
        elements.modalPdfReview.classList.remove('active');
        state.pdfParsedData = null;
    }

    function setPdfReviewCategory(category) {
        state.activePdfReviewCategory = category;
        document.querySelectorAll('#pdf-category-tabs .category-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === category);
        });

        const fields = state.pdfParsedData.parsedFields;
        let html = '';

        if (category === 'letter') {
            html = `
                <div class="form-group">
                    <label class="form-label" for="pdf-rev-sender">Absender *</label>
                    <input type="text" id="pdf-rev-sender" class="form-control" value="${escapeHtml(fields.sender || '')}" required>
                </div>
                <div class="form-group row">
                    <div>
                        <label class="form-label" for="pdf-rev-date">Briefdatum *</label>
                        <input type="date" id="pdf-rev-date" class="form-control" value="${fields.date || ''}" required>
                    </div>
                    <div>
                        <label class="form-label" for="pdf-rev-status">Status *</label>
                        <select id="pdf-rev-status" class="form-control">
                            <option value="action_required" ${fields.status === 'action_required' ? 'selected' : ''}>Aktion erforderlich</option>
                            <option value="unread" ${fields.status === 'unread' ? 'selected' : ''}>Ungelesen</option>
                            <option value="read" ${fields.status === 'read' ? 'selected' : ''}>Gelesen</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="pdf-rev-deadline">Aktionsfrist</label>
                    <input type="date" id="pdf-rev-deadline" class="form-control" value="${fields.deadline || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="pdf-rev-tags">Tag</label>
                    <select id="pdf-rev-tags" class="form-control">
                        <option value="">Kein Tag</option>
                        <option value="steuer">🟡 Steuer</option>
                        <option value="versicherung">🟣 Versicherung</option>
                        <option value="behoerde">🔴 Behörde</option>
                        <option value="gesundheit">🟢 Gesundheit</option>
                        <option value="wohnen">🔵 Wohnen</option>
                        <option value="arbeit">🟠 Arbeit</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="pdf-rev-notes">Notizen / Zusammenfassung</label>
                    <textarea id="pdf-rev-notes" class="form-control">${escapeHtml(fields.notes || '')}</textarea>
                </div>
            `;
        } else if (category === 'card') {
            html = `
                <div class="form-group row">
                    <div>
                        <label class="form-label" for="pdf-rev-bank">Bank / Herausgeber *</label>
                        <input type="text" id="pdf-rev-bank" class="form-control" value="${escapeHtml(fields.bank || 'Hausbank')}" required>
                    </div>
                    <div>
                        <label class="form-label" for="pdf-rev-cardName">Kartenname *</label>
                        <input type="text" id="pdf-rev-cardName" class="form-control" value="${escapeHtml(fields.cardName || 'Kreditkarte')}" required>
                    </div>
                </div>
                <div class="form-group row">
                    <div>
                        <label class="form-label" for="pdf-rev-expiryMonth">Ablaufmonat (MM) *</label>
                        <input type="number" id="pdf-rev-expiryMonth" class="form-control" min="1" max="12" value="${fields.expiryMonth || 12}" required>
                    </div>
                    <div>
                        <label class="form-label" for="pdf-rev-expiryYear">Ablaufjahr (YYYY) *</label>
                        <input type="number" id="pdf-rev-expiryYear" class="form-control" min="2024" max="2060" value="${fields.expiryYear || 2026}" required>
                    </div>
                </div>
                <div class="form-group row">
                    <div>
                        <label class="form-label" for="pdf-rev-creditLimit">Kreditlimit (€) *</label>
                        <input type="number" id="pdf-rev-creditLimit" class="form-control" min="0" value="${fields.creditLimit || 0}" required>
                    </div>
                    <div>
                        <label class="form-label" for="pdf-rev-status">Status *</label>
                        <select id="pdf-rev-status" class="form-control">
                            <option value="active">Aktiv</option>
                            <option value="expired">Abgelaufen</option>
                        </select>
                    </div>
                </div>
            `;
        } else if (category === 'contract') {
            html = `
                <div class="form-group row">
                    <div>
                        <label class="form-label" for="pdf-rev-provider">Anbieter / Dienst *</label>
                        <input type="text" id="pdf-rev-provider" class="form-control" value="${escapeHtml(fields.provider || '')}" required>
                    </div>
                    <div>
                        <label class="form-label" for="pdf-rev-planName">Tarifname *</label>
                        <input type="text" id="pdf-rev-planName" class="form-control" value="${escapeHtml(fields.planName || 'Standard Tarif')}" required>
                    </div>
                </div>
                <div class="form-group row">
                    <div>
                        <label class="form-label" for="pdf-rev-customerNumber">Kundennummer</label>
                        <input type="text" id="pdf-rev-customerNumber" class="form-control" value="${escapeHtml(fields.customerNumber || '')}">
                    </div>
                    <div>
                        <label class="form-label" for="pdf-rev-monthlyCost">Monatliche Kosten (€) *</label>
                        <input type="number" step="0.01" id="pdf-rev-monthlyCost" class="form-control" value="${fields.monthlyCost || 0}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="pdf-rev-cancellationDeadline">Kündigungsfrist</label>
                    <input type="date" id="pdf-rev-cancellationDeadline" class="form-control" value="${fields.cancellationDeadline || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="pdf-rev-status">Status *</label>
                    <select id="pdf-rev-status" class="form-control">
                        <option value="active">Aktiv</option>
                        <option value="cancelled">Gekündigt</option>
                    </select>
                </div>
            `;
        }

        elements.pdfReviewFieldsContainer.innerHTML = html;
    }

    async function savePdfImport() {
        const cat = state.activePdfReviewCategory;

        const inputs = elements.pdfReviewFieldsContainer.querySelectorAll('[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--color-danger)';
                isValid = false;
            } else {
                input.style.borderColor = '';
            }
        });

        if (!isValid) {
            showToast('Bitte alle Pflichtfelder ausfüllen.', 'error');
            return;
        }

        let savedItem = null;

        if (cat === 'letter') {
            const tagsEl = document.getElementById('pdf-rev-tags');
            savedItem = saveLetter({
                category: 'letter',
                sender: document.getElementById('pdf-rev-sender').value.trim(),
                date: document.getElementById('pdf-rev-date').value,
                status: document.getElementById('pdf-rev-status').value,
                deadline: document.getElementById('pdf-rev-deadline').value || '',
                notes: document.getElementById('pdf-rev-notes').value.trim(),
                tags: tagsEl ? tagsEl.value : ''
            });
        } else if (cat === 'card') {
            savedItem = saveCard({
                category: 'card',
                bank: document.getElementById('pdf-rev-bank').value.trim(),
                cardName: document.getElementById('pdf-rev-cardName').value.trim(),
                expiryMonth: parseInt(document.getElementById('pdf-rev-expiryMonth').value),
                expiryYear: parseInt(document.getElementById('pdf-rev-expiryYear').value),
                creditLimit: parseFloat(document.getElementById('pdf-rev-creditLimit').value) || 0,
                status: document.getElementById('pdf-rev-status').value
            });
        } else if (cat === 'contract') {
            savedItem = saveContract({
                category: 'contract',
                provider: document.getElementById('pdf-rev-provider').value.trim(),
                planName: document.getElementById('pdf-rev-planName').value.trim(),
                customerNumber: document.getElementById('pdf-rev-customerNumber').value.trim(),
                monthlyCost: parseFloat(document.getElementById('pdf-rev-monthlyCost').value) || 0,
                cancellationDeadline: document.getElementById('pdf-rev-cancellationDeadline').value || '',
                status: document.getElementById('pdf-rev-status').value
            });
        }

        if (savedItem && state.ocrPdfFile) {
            try {
                const arrayBuffer = await state.ocrPdfFile.arrayBuffer();
                await savePDFAttachment(savedItem.id, arrayBuffer);
                updateItemAttachmentMetadata(savedItem.id, cat, state.ocrPdfFile.name);
            } catch (err) {
                console.error('Fehler beim Auto-Speichern des PDF:', err);
            }
        }

        addActivity('import', cat, 'PDF Import', 'Eintrag per PDF-Import hinzugefügt.');
        closePdfModal();
        state.ocrPdfFile = null;
        showToast('PDF erfolgreich importiert!', 'success');
        renderAll();
    }

    // =========================================================================
    // ATTACHMENT SAVE HELPERS
    // =========================================================================
    async function handleAttachmentSave(itemId, category) {
        if (state.attachmentDeleted) {
            await deletePDFAttachment(itemId);
            removeItemAttachmentMetadata(itemId, category);
        }
        if (state.tempAttachmentFile) {
            try {
                const arrayBuffer = await state.tempAttachmentFile.arrayBuffer();
                await savePDFAttachment(itemId, arrayBuffer);
                updateItemAttachmentMetadata(itemId, category, state.tempAttachmentFile.name);
                showToast(`Anhang "${state.tempAttachmentFile.name}" gespeichert.`, 'success');
            } catch (err) {
                console.error('Fehler beim Speichern des Anhangs:', err);
                showToast('Anhang konnte nicht gespeichert werden.', 'error');
            }
        }
    }

    function updateItemAttachmentMetadata(itemId, category, filename) {
        if (category === 'letter') {
            const letters = getLetters();
            const index = letters.findIndex(l => l.id === itemId);
            if (index !== -1) { letters[index].attachmentName = filename; saveData(STORAGE_KEYS.LETTERS, letters); }
        } else if (category === 'card') {
            const cards = getCards();
            const index = cards.findIndex(c => c.id === itemId);
            if (index !== -1) { cards[index].attachmentName = filename; saveData(STORAGE_KEYS.CARDS, cards); }
        } else if (category === 'contract') {
            const contracts = getContracts();
            const index = contracts.findIndex(co => co.id === itemId);
            if (index !== -1) { contracts[index].attachmentName = filename; saveData(STORAGE_KEYS.CONTRACTS, contracts); }
        }
    }

    // =========================================================================
    // ATTACHMENT FILE HELPERS
    // =========================================================================
    function getFileMimeType(filename) {
        if (!filename) return 'application/octet-stream';
        const ext = filename.split('.').pop().toLowerCase();
        const mimeMap = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
        return mimeMap[ext] || 'application/octet-stream';
    }

    function isImageFile(filename) { return /\.(jpg|jpeg|png|webp)$/i.test(filename || ''); }
    function getAttachmentIcon(filename) { return isImageFile(filename) ? 'image' : 'file-text'; }
    function getAttachmentLabel(filename) { return isImageFile(filename) ? 'Bild' : 'PDF'; }

    window.viewAttachment = async function(id, filename) {
        try {
            const data = await getPDFAttachment(id);
            if (!data) { showToast('Datei nicht in der Datenbank gefunden.', 'error'); return; }

            if (state.viewerBlobURL) { URL.revokeObjectURL(state.viewerBlobURL); state.viewerBlobURL = null; }

            const blob = new Blob([data], { type: getFileMimeType(filename) });
            const blobURL = URL.createObjectURL(blob);
            state.viewerBlobURL = blobURL;

            elements.attachmentViewerTitle.textContent = filename;
            elements.btnDownloadAttachment.onclick = () => {
                const a = document.createElement('a');
                a.href = blobURL; a.download = filename;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                showToast(`"${filename}" wird heruntergeladen.`, 'info');
            };

            if (isImageFile(filename)) {
                elements.attachmentViewerBody.innerHTML = `<img src="${blobURL}" alt="${escapeHtml(filename)}" id="viewer-img" />`;
                document.getElementById('viewer-img').addEventListener('click', e => e.target.classList.toggle('zoomed'));
            } else {
                elements.attachmentViewerBody.innerHTML = `<embed src="${blobURL}" type="application/pdf" />`;
            }

            elements.modalAttachmentViewer.classList.add('active');
            lucide.createIcons();
        } catch (err) {
            showToast('Anhang konnte nicht geladen werden.', 'error');
        }
    };

    function closeAttachmentViewer() {
        elements.modalAttachmentViewer.classList.remove('active');
        elements.attachmentViewerBody.innerHTML = '';
        if (state.viewerBlobURL) { URL.revokeObjectURL(state.viewerBlobURL); state.viewerBlobURL = null; }
    }

    // =========================================================================
    // TOAST NOTIFICATIONS
    // =========================================================================
    function showToast(message, type = 'info', duration = 3500) {
        const icons = { success: 'check-circle', error: 'x-circle', info: 'info', warning: 'alert-triangle' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon"><i data-lucide="${icons[type] || 'info'}" style="width:16px;height:16px;"></i></div>
            <span class="toast-message">${escapeHtml(message)}</span>
        `;
        elements.toastContainer.appendChild(toast);
        lucide.createIcons({ el: toast });

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 350);
        }, duration);
    }

    // =========================================================================
    // ANIMATE ON SCROLL (IntersectionObserver)
    // =========================================================================
    let observer = null;

    function initScrollAnimations() {
        if (observer) observer.disconnect();
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

        document.querySelectorAll('.card-animate:not(.visible)').forEach(el => observer.observe(el));
    }

    // =========================================================================
    // DRAG & DROP PDF
    // =========================================================================
    function initDragDrop() {
        const overlay = elements.dragOverlay;
        let dragCounter = 0;

        document.addEventListener('dragenter', (e) => {
            if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
                dragCounter++;
                overlay.classList.add('active');
            }
        });

        document.addEventListener('dragleave', () => {
            dragCounter--;
            if (dragCounter <= 0) {
                dragCounter = 0;
                overlay.classList.remove('active');
            }
        });

        document.addEventListener('dragover', (e) => e.preventDefault());

        document.addEventListener('drop', async (e) => {
            e.preventDefault();
            dragCounter = 0;
            overlay.classList.remove('active');

            const file = e.dataTransfer.files[0];
            if (!file) return;

            if (file.type === 'application/pdf') {
                // Simulate PDF file input
                const dt = new DataTransfer();
                dt.items.add(file);
                elements.pdfFileInput.files = dt.files;
                handlePdfUpload({ target: { files: [file] } });
            } else {
                showToast('Bitte nur PDF-Dateien ablegen.', 'warning');
            }
        });
    }

    // =========================================================================
    // KEYBOARD SHORTCUTS
    // =========================================================================
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't fire shortcuts when typing in inputs
            const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

            // ESC closes any open modal
            if (e.key === 'Escape') {
                if (elements.modalAttachmentViewer.classList.contains('active')) { closeAttachmentViewer(); return; }
                if (elements.modalAddEdit.classList.contains('active')) { closeAddModal(); return; }
                if (elements.modalPdfReview.classList.contains('active')) { closePdfModal(); return; }
                if (elements.modalConfirmDelete.classList.contains('active')) { closeDeleteModal(); return; }
                if (elements.modalShortcuts.classList.contains('active')) { elements.modalShortcuts.classList.remove('active'); return; }
                if (state.isNotifOpen) { closeNotifDropdown(); return; }
            }

            if (isInInput) return;

            // Ctrl+K — Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                elements.globalSearch.focus();
                elements.globalSearch.select();
                return;
            }

            switch(e.key) {
                case '?':
                    elements.modalShortcuts.classList.toggle('active');
                    break;
                case 'n': case 'N':
                    openAddModal();
                    break;
                case 't': case 'T':
                    toggleTheme();
                    break;
                case '1':
                    window.location.hash = '#/dashboard';
                    break;
                case '2':
                    window.location.hash = '#/letters';
                    break;
                case '3':
                    window.location.hash = '#/cards';
                    break;
                case '4':
                    window.location.hash = '#/contracts';
                    break;
                case '5':
                    window.location.hash = '#/calendar';
                    break;
            }
        });
    }

    // =========================================================================
    // EVENT LISTENERS
    // =========================================================================
    function initEventListeners() {
        // Global Search
        elements.globalSearch.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.toLowerCase();
            renderAll();
        });

        // Ctrl+K hint
        elements.globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                elements.globalSearch.blur();
                state.searchQuery = '';
                elements.globalSearch.value = '';
                renderAll();
            }
        });

        // Add Modal Triggers
        elements.btnAddItemModal.addEventListener('click', () => openAddModal());
        elements.btnCancelAddModal.addEventListener('click', () => closeAddModal());
        elements.btnCloseAddModal.addEventListener('click', () => closeAddModal());

        if (elements.fabAddBtn) {
            elements.fabAddBtn.addEventListener('click', () => openAddModal());
        }

        // Category Tabs in Add Modal
        elements.modalCategoryTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-tab-btn');
            if (btn) setFormCategory(btn.dataset.cat);
        });

        // Form Submit
        elements.organizerForm.addEventListener('submit', (e) => { e.preventDefault(); submitForm(); });

        // Overlay click closes modal
        elements.modalAddEdit.addEventListener('click', (e) => { if (e.target === elements.modalAddEdit) closeAddModal(); });
        elements.modalConfirmDelete.addEventListener('click', (e) => { if (e.target === elements.modalConfirmDelete) closeDeleteModal(); });
        elements.modalPdfReview.addEventListener('click', (e) => { if (e.target === elements.modalPdfReview) closePdfModal(); });
        elements.modalShortcuts.addEventListener('click', (e) => { if (e.target === elements.modalShortcuts) elements.modalShortcuts.classList.remove('active'); });

        // Delete Modal
        elements.btnCancelDeleteModal.addEventListener('click', () => closeDeleteModal());
        elements.btnCloseDeleteModal.addEventListener('click', () => closeDeleteModal());
        elements.btnConfirmDelete.addEventListener('click', () => confirmDelete());

        // PDF Upload
        elements.pdfFileInput.addEventListener('change', (e) => handlePdfUpload(e));
        elements.pdfCategoryTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-tab-btn');
            if (btn) setPdfReviewCategory(btn.dataset.cat);
        });
        elements.btnCancelPdfModal.addEventListener('click', () => closePdfModal());
        elements.btnClosePdfModal.addEventListener('click', () => closePdfModal());
        elements.btnSavePdfImport.addEventListener('click', () => savePdfImport());

        // Form Attachment
        elements.formPdfAttachment.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    showToast('Bitte PDF oder Bilddatei (JPG, PNG) auswählen.', 'error');
                    elements.formPdfAttachment.value = '';
                    return;
                }
                state.tempAttachmentFile = file;
                state.attachmentDeleted = false;
                elements.formPdfStatus.textContent = `Ausgewählt: ${file.name}`;
                elements.btnRemoveAttachment.style.display = 'inline-flex';
            }
        });

        elements.btnRemoveAttachment.addEventListener('click', () => {
            state.tempAttachmentFile = null;
            state.attachmentDeleted = true;
            elements.formPdfAttachment.value = '';
            elements.formPdfStatus.textContent = 'Anhang wird beim Speichern entfernt.';
            elements.btnRemoveAttachment.style.display = 'none';
        });

        // Attachment Viewer
        if (elements.btnCloseAttachmentViewer) {
            elements.btnCloseAttachmentViewer.addEventListener('click', () => closeAttachmentViewer());
        }
        if (elements.modalAttachmentViewer) {
            elements.modalAttachmentViewer.addEventListener('click', (e) => {
                if (e.target === elements.modalAttachmentViewer) closeAttachmentViewer();
            });
        }

        // Shortcuts Modal
        if (elements.btnShortcuts) {
            elements.btnShortcuts.addEventListener('click', () => elements.modalShortcuts.classList.toggle('active'));
        }
        if (elements.btnCloseShortcuts) {
            elements.btnCloseShortcuts.addEventListener('click', () => elements.modalShortcuts.classList.remove('active'));
        }

        // Theme Toggle
        if (elements.btnThemeToggle) {
            elements.btnThemeToggle.addEventListener('click', () => toggleTheme());
        }

        // Notification Bell
        if (elements.btnNotificationBell) {
            elements.btnNotificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                state.isNotifOpen = !state.isNotifOpen;
                elements.notificationDropdown.classList.toggle('open', state.isNotifOpen);
            });
        }

        // Click outside closes notification dropdown
        document.addEventListener('click', (e) => {
            if (state.isNotifOpen && !elements.notificationDropdown.contains(e.target) && e.target !== elements.btnNotificationBell) {
                closeNotifDropdown();
            }
        });

        // Notification footer link
        const notifGotoCalendar = document.getElementById('notif-goto-calendar');
        if (notifGotoCalendar) {
            notifGotoCalendar.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = '#/calendar';
                closeNotifDropdown();
            });
        }

        // Calendar navigation
        if (elements.btnCalPrev) {
            elements.btnCalPrev.addEventListener('click', () => {
                state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
                renderCalendar(getLetters(), getCards(), getContracts());
                lucide.createIcons();
            });
        }

        if (elements.btnCalNext) {
            elements.btnCalNext.addEventListener('click', () => {
                state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
                renderCalendar(getLetters(), getCards(), getContracts());
                lucide.createIcons();
            });
        }

        if (elements.btnCalToday) {
            elements.btnCalToday.addEventListener('click', () => {
                state.calendarDate = new Date(SYSTEM_DATE.getFullYear(), SYSTEM_DATE.getMonth(), 1);
                renderCalendar(getLetters(), getCards(), getContracts());
                lucide.createIcons();
            });
        }

        // Filters
        [
            elements.filterLetterStatus, elements.filterLetterDate, elements.filterLetterTag,
            elements.filterCardStatus,
            elements.filterContractStatus, elements.filterContractSort
        ].forEach(filter => {
            if (filter) filter.addEventListener('change', () => renderAll());
        });

        // Backup Export
        if (elements.btnExportBackup) {
            elements.btnExportBackup.addEventListener('click', async () => {
                const orig = elements.btnExportBackup.innerHTML;
                elements.btnExportBackup.disabled = true;
                elements.btnExportBackup.innerHTML = `<i data-lucide="loader" class="animate-spin"></i> <span>Exportiere...</span>`;
                lucide.createIcons();

                try {
                    const jsonString = await exportBackupData();
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const blobURL = URL.createObjectURL(blob);
                    const dateStr = new Date().toISOString().substring(0, 10);
                    const a = document.createElement('a');
                    a.href = blobURL;
                    a.download = `organizer_backup_${dateStr}.json`;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    URL.revokeObjectURL(blobURL);
                    addActivity('import', 'system', 'Backup Export', 'Backup exportiert.');
                    showToast('Backup erfolgreich exportiert!', 'success');
                    renderAll();
                } catch (err) {
                    showToast('Fehler beim Exportieren: ' + err.message, 'error');
                } finally {
                    elements.btnExportBackup.disabled = false;
                    elements.btnExportBackup.innerHTML = orig;
                    lucide.createIcons();
                }
            });
        }

        // Backup Import
        if (elements.btnImportBackup && elements.backupFileInput) {
            elements.btnImportBackup.addEventListener('click', () => elements.backupFileInput.click());
            elements.backupFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (!file.name.endsWith('.json')) {
                    showToast('Bitte eine gültige JSON-Backup-Datei auswählen.', 'error');
                    elements.backupFileInput.value = '';
                    return;
                }

                if (!confirm('Beim Importieren werden alle aktuellen Daten ersetzt. Fortfahren?')) {
                    elements.backupFileInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        await importBackupData(event.target.result);
                        showToast('Backup erfolgreich importiert!', 'success');
                        renderAll();
                    } catch (err) {
                        showToast('Fehler beim Importieren: ' + err.message, 'error');
                    } finally {
                        elements.backupFileInput.value = '';
                    }
                };
                reader.readAsText(file);
            });
        }
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    initTheme();
    initKeyboardShortcuts();
    initDragDrop();
    initRouter();
    initEventListeners();

    // Show welcome toast
    setTimeout(() => {
        showToast('Organizer Pro v2.0 geladen! Drücke ? für Shortcuts.', 'info', 4000);

        // CHECK FOR EDIT REDIRECT FROM DETAIL PAGE
        const editOnLoadId = sessionStorage.getItem('edit_on_load');
        const editOnLoadCat = sessionStorage.getItem('edit_category_on_load');
        if (editOnLoadId && editOnLoadCat) {
            sessionStorage.removeItem('edit_on_load');
            sessionStorage.removeItem('edit_category_on_load');

            let itemToEdit = null;
            if (editOnLoadCat === 'letter') {
                itemToEdit = getLetters().find(l => l.id === editOnLoadId);
            } else if (editOnLoadCat === 'card') {
                itemToEdit = getCards().find(c => c.id === editOnLoadId);
            } else if (editOnLoadCat === 'contract') {
                itemToEdit = getContracts().find(c => c.id === editOnLoadId);
            }

            if (itemToEdit) {
                openAddModal(itemToEdit);
            }
        }
    }, 800);
});
