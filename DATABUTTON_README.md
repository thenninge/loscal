# Skytebane Kalender - Databutton Deployment

Denne mappen inneholder en komplett Databutton-applikasjon for skytebane-kalenderen.

## 🚀 Deployment til Databutton

### 1. **Forberedelser**
- Sørg for at alle filer er på plass:
  - `app.py` - Flask backend
  - `requirements.txt` - Python dependencies
  - `templates/index.html` - HTML template
  - `static/styles.css` - CSS styling
  - `static/script.js` - JavaScript frontend

### 2. **Databutton Setup**
1. Gå til [databutton.com](https://databutton.com)
2. Opprett nytt prosjekt
3. Last opp alle filer til Databutton
4. Sett miljøvariabler hvis nødvendig

### 3. **API Endpoints**

#### **Aktiviteter**
- `GET /api/activities` - Hent alle aktiviteter
- `POST /api/activities` - Legg til ny aktivitet
- `PUT /api/activities/<id>` - Oppdater aktivitet
- `DELETE /api/activities/<id>` - Slett aktivitet

#### **Duplikater**
- `GET /api/duplicates` - Sjekk for duplikater
- `DELETE /api/duplicates` - Fjern duplikater

#### **Import**
- `POST /api/import/calendar` - Import fra ekstern kalender

### 4. **Database Schema**

```sql
CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    iCalUID TEXT,
    date TEXT NOT NULL,
    dayOfWeek TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    activities TEXT NOT NULL,
    colors TEXT NOT NULL,
    comment TEXT,
    rangeOfficer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Lokal Testing

### Start lokal server:
```bash
python3 app.py
```

### Åpne i nettleser:
```
http://localhost:8000
```

## 📁 Filstruktur

```
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # HTML template
├── static/
│   ├── styles.css        # CSS styling
│   └── script.js         # JavaScript frontend
└── DATABUTTON_README.md  # Denne filen
```

## 🔄 Endringer fra localStorage til API

### **JavaScript endringer:**
- `loadData()` - Nå async, henter fra `/api/activities`
- `saveData()` - Erstattet av individuelle API-kall
- `addNewOpening()` - Bruker POST til `/api/activities`
- `deleteActivity()` - Bruker DELETE til `/api/activities/<id>`
- `checkForDuplicates()` - Bruker GET til `/api/duplicates`
- `removeDuplicates()` - Bruker DELETE til `/api/duplicates`
- `startImport()` - Bruker POST til `/api/import/calendar`

### **Backend funksjonalitet:**
- SQLite database for persistent lagring
- RESTful API endpoints
- Error handling og validering
- CORS support for frontend

## 🎯 Neste Steg

### **Umiddelbar:**
1. Test lokal funksjonalitet
2. Deploy til Databutton
3. Test online funksjonalitet

### **Fremtidig:**
1. Google Calendar API integrasjon
2. iCalUID-basert synkronisering
3. Avansert duplikat-håndtering
4. Bruker-autentisering

## 🐛 Feilsøking

### **Vanlige problemer:**
1. **Database ikke fungerer** - Sjekk at SQLite er installert
2. **API-kall feiler** - Sjekk at server kjører på riktig port
3. **CORS-feil** - Sjekk at static files serveres riktig
4. **Template-feil** - Sjekk at templates/ mappen eksisterer

### **Debug-modus:**
Legg til `?debug` i URL for å aktivere debug-funksjoner.

## 📞 Support

Hvis du støter på problemer:
1. Sjekk console for JavaScript-feil
2. Sjekk server logs for backend-feil
3. Test API-endpoints direkte med curl/Postman
4. Sjekk at alle dependencies er installert

---

**Status**: ✅ Klar for Databutton deployment
**Sist oppdatert**: 8. august 2025 