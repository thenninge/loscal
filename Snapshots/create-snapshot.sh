#!/bin/bash

# Skytebane Kalender - Snapshot Creator
# Bruk: ./create-snapshot.sh "beskrivelse"

if [ -z "$1" ]; then
    echo "Bruk: ./create-snapshot.sh \"beskrivelse\""
    echo "Eksempel: ./create-snapshot.sh \"database-integration\""
    exit 1
fi

DESCRIPTION=$1
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
VERSION="v1.1-${DESCRIPTION}"

echo "Lager snapshot: ${VERSION}"

# Kopier filer til snapshot
cp ../index.html "${VERSION}.html"
cp ../styles.css "${VERSION}.css"
cp ../script.js "${VERSION}.js"

echo "✅ Snapshot laget: ${VERSION}"
echo "📁 Filer:"
echo "  - ${VERSION}.html"
echo "  - ${VERSION}.css"
echo "  - ${VERSION}.js"

# Oppdater README med ny versjon
echo "" >> README.md
echo "### ${VERSION} (${TIMESTAMP})" >> README.md
echo "**Status**: 🔄 Under utvikling" >> README.md
echo "" >> README.md
echo "**Endringer:**" >> README.md
echo "- 🔄 ${DESCRIPTION}" >> README.md
echo "" >> README.md
echo "**Filer:**" >> README.md
echo "- \`${VERSION}.html\`" >> README.md
echo "- \`${VERSION}.css\`" >> README.md
echo "- \`${VERSION}.js\`" >> README.md
echo "" >> README.md

echo "📝 README.md oppdatert" 