# Skytebane Kalender

En enkel og oversiktlig webapp for å vise åpningstider på en skytebane.

## Funksjoner

- **Liste-visning**: Oversiktlig liste med alle åpningstider
- **Kalender-visning**: Tile view med klikkbare dager
- **Filtrering**: Filtrer på aktivitetstype (Jaktskyting, DFS, Pistol, etc.)
- **Admin-panel**: Legg til nye åpningstider med PIN-kode beskyttelse
- **Responsivt design**: Fungerer på PC, tablet og mobil

## Aktivitetstyper

- 🎯 **Jaktskyting** (Blå)
- 🎯 **DFS** (Grønn)
- 🎯 **Pistol** (Gul)
- 🎯 **Oppskyting** (Rød)
- 🎯 **Stevne** (Lilla)
- 🎯 **Annet** (Grå)

## Kom i gang

1. Åpne `index.html` i en nettleser
2. Appen starter automatisk med liste-visning
3. Bruk knappene øverst for å bytte mellom liste og kalender
4. Klikk på tannhjul-ikonet for admin-panel

## Admin-funksjoner

- **Standard PIN-kode**: `1234`
- Legg til nye åpningstider
- Alle data lagres lokalt i nettleseren
- PIN-kode kan endres i koden

## Teknisk informasjon

- **Teknologi**: Vanilla HTML, CSS, JavaScript
- **Lagring**: LocalStorage (enkel database-port)
- **Responsivt**: CSS Grid og Flexbox
- **Ingen avhengigheter**: Fungerer overalt

## Database-port

For å koble på en ekstern database senere:

1. Erstatt `localStorage` funksjonene i `script.js`
2. Implementer API-kall til backend
3. Behold samme data-struktur

## Data-struktur

```javascript
{
  id: string,
  date: 'YYYY-MM-DD',
  dayOfWeek: string,
  startTime: 'HH:MM',
  endTime: 'HH:MM',
  activities: string[],
  colors: string[],
  comment: string,
  rangeOfficer: string
}
```

## Utvikling

- Åpne filene i en kode-editor
- Endre `adminPin` i `script.js` for å sette ny PIN
- Legg til flere aktivitetstyper ved å oppdatere arrays og CSS
- Test på ulike enheter for responsivitet

## Scraping-funksjonalitet

For fremtidig implementering av scraping fra eksterne kalendere:

1. Legg til backend (Python/Node.js)
2. Implementer web scraping med biblioteker som:
   - Python: `requests`, `beautifulsoup4`
   - Node.js: `puppeteer`, `cheerio`
3. Lag API-endepunkter for å importere data
4. Oppdater frontend for å håndtere import

## Lisens

Fritt tilgjengelig for bruk og modifikasjon. 
### v1.1-admin-mode-klikkbare-aktiviteter (2025-08-07-2328)
**Status**: 🔄 Under utvikling

**Endringer:**
- 🔄 admin-mode-klikkbare-aktiviteter

**Filer:**
- `v1.1-admin-mode-klikkbare-aktiviteter.html`
- `v1.1-admin-mode-klikkbare-aktiviteter.css`
- `v1.1-admin-mode-klikkbare-aktiviteter.js`


### v1.1-perfekt-version-med-alle-funksjoner (2025-08-07-2343)
**Status**: 🔄 Under utvikling

**Endringer:**
- 🔄 perfekt-version-med-alle-funksjoner

**Filer:**
- `v1.1-perfekt-version-med-alle-funksjoner.html`
- `v1.1-perfekt-version-med-alle-funksjoner.css`
- `v1.1-perfekt-version-med-alle-funksjoner.js`

