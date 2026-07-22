document.addEventListener("DOMContentLoaded", () => {

    // DOM-Elemente für Eingabefelder initialisieren
    const wattEingabe = document.getElementById('watt');
    const stundenEingabe = document.getElementById('stunden');
    const preisEingabe = document.getElementById('preis');
    const geraetEingabe = document.getElementById('geraet');

    // DOM-Elemente für die Ergebnisausgabe initialisieren
    const tageskostenEl = document.getElementById('tageskosten');
    const monatskostenEl = document.getElementById('monatskosten');
    const jahreskostenEl = document.getElementById('jahreskosten');
    const jahresVerbrauchEl = document.getElementById('jahres_verbrauch');
    const sparTippEl = document.getElementById('spar-tipp');

    // Hilfsfunktion zur Formatierung von EUR-Währungswerten
    const formatiereEur = (wert) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(wert);

    // Hauptfunktion für die Verbrauchs- und Kostenkalkulation
    function berechneKosten() {
        // Eingabewerte einlesen und validieren (Fallback auf 0)
        const watt = parseFloat(wattEingabe.value) || 0;
        const stunden = parseFloat(stundenEingabe.value) || 0;
        const preisCent = parseFloat(preisEingabe.value) || 0;
        const geraet = geraetEingabe.value || 'Das Gerät';

        // Berechnung des Stromverbrauchs in Kilowattstunden (kWh)
        const kilowatt = watt / 1000;
        const tagesKwh = kilowatt * stunden;
        const jahresKwh = tagesKwh * 365;

        // Kostenkalkulation (Umrechnung von Cent in Euro)
        const preisEuro = preisCent / 100;
        const tageskosten = tagesKwh * preisEuro;
        const monatskosten = tageskosten * 30.416; // Durchschnittliche Tage pro Monat (365 / 12)
        const jahreskosten = tageskosten * 365;

        // Ergebnisse formatiert im DOM ausgeben
        tageskostenEl.innerText = formatiereEur(tageskosten);
        monatskostenEl.innerText = formatiereEur(monatskosten);
        jahreskostenEl.innerText = formatiereEur(jahreskosten);

        // Jährlichen Gesamtverbrauch auf eine Nachkommastelle runden und ausgeben
        jahresVerbrauchEl.innerText = jahresKwh.toLocaleString('de-DE', { maximumFractionDigits: 1 });

        // Dynamischen Energiespartipp basierend auf den jährlichen Kosten erzeugen
        if (jahreskosten > 50) {
            sparTippEl.innerText = `Achtung! ${geraet} verursacht recht hohe Kosten. Etwas weniger Laufzeit am Tag spart direkt Geld.`;
        } else {
            sparTippEl.innerText = `Der Stromverbrauch von ${geraet} ist absolut in Ordnung.`;
        }
    }

    // Event-Listener für automatische Live-Aktualisierung registrieren
    [wattEingabe, stundenEingabe, preisEingabe, geraetEingabe].forEach(feld => {
        feld.addEventListener('input', berechneKosten);
    });

    // Initiale Ausführung beim Laden der Anwendung
    berechneKosten();
});
