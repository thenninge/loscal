#!/bin/bash

# Skytebane Kalender - Snapshot Restorer
# Bruk: ./restore-snapshot.sh "versjon"

if [ -z "$1" ]; then
    echo "Bruk: ./restore-snapshot.sh \"versjon\""
    echo "Eksempel: ./restore-snapshot.sh \"v1.0-working-calendar\""
    echo ""
    echo "Tilgjengelige versjoner:"
    ls -1 *.html | sed 's/\.html$//' | sort
    exit 1
fi

VERSION=$1

# Sjekk om versjonen eksisterer
if [ ! -f "${VERSION}.html" ]; then
    echo "❌ Versjon '${VERSION}' finnes ikke"
    echo ""
    echo "Tilgjengelige versjoner:"
    ls -1 *.html | sed 's/\.html$//' | sort
    exit 1
fi

echo "Gjenoppretter versjon: ${VERSION}"

# Backup nåværende versjon først
CURRENT_TIME=$(date +"%Y-%m-%d-%H%M")
echo "📦 Lager backup av nåværende versjon: backup-${CURRENT_TIME}"

cp ../index.html "backup-${CURRENT_TIME}.html"
cp ../styles.css "backup-${CURRENT_TIME}.css"
cp ../script.js "backup-${CURRENT_TIME}.js"

# Gjenopprett snapshot
cp "${VERSION}.html" ../index.html
cp "${VERSION}.css" ../styles.css
cp "${VERSION}.js" ../script.js

echo "✅ Versjon '${VERSION}' gjenopprettet"
echo "📦 Backup lagret som: backup-${CURRENT_TIME}"
echo ""
echo "🚀 Åpne index.html for å se endringene" 