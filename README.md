# Losby Skytterlag Åpningstider

En moderne webapp for å vise åpningstider på Lørenskog Skytterlag med Flask backend og iCal import.

## Funksjoner

- **Liste-visning**: Oversiktlig liste med alle åpningstider
- **Kalender-visning**: Tile view med klikkbare dager
- **Filtrering**: Filtrer på aktivitetstype (Jeger, DFS, Pistol, etc.)
- **Admin-panel**: Legg til nye åpningstider med PIN-kode beskyttelse
- **iCal Import**: Automatisk import fra Google Calendar
- **Responsivt design**: Fungerer på PC, tablet og mobil
- **Dynamiske farger**: Kant-farger som samsvarer med aktivitetsfarger

## Funksjoner

- **Liste-visning**: Oversiktlig liste med alle åpningstider
- **Kalender-visning**: Tile view med klikkbare dager
- **Filtrering**: Filtrer på aktivitetstype (Jaktskyting, DFS, Pistol, etc.)
- **Admin-panel**: Legg til nye åpningstider med PIN-kode beskyttelse
- **Responsivt design**: Fungerer på PC, tablet og mobil

## Aktivitetstyper

- 🎯 **Jeger** (Grønn)
- 🎯 **DFS** (Brun)
- 🎯 **Pistol** (Gul)
- 🎯 **PRS** (Lilla)
- 🎯 **Leirdue** (Rosa)
- 🎯 **Storviltprøve** (Blå)
- 🎯 **Uavklart** (Rød)
- 🎯 **Åpen for alle** (Lys grønn)
- 🎯 **Annet** (Grå)
- 🎯 **100m** (Lys blå)
- 🎯 **200m** (Turkis)

## Kom i gang

### Lokal utvikling
1. Installer Python-avhengigheter: `pip install -r requirements.txt`
2. Start Flask-serveren: `python app.py`
3. Åpne `http://localhost:5000` i en nettleser
4. Appen starter automatisk med liste-visning
5. Bruk knappene øverst for å bytte mellom liste og kalender
6. Klikk på tannhjul-ikonet for admin-panel

### Produksjon
Appen er deployet på Vercel og tilgjengelig på: [https://loscal.vercel.app](https://loscal.vercel.app)

## Admin-funksjoner

- **Standard PIN-kode**: `0406` og `0808`
- Legg til nye åpningstider
- Rediger eksisterende aktiviteter
- Slett aktiviteter
- Import fra Google Calendar (iCal)
- Statistikk over aktiviteter
- Data lagres i SQLite/PostgreSQL database

## Teknisk informasjon

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite (lokalt) / PostgreSQL (Vercel)
- **Import**: iCal fra Google Calendar
- **Deployment**: Vercel
- **Responsivt**: CSS Grid og Flexbox

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

## Bra deploys

### 777378d
Fix filter sync between views: Add filterData() call in toggleView() to ensure filters are applied when switching between list and calendar views.

## Lisens

Fritt tilgjengelig for bruk og modifikasjon. 


