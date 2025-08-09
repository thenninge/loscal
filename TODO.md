# TODO - Losby Skytterlag Åpningstider

## 🚀 Fremtidige Forbedringer

### 1. **iCalUID-basert Synkronisering**
**Prioritet:** Høy  
**Beskrivelse:** Bruk unik ID fra ekstern kalender for smart synkronisering

#### Funksjonalitet:
- Lagre `iCalUID` fra Google Calendar events
- Sjekk for oppdateringer i ekstern kalender
- Automatisk oppdatering når "Uavklart" vakter blir besatt
- Unngå duplikater basert på samme event
- Smart konflikthåndtering

#### Teknisk:
```javascript
// Eksempel struktur:
const activity = {
    id: 'local-id',
    iCalUID: 'google-calendar-unique-id',
    date: '2025-08-08',
    // ... andre felter
};

// Synkroniseringslogikk:
function syncWithExternalCalendar() {
    // Hent ny data
    // Sammenlign med eksisterende basert på iCalUID
    // Oppdater endringer
    // Legg til nye events
}
```

---

### 2. **Tidsbestemt Kategorisering**
**Prioritet:** Medium  
**Beskrivelse:** Bruk faste ukeprogrammer for bedre kategorisering av importert kalender

#### Funksjonalitet:
- Definer faste aktiviteter per ukedag
- Styrk kategorisering basert på ukedag + nøkkelord
- Reduser "Annet" kategorien
- Forbedre nøyaktighet av import

#### Eksempel ukeprogram:
```javascript
const weeklySchedule = {
    'monday': ['Jaktskyting', 'DFS'],
    'tuesday': ['Pistol', 'Storviltprøve'],
    'wednesday': ['Jaktskyting', 'Stevne'],
    'thursday': ['DFS', 'Pistol'],
    'friday': ['Jaktskyting', 'Åpen for alle'],
    'saturday': ['Stevne', 'Storviltprøve'],
    'sunday': ['Jaktskyting', 'DFS']
};
```

#### Implementering:
- Legg til ukedag i `determineActivityType()` funksjonen
- Kombiner ukedag + nøkkelord for bedre treff
- Fallback til nøkkelord hvis ukedag ikke matcher

---

## 📋 Andre Mulige Forbedringer

### 3. **PIN-kode Sikkerhet**
- Re-implementer PIN-kode beskyttelse
- Konfigurerbar PIN-kode
- Session management

### 4. **Databutton Deployment**
- Erstatt localStorage med Databutton database
- API endpoints for CRUD operasjoner
- Deployment konfigurasjon
- Miljøvariabler for API keys

### 5. **Avansert Filtrering**
- Søk i kommentarer
- Filtrer på standsplassleder
- Tidsrom-filtrering

### 6. **Responsive Design & Sizing**
- **Kalender-view sizing issues** - fikse at elementer ikke forsvinner ut av skjermen ✅
- Mobile-optimalisering av kalender grid
- Viewport tilpasning for ulike skjermstørrelser
- Touch-friendly interaksjoner

### 7. **Skytebane Distanse Indikator**
- **100m / 200m checkboxes** for å vise hvilken del av skytebanen som er åpen
- Visuell indikasjon av tilgjengelige baner
- Multi-select for aktiviteter som bruker begge distanser
- Farge-koding eller ikoner for ulike distanser

### 8. **Eksport Funksjonalitet**
- Eksporter til CSV/PDF
- Del kalender via link
- Print-vennlig visning

---

## 🎯 Neste Steg
1. Test nåværende funksjonalitet grundig
2. **Fikse kalender-view sizing issues** 📱 ✅
3. **Forbered flytting til Databutton** ⭐
4. Implementer iCalUID synkronisering
5. Legg til tidsbestemt kategorisering
6. Forbedre brukeropplevelse basert på feedback

---

## 🚀 **Databutton Deployment Forberedelser**

### **Høy Prioritet - Før Deployment:**

#### **1. Database Migrasjon**
- [ ] Erstatt `localStorage` med Databutton database
- [ ] Opprett database schema for aktiviteter
- [ ] Migrer eksisterende data
- [ ] Test data persistence

#### **2. API Endpoints**
- [ ] `/api/activities` - CRUD operasjoner
- [ ] `/api/import` - Kalender import
- [ ] `/api/duplicates` - Duplikat håndtering
- [ ] Error handling og validering

#### **3. Miljøvariabler**
- [ ] Google Calendar API key
- [ ] Database connection string
- [ ] App konfigurasjon
- [ ] Production vs development settings

#### **4. Frontend Tilpasninger**
- [ ] Oppdater alle `fetch()` calls til API endpoints
- [ ] Fjern localStorage kode
- [ ] Legg til loading states
- [ ] Error handling i UI

#### **5. Deployment Konfigurasjon**
- [ ] `requirements.txt` for Python dependencies
- [ ] `app.py` for Databutton
- [ ] Static file serving
- [ ] CORS konfigurasjon

### **Databutton Spesifikke Hensyn:**
- **Stateless design** - ikke avhengig av server state
- **API-first approach** - all data via REST endpoints
- **Error handling** - robust feilhåndtering
- **Performance** - caching og optimalisering
- **Security** - validering av input/output
