# Skytebane Kalender - Snapshots

Denne mappen inneholder mellomlagringer og backups av skytebane-kalender appen.

## Versjoner

### v1.0-working-calendar (7. august 2025)
**Status**: ✅ Fungerende versjon

**Funksjoner:**
- ✅ Liste-visning med fremtidige aktiviteter
- ✅ Kalender-visning med tile view
- ✅ Multi-tag aktiviteter (flere kategorier per aktivitet)
- ✅ Filtrering med checkbokser
- ✅ "Fjern alle valg" knapp
- ✅ Admin-panel uten PIN-kode
- ✅ Automatisk filtrering av tidligere aktiviteter
- ✅ Responsivt design (PC/mobil)
- ✅ Norsk dato/tid format
- ✅ Fargekoding for aktivitetstyper

**Fikset:**
- ✅ Timezone-bug i kalender-visning
- ✅ Pre-populerte aktiviteter for august 2025
- ✅ Fremtidige aktiviteter filtreres automatisk

**Filer:**
- `v1.0-working-calendar.html`
- `v1.0-working-calendar.css`
- `v1.0-working-calendar.js`

## Hvordan bruke snapshots

1. **Gjenopprett versjon**: Kopier filene fra snapshot til hovedmappen
2. **Sammenlign versjoner**: Bruk diff-verktøy for å se endringer
3. **Backup før endringer**: Lag ny snapshot før store endringer

## Naming Convention

- `vX.Y-description.ext` - Versjon med beskrivelse
- `vX.Y.YYYY-MM-DD.ext` - Versjon med dato
- `backup-YYYY-MM-DD-HHMM.ext` - Backup med timestamp

## Kommandoer for å gjenopprette

```bash
# Gjenopprett v1.0
cp Snapshots/v1.0-working-calendar.html index.html
cp Snapshots/v1.0-working-calendar.css styles.css
cp Snapshots/v1.0-working-calendar.js script.js

# Lag ny snapshot
cp index.html Snapshots/v1.1-new-feature.html
cp styles.css Snapshots/v1.1-new-feature.css
cp script.js Snapshots/v1.1-new-feature.js
``` 
### v1.1-admin-funksjonalitet-fikset (2025-08-07-2245)
**Status**: ✅ Fungerende versjon

**Endringer:**
- ✅ Fikset admin-funksjonalitet - kan nå opprette nye aktiviteter
- ✅ Fjernet "invalid value" feil på tid-input
- ✅ Fjernet begrensning på minutter (step="900")
- ✅ Norsk datoformat (dd.mm.yy) i visning
- ✅ 24-timers format for tid
- ✅ Validering av skjemadata

**Filer:**
- `v1.1-admin-funksjonalitet-fikset.html`
- `v1.1-admin-funksjonalitet-fikset.css`
- `v1.1-admin-funksjonalitet-fikset.js`


### v1.1-Kalender sizing fixes og mandag start - klar for mobil testing (2025-08-08-0026)
**Status**: 🔄 Under utvikling

**Endringer:**
- 🔄 Kalender sizing fixes og mandag start - klar for mobil testing

**Filer:**
- `v1.1-Kalender sizing fixes og mandag start - klar for mobil testing.html`
- `v1.1-Kalender sizing fixes og mandag start - klar for mobil testing.css`
- `v1.1-Kalender sizing fixes og mandag start - klar for mobil testing.js`


### v1.1-klar-for-databutton-deployment (2025-08-08-0918)
**Status**: 🔄 Under utvikling

**Endringer:**
- 🔄 klar-for-databutton-deployment

**Filer:**
- `v1.1-klar-for-databutton-deployment.html`
- `v1.1-klar-for-databutton-deployment.css`
- `v1.1-klar-for-databutton-deployment.js`


### v1.1-ical-integrasjon-fungerer-perfekt (2025-08-08-1636)
**Status**: 🔄 Under utvikling

**Endringer:**
- 🔄 ical-integrasjon-fungerer-perfekt

**Filer:**
- `v1.1-ical-integrasjon-fungerer-perfekt.html`
- `v1.1-ical-integrasjon-fungerer-perfekt.css`
- `v1.1-ical-integrasjon-fungerer-perfekt.js`

