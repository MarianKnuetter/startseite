// Client-side PDF Text Extraction & Auto-Fill Parser

const COMMON_PROVIDERS = [
    'Vodafone', 'Telekom', 'O2', 'Telefonica', '1&1', 'Congstar',
    'Netflix', 'Spotify', 'Disney+', 'Amazon Prime', 'Sky', 'DAZN',
    'Allianz', 'DAK', 'Barmer', 'Techniker Krankenkasse', 'TK',
    'Sparkasse', 'DKB', 'N26', 'Commerzbank', 'Deutsche Bank',
    'Vattenfall', 'E.ON', 'Yello', 'Gasag', 'Stadtwerke',
    'ADAC', 'Deutsche Bahn', 'DHL', 'Finanzamt', 'Beitragsservice', 'GEZ',
    'Adobe', 'Microsoft', 'Apple', 'Google'
];

const GERMAN_MONTHS = {
    'jan': 1, 'januar': 1, 'feb': 2, 'februar': 2, 'mär': 3, 'märz': 3,
    'apr': 4, 'april': 4, 'mai': 5, 'jun': 6, 'juni': 6, 'jul': 7, 'juli': 7,
    'aug': 8, 'august': 8, 'sep': 9, 'september': 9, 'okt': 10, 'oktober': 10,
    'nov': 11, 'november': 11, 'dez': 12, 'dezember': 12
};

// Main function to extract text using pdf.js
async function extractTextFromPDF(arrayBuffer) {
    try {
        // Ensure pdf.js is loaded
        const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
        if (!pdfjsLib) {
            throw new Error('PDF.js Bibliothek ist nicht geladen.');
        }

        // Configure worker
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let extractedText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Reconstruct lines sorted by Y coordinate (top to bottom) and X coordinate (left to right)
            const sortedItems = [...textContent.items].sort((a, b) => {
                const yA = a.transform[5];
                const yB = b.transform[5];
                const xA = a.transform[4];
                const xB = b.transform[4];

                // If vertical difference is tiny (e.g. <= 5 units), treat them as same line
                if (Math.abs(yA - yB) <= 5) {
                    return xA - xB;
                }
                return yB - yA; // Top of page down to bottom
            });

            let lastY = -1;
            let pageText = '';

            for (const item of sortedItems) {
                if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
                    pageText += '\n';
                }
                pageText += item.str + ' ';
                lastY = item.transform[5];
            }
            extractedText += pageText + '\n\n';
        }

        return extractedText;
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw error;
    }
}

// Clean up and convert a German or English style currency string to float
function parseAmountString(str) {
    if (!str) return 0;
    let clean = str.replace(/\s/g, '');
    if (clean.includes(',') && clean.includes('.')) {
        // German style: 1.250,50 -> remove dots, replace comma with dot
        clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
        // If there's only a comma, check if it's thousands or decimal
        const parts = clean.split(',');
        if (parts[1].length === 3) {
            // e.g. 1,250 -> 1250
            clean = clean.replace(/,/g, '');
        } else {
            // e.g. 19,99 -> 19.99
            clean = clean.replace(',', '.');
        }
    }
    return parseFloat(clean) || 0;
}

// Heuristics parser
function parseExtractedText(text) {
    const cleanedText = text.replace(/\s+/g, ' ');
    const snippets = [];

    // 1. Determine Category
    let category = 'letter'; // default

    const cardKeywords = ['kreditkarte', 'credit card', 'mastercard', 'visa', 'amex', 'american express', 'kartennummer', 'kreditlimit', 'kartenkonto'];
    const contractKeywords = ['vertrag', 'abonnement', 'kündigungsfrist', 'monatlich', 'monatsbeitrag', 'mindestlaufzeit', 'tarif', 'subscription', 'abo', 'kundenservice'];

    let cardScore = 0;
    let contractScore = 0;

    cardKeywords.forEach(kw => {
        const regex = new RegExp(kw, 'gi');
        const matches = text.match(regex);
        if (matches) cardScore += matches.length;
    });

    contractKeywords.forEach(kw => {
        const regex = new RegExp(kw, 'gi');
        const matches = text.match(regex);
        if (matches) contractScore += matches.length;
    });

    if (cardScore > 0 && cardScore > contractScore) {
        category = 'card';
        snippets.push(`Kategorie-Erkennung: Kreditkarte (Score: ${cardScore})`);
    } else if (contractScore > 0 && contractScore >= cardScore) {
        category = 'contract';
        snippets.push(`Kategorie-Erkennung: Vertrag/Abo (Score: ${contractScore})`);
    } else {
        snippets.push(`Kategorie-Erkennung: Brief/Dokument (Standard)`);
    }

    // 2. Identify Sender/Provider
    let senderOrProvider = '';

    // Check known common list first
    for (const provider of COMMON_PROVIDERS) {
        const regex = new RegExp(`\\b${provider}\\b`, 'i');
        if (regex.test(cleanedText)) {
            senderOrProvider = provider;
            snippets.push(`Anbieter/Absender gefunden: "${provider}"`);
            break;
        }
    }

    // If still empty, look for companies ending in GmbH, AG, etc.
    if (!senderOrProvider) {
        const companyRegex = /([A-ZÄÖÜa-z0-9&\s\-\.]{3,35})\s+(?:GmbH|AG|GbR|Co\.\s*KG|e\.\s*V\.|Inc\.)/g;
        const companyMatch = companyRegex.exec(cleanedText);
        if (companyMatch) {
            senderOrProvider = companyMatch[1].trim();
            snippets.push(`Unternehmen gefunden: "${senderOrProvider}" (via GmbH/AG-Endung)`);
        }
    }

    // Default if not found
    if (!senderOrProvider) {
        senderOrProvider = 'Unbekannter Absender';
    }

    // 3. Find Customer Number / Vertragsnummer
    let customerNumber = '';
    const customerRegex = /(?:kundennummer|kd\.-nr\.|vertragsnummer|account\s*[-–]?\s*id|mitgliedsnummer|vertrags-id|mandatsreferenz)\s*[:\-\s]{1,3}\s*([a-z0-9\-–\/]{4,20})/i;
    const customerMatch = customerRegex.exec(cleanedText);
    if (customerMatch) {
        customerNumber = customerMatch[1].trim();
        snippets.push(`Kundennummer gefunden: "${customerNumber}"`);
    }

    // 4. Find Amount / Cost / Credit Limit
    let amount = 0;
    const amountRegex = /(?:monatlich|preis|betrag|summe|kosten|beitrag|gebühr|zahlung|rechnungsbetrag|kreditlimit|limit)\s*[:\-\s]{0,3}\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:[.,][0-9]{2})?)\s*(?:€|eur|euro)/i;
    const amountMatch = amountRegex.exec(cleanedText);
    if (amountMatch) {
        amount = parseAmountString(amountMatch[1]);
        snippets.push(`Betrag/Limit gefunden: ${amount.toFixed(2)} €`);
    } else {
        // Fallback: search for any Euro amount near keywords
        const generalAmountRegex = /\b([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:[.,][0-9]{2})?)\s*(?:€|eur|euro)/gi;
        const generalMatch = generalAmountRegex.exec(cleanedText);
        if (generalMatch) {
            amount = parseAmountString(generalMatch[1]);
            snippets.push(`Allgemeiner Betrag gefunden: ${amount.toFixed(2)} €`);
        }
    }

    // 5. Parse Dates (Fristen, Kündigung, Kreditkarten-Ablauf)
    const dates = findDatesInText(cleanedText);
    let letterDate = formatDateISO(new Date()); // Default to today's date
    let deadline = '';
    let cancellationDeadline = '';
    let cardExpiryMonth = 12;
    let cardExpiryYear = 2026;

    if (dates.length > 0) {
        // Assume first date found is the document creation date
        letterDate = dates[0].isoString;
        snippets.push(`Briefdatum erkannt: ${dates[0].originalString} (${letterDate})`);

        // Search context for deadlines or cancellation
        dates.forEach(d => {
            const contextStart = Math.max(0, d.index - 50);
            const contextEnd = Math.min(cleanedText.length, d.index + 50);
            const context = cleanedText.substring(contextStart, contextEnd).toLowerCase();

            if (context.includes('frist') || context.includes('fällig') || context.includes('bis zum') || context.includes('spätestens')) {
                if (!deadline && d.isoString !== letterDate) {
                    deadline = d.isoString;
                    snippets.push(`Aktionstermin/Frist erkannt: ${d.originalString} (Kontext: "${context.trim().substring(0, 40)}...")`);
                }
            }

            if (context.includes('kündigung') || context.includes('kündigen') || context.includes('laufzeit') || context.includes('ende')) {
                if (!cancellationDeadline) {
                    cancellationDeadline = d.isoString;
                    snippets.push(`Kündigungsfrist erkannt: ${d.originalString} (Kontext: "${context.trim().substring(0, 40)}...")`);
                }
            }
        });
    }

    // Card expiry month/year matching (e.g. "08/28" or "valid thru 08/28")
    const cardExpiryRegex = /(?:valid\s+thru|expiry|gültig\s+bis|exp\s*\.?|ablaufdatum)?\s*(?<![\d\/\-])\b(\d{2})\s*[\/\-]\s*(\d{2,4})\b(?![\d\/\-])/i;
    const expiryMatch = cardExpiryRegex.exec(cleanedText);
    if (expiryMatch) {
        cardExpiryMonth = parseInt(expiryMatch[1]);
        let yearString = expiryMatch[2];
        cardExpiryYear = yearString.length === 2 ? 2000 + parseInt(yearString) : parseInt(yearString);
        snippets.push(`Karten-Ablaufdatum erkannt: ${cardExpiryMonth.toString().padStart(2, '0')}/${cardExpiryYear}`);
    } else {
        // Look for any 05/28 pattern in text
        const expiryPatternRegex = /(?<![\d\/\-])\b(\d{2})\s*[\/\-]\s*(\d{2})\b(?![\d\/\-])/g;
        let match;
        while ((match = expiryPatternRegex.exec(cleanedText)) !== null) {
            const m = parseInt(match[1]);
            const y = 2000 + parseInt(match[2]);
            if (m >= 1 && m <= 12 && y >= 2024 && y <= 2035) {
                cardExpiryMonth = m;
                cardExpiryYear = y;
                snippets.push(`Mögliches Karten-Ablaufdatum: ${m.toString().padStart(2, '0')}/${y}`);
                break;
            }
        }
    }

    // 6. Build response based on detected category
    let parsedFields = {};
    if (category === 'letter') {
        parsedFields = {
            sender: senderOrProvider,
            date: letterDate,
            status: deadline ? 'action_required' : 'unread',
            deadline: deadline || '',
            notes: `Automatisch importiert aus PDF. Dokument-Text enthält Infos über ${senderOrProvider}.`
        };
    } else if (category === 'card') {
        parsedFields = {
            bank: senderOrProvider === 'Unbekannter Absender' ? 'Hausbank' : senderOrProvider,
            cardName: 'Kreditkarte',
            expiryMonth: cardExpiryMonth,
            expiryYear: cardExpiryYear,
            creditLimit: amount || 2000,
            status: 'active'
        };
    } else if (category === 'contract') {
        parsedFields = {
            provider: senderOrProvider,
            planName: 'Standard Tarif',
            customerNumber: customerNumber,
            monthlyCost: amount || 19.99,
            cancellationDeadline: cancellationDeadline || '',
            status: 'active'
        };
    }

    return {
        category,
        parsedFields,
        snippets,
        rawText: text
    };
}

// Find all dates in a block of text and return their indexes and ISO format
function findDatesInText(text) {
    const dates = [];
    const germanDateRegex = /(\b\d{1,2})\.\s*(\d{1,2}(?=\.)|[A-Za-zäöüÄÖÜß]+)\.?\s*(\d{4}|\d{2})\b/g;

    let match;
    while ((match = germanDateRegex.exec(text)) !== null) {
        const day = parseInt(match[1]);
        const monthPart = match[2].toLowerCase();
        let year = parseInt(match[3]);
        if (year < 100) year += 2000; // handle 26 -> 2026

        let month = 0;
        if (isNaN(monthPart)) {
            // lookup in dictionary
            for (const key in GERMAN_MONTHS) {
                if (monthPart.startsWith(key)) {
                    month = GERMAN_MONTHS[key];
                    break;
                }
            }
        } else {
            month = parseInt(monthPart);
        }

        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
            const dateObj = new Date(year, month - 1, day);
            dates.push({
                originalString: match[0],
                isoString: formatDateISO(dateObj),
                index: match.index
            });
        }
    }

    // Matches standard ISO-like: YYYY-MM-DD
    const isoDateRegex = /\b(\d{4})[\-\/](\d{2})[\-\/](\d{2})\b/g;
    while ((match = isoDateRegex.exec(text)) !== null) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);

        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
            dates.push({
                originalString: match[0],
                isoString: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                index: match.index
            });
        }
    }

    // Sort by position in text
    return dates.sort((a, b) => a.index - b.index);
}

// Utility to format date into YYYY-MM-DD
function formatDateISO(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
