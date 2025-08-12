# TODO - Losby Skytterlag Åpningstider

## 🚀 Fremtidige Forbedringer

### 1. **Manual-imported ikon-debug**
**Prioritet:** Høy  
**Beskrivelse:** Debug og fiks visning av ikoner for manuelt opprettede vs importerte aktiviteter

#### Problem:
- Alle aktiviteter viser "Manuell" (grønt edit-ikon) selv etter import
- Ikonene fungerer på localhost men ikke på Vercel deployment
- Mulig kolonne-indeks problem mellom SQLite og PostgreSQL

#### Debugging:
- [ ] Sjekk database schema forskjeller
- [ ] Verifiser kolonne-indekser for `source` felt
- [ ] Test import-logikk på både localhost og Vercel
- [ ] Sjekk om `data.get('source', 'manual')` fallback overskriver riktig verdi

---

### 2. **Duplikatprioritering: Manuell vs Importert**
**Prioritet:** Medium  
**Beskrivelse:** Implementer logikk for å prioritere manuelt opprettede aktiviteter over importerte ved duplikat-håndtering

#### Funksjonalitet:
- Ved duplikater: Behold manuelt opprettede aktiviteter, slett importerte
- Visuell indikasjon av hvilke aktiviteter som er manuelle vs importerte
- Admin-panel som viser statistikk over manuelle vs importerte aktiviteter
- Mulighet for å manuelt endre prioritet

#### Teknisk:
```python
# Duplikat-håndtering logikk:
def handle_duplicates(activities):
    # Grupper etter dato, starttid, sluttid
    # For hver gruppe:
    #   - Prioriter manuelle aktiviteter (source='manual')
    #   - Slett importerte aktiviteter (source='imported')
    #   - Behold den beste manuelle aktiviteten
```

#### Implementering:
- [ ] Oppdater `remove_duplicates()` funksjon
- [ ] Legg til prioritetslogikk basert på `source` felt
- [ ] Test med blandet manuell/importert data
- [ ] Oppdater frontend for å vise prioritet

---

### 2. **iCalUID-basert Synkronisering**
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

### 3. **Tidsbestemt Kategorisering**
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
- **Avansert filtrering for bedre UX (Uavklart)** - Forbedre brukeropplevelse for filtrering av uavklarte aktiviteter

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
- [ ] `/api/duplicates`