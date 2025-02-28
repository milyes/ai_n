#!/bin/bash

# Chargement de la configuration
source "$HOME/.network_detect/config.sh"

# Fonction de logging
log_bluetooth() {
    local message=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ${message}" >> "${LOG_FILE}"
    echo -e "${message}"
}

# Fonction d'envoi de notification
send_notification() {
    local device_info=$1
    if [ -f "notify.py" ]; then
        if [ -z "${NOTIFICATION_PHONE}" ]; then
            log_bluetooth "${JAUNE}Aucun numéro de téléphone configuré pour les notifications${NEUTRE}"
            return
        fi
        python3 notify.py "$device_info" "${NOTIFICATION_PHONE}"
    fi
}

# Détection de l'environnement Replit
is_replit_env() {
    [ -n "$REPL_ID" ] || [ -n "$REPL_OWNER" ]
    return $?
}

# Fonction de vérification du service Bluetooth
check_bluetooth_service() {
    if [ "$TEST_MODE" = "true" ]; then
        return 0
    fi

    if is_replit_env; then
        log_bluetooth "${JAUNE}Détecté environnement Replit - Le matériel Bluetooth n'est pas disponible${NEUTRE}"
        log_bluetooth "${JAUNE}Suggestion: Utilisez TEST_MODE=true pour tester la fonctionnalité${NEUTRE}"
        return 1
    fi

    # Vérification basique du Bluetooth
    if ! ls /sys/class/bluetooth/* >/dev/null 2>&1; then
        log_bluetooth "${ROUGE}Aucun périphérique Bluetooth détecté${NEUTRE}"
        return 1
    fi

    log_bluetooth "${VERT}Périphérique Bluetooth détecté${NEUTRE}"
    return 0
}

# Fonction principale de détection Bluetooth
detect_bluetooth_network() {
    log_bluetooth "${VERT}Vérification de l'environnement Bluetooth...${NEUTRE}"

    if ! check_bluetooth_service; then
        if ! is_replit_env; then
            log_bluetooth "${ROUGE}L'environnement n'est pas correctement configuré pour le Bluetooth${NEUTRE}"
        fi
        return 1
    fi

    if [ "$TEST_MODE" = "true" ]; then
        # Mode test - simulation de données
        log_bluetooth "${VERT}Mode test activé - Utilisation de données simulées${NEUTRE}"
        while read -r line; do
            echo -e "  ${line}"
            log_bluetooth "Appareil détecté - ${line}"
            send_notification "${line}"
        done <<EOF
Device 00:11:22:33:44:55 Smartphone Test
Device AA:BB:CC:DD:EE:FF Écouteurs Test
Device 12:34:56:78:90:AB Enceinte Test
EOF
    else
        # Mode réel - lecture des périphériques Bluetooth
        log_bluetooth "${VERT}Scan des périphériques Bluetooth...${NEUTRE}"
        for dev in /sys/class/bluetooth/*; do
            if [ -d "$dev" ]; then
                device_info="Périphérique: $(basename $dev)"
                echo -e "  ${device_info}"
                log_bluetooth "Périphérique détecté - ${device_info}"
                send_notification "${device_info}"
            fi
        done
    fi

    return 0
}

# Exécution de la détection si le script est appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    detect_bluetooth_network
fi