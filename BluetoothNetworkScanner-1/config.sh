#!/bin/bash

# Configuration des couleurs
ROUGE='\033[0;31m'
VERT='\033[0;32m'
JAUNE='\033[0;33m'
NEUTRE='\033[0m'

# Configuration des chemins
INSTALL_DIR="$HOME/.network_detect"
LOG_FILE="${INSTALL_DIR}/network_detect.log"

# Création du répertoire de logs s'il n'existe pas
mkdir -p "${INSTALL_DIR}"
touch "${LOG_FILE}"

# Configuration du timeout de scan (en secondes)
SCAN_TIMEOUT=10

# Mode test (true/false)
TEST_MODE=${TEST_MODE:-false}

# Numéro de téléphone pour les notifications (format international, ex: +33612345678)
NOTIFICATION_PHONE=${NOTIFICATION_PHONE:-""}

# Configuration des permissions de logs
if [ -f "${LOG_FILE}" ]; then
    chmod 600 "${LOG_FILE}"
fi