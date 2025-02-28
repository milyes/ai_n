#!/bin/bash

# Chargement de la configuration
source "$HOME/.network_detect/config.sh"

# Fonction de logging
log_wifi() {
    local message=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ${message}" >> "${LOG_FILE}"
    echo -e "${message}"
}

# Détection de l'environnement Replit
is_replit_env() {
    [ -n "$REPL_ID" ] || [ -n "$REPL_OWNER" ]
    return $?
}

# Fonction d'envoi de notification
send_notification() {
    local network_info=$1
    if [ -f "notify.py" ]; then
        if [ -z "${NOTIFICATION_PHONE}" ]; then
            log_wifi "${JAUNE}Aucun numéro de téléphone configuré pour les notifications${NEUTRE}"
            return
        fi
        python3 notify.py "$network_info" "${NOTIFICATION_PHONE}"
    fi
}

# Fonction de vérification du service WiFi
check_wifi_service() {
    if [ "$TEST_MODE" = "true" ]; then
        return 0
    fi

    if is_replit_env; then
        log_wifi "${JAUNE}Détecté environnement Replit - Le matériel WiFi n'est pas disponible${NEUTRE}"
        log_wifi "${JAUNE}Suggestion: Utilisez TEST_MODE=true pour tester la fonctionnalité${NEUTRE}"
        return 1
    fi

    # Vérification de l'interface WiFi
    if ! iwconfig 2>/dev/null | grep -q "IEEE 802.11"; then
        log_wifi "${ROUGE}Erreur : Aucune interface WiFi n'a été détectée${NEUTRE}"
        return 1
    fi

    return 0
}

# Fonction de simulation pour le mode test
simulate_wifi_networks() {
    cat << EOF
Cell 01 - Address: 00:11:22:33:44:55
    ESSID:"WiFi-Test-1"
    Signal level=-65 dBm
    Encryption: WPA2
Cell 02 - Address: AA:BB:CC:DD:EE:FF
    ESSID:"WiFi-Test-2"
    Signal level=-72 dBm
    Encryption: WPA2
Cell 03 - Address: 12:34:56:78:90:AB
    ESSID:"WiFi-Test-3"
    Signal level=-85 dBm
    Encryption: None
EOF
}

# Vérification de l'environnement WiFi
check_wifi_environment() {
    if [ "$TEST_MODE" = "true" ]; then
        log_wifi "${VERT}Mode test activé - Pas de vérification matérielle nécessaire${NEUTRE}"
        return 0
    fi

    # Vérification des outils requis
    local required_tools=("iwconfig" "iwlist")
    local missing_tools=()

    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_wifi "${ROUGE}Erreur : Les outils suivants sont manquants: ${missing_tools[*]}${NEUTRE}"
        return 1
    fi

    # Vérification du service WiFi
    check_wifi_service

    return 0
}


# Fonction principale de détection WiFi
detect_wifi_network() {
    log_wifi "${VERT}Vérification de l'environnement WiFi...${NEUTRE}"

    if ! check_wifi_service; then
        if ! is_replit_env; then
            log_wifi "${ROUGE}L'environnement n'est pas correctement configuré pour le WiFi${NEUTRE}"
        fi
        return 1
    fi

    log_wifi "${VERT}Démarrage du scan WiFi...${NEUTRE}"

    # Création d'un fichier temporaire pour les résultats
    temp_file=$(mktemp)

    if [ "$TEST_MODE" = "true" ]; then
        # En mode test, utiliser des données simulées
        simulate_wifi_networks > "$temp_file"
    else
        # Scan des réseaux WiFi
        if ! iwlist scan > "$temp_file" 2>&1; then
            log_wifi "${ROUGE}Erreur durant le scan WiFi${NEUTRE}"
            rm "$temp_file"
            return 1
        fi
    fi

    # Vérification et affichage des résultats
    if [ ! -s "$temp_file" ]; then
        log_wifi "${ROUGE}Aucun réseau WiFi n'a été détecté${NEUTRE}"
        rm "$temp_file"
        return 1
    fi

    # Traitement et affichage des résultats
    log_wifi "${VERT}Réseaux détectés :${NEUTRE}"
    current_network=""
    while IFS= read -r line; do
        if [[ $line =~ "Cell" ]]; then
            # Envoyer le réseau précédent s'il existe
            if [ ! -z "$current_network" ]; then
                echo -e "  ${current_network}"
                log_wifi "Réseau détecté - ${current_network}"
                send_notification "${current_network}"
            fi
            current_network="Adresse MAC : $(echo $line | grep -o '[0-9A-F]\{2\}:[0-9A-F]\{2\}:[0-9A-F]\{2\}:[0-9A-F]\{2\}:[0-9A-F]\{2\}:[0-9A-F]\{2\}')"
        elif [[ $line =~ "ESSID" ]]; then
            essid=$(echo $line | cut -d'"' -f2)
            current_network="${current_network}\nNom : ${essid}"
        elif [[ $line =~ "Signal level" ]]; then
            signal=$(echo $line | grep -o "Signal level=.*" | cut -d'=' -f2)
            current_network="${current_network}\nSignal : ${signal}"
        elif [[ $line =~ "Encryption" ]]; then
            encryption=$(echo $line | cut -d':' -f2 | tr -d ' ')
            current_network="${current_network}\nChiffrement : ${encryption}"
        fi
    done < "$temp_file"

    # Envoyer le dernier réseau
    if [ ! -z "$current_network" ]; then
        echo -e "  ${current_network}"
        log_wifi "Réseau détecté - ${current_network}"
        send_notification "${current_network}"
    fi

    rm "$temp_file"
    return 0
}

# Exécution de la détection si le script est appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    detect_wifi_network
fi