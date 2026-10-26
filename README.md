# AWO Bremerhaven · Fuhrparkmanagement (Demo)

Eine eigenständige Klick-Demo für das Fuhrparkmanagement der AWO Bremerhaven. Die Anwendung läuft komplett im Browser – ohne Server, ohne Anmeldung und ohne externe Abhängigkeiten.

**Live-Demo:** https://privat-op.github.io/awo-fuhrpark-demo/


## Starten

**Windows:** Doppelklick auf `Demo starten.cmd`.

Alternativ `index.html` direkt im Browser öffnen.

Optional mit lokalem Webserver:

```powershell
cd C:\Users\ianto.beier\awo-fuhrpark-demo
python -m http.server 5500
```

Danach `http://localhost:5500` im Browser aufrufen.

## Funktionen

- **Dashboard** mit Flottenstatus, Auslastung, heutigen Fahrten, Kosten und Handlungsbedarf
- **Fahrzeuge** mit Status, Standort, Führerschein-/TÜV-Daten, Illustrationen und eigenen Fotos
- **Fahrzeugbilder**: JPG/PNG hochladen per Dateiauswahl oder Drag & Drop; automatische Verkleinerung und lokale Speicherung
- **Buchungen**: Wochenkalender, Listenansicht, Fahrtstart/-ende und automatische Konfliktprüfung für Fahrzeug und Fahrer:in
- **Fahrtenbuch** mit Kilometerständen, Distanzen, Monatsfilter und CSV-Export
- **Wartung & TÜV** mit Fälligkeitsstatus, HU/AU-Übersicht, automatischer Kostenübernahme bei Erledigung
- **Kosten** mit Kategorien, Monats-/Fahrzeugauswertung, Donut-Chart sowie **Beleg-Upload** (JPG, PNG oder PDF bis 2 MB)
- **Fahrer:innen** mit Kontaktdaten, Führerscheinklassen und Einsatzstatus
- **Suche** (`Strg + K`), Benachrichtigungen inkl. „als gelesen“-Markierung und Demo-Reset
- Responsive Layout für Desktop, Tablet und Smartphone

## Demo-Daten & Datenschutz

- Alle Daten sind Beispieldaten.
- Änderungen werden ausschließlich im `localStorage` des Browsers gespeichert (Schlüssel: `awo-fuhrpark-demo-v1`).
- Fahrzeugbilder und Belege werden ebenfalls nur lokal abgelegt.
- Über **Einstellungen → Demo zurücksetzen** lassen sich die ursprünglichen Beispieldaten wiederherstellen.
- Diese Anwendung ist ein konzeptioneller Prototyp und nicht für den produktiven Einsatz bestimmt. Bitte keine echten personenbezogenen Daten eintragen.

## Tastenkürzel

| Kürzel | Funktion |
| --- | --- |
| `Strg + K` | Globale Suche öffnen |
| `Esc` | Dialog / Suche schließen |
| `Enter` | Erstes Suchergebnis öffnen |

## Technik

Reines HTML, CSS und JavaScript (ES2020) – keine Build-Tools, keine externen Bibliotheken, keine Netzwerkzugriffe im Betrieb.

Dateien:

- `index.html` – App-Gerüst, Icons und Layout
- `styles.css` – Design-System und responsive Darstellung
- `data.js` – Demo-Daten und Formatierungshelfer
- `views.js` – Seiten, Diagramme und Fahrzeugillustrationen
- `modals.js` – Dialoge, Formulare, Bild- und Belegverarbeitung
- `app.js` – Zustand, Routing, Aktionen und Interaktionen
