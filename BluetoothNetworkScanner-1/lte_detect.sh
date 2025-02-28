#!/bin/bash

# Chargement de la configuration
source "$HOME/.network_detect/config.sh"

# Fonction de logging
log_lte() {
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
            log_lte "${JAUNE}Aucun numéro de téléphone configuré pour les notifications${NEUTRE}"
            return
        fi
        python3 notify.py "$network_info" "${NOTIFICATION_PHONE}"
    fi
}

# Fonction de vérification de l'environnement LTE
check_lte_environment() {
    if [ "$TEST_MODE" = "true" ]; then
        log_lte "${VERT}Mode test activé - Pas de vérification matérielle nécessaire${NEUTRE}"
        return 0
    fi

    if is_replit_env; then
        log_lte "${JAUNE}Détecté environnement Replit - Le matériel LTE n'est pas disponible${NEUTRE}"
        log_lte "${JAUNE}Suggestion: Utilisez TEST_MODE=true pour tester la fonctionnalité${NEUTRE}"
        return 1
    fi

    # Vérification des outils requis
    local required_tools=("mmcli")
    local missing_tools=()

    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_lte "${ROUGE}Erreur : Les outils suivants sont manquants: ${missing_tools[*]}${NEUTRE}"
        return 1
    fi

    return 0
}

# Fonction de simulation pour le mode test
simulate_lte_networks() {
    cat << EOF
Cell 1:
    Operator: Orange
    Technology: 4G/LTE
    Signal: -85 dBm
    Band: B7 (2600 MHz)
Cell 2:
    Operator: SFR
    Technology: 4G+/LTE-A
    Signal: -92 dBm
    Band: B20 (800 MHz)
Cell 3:
    Operator: Free Mobile
    Technology: 5G
    Signal: -78 dBm
    Band: n78 (3500 MHz)
EOF
}

# Fonction principale de détection LTE
detect_lte_network() {
    log_lte "${VERT}Vérification de l'environnement LTE...${NEUTRE}"

    if ! check_lte_environment; then
        log_lte "${ROUGE}L'environnement n'est pas correctement configuré pour le LTE${NEUTRE}"
        return 1
    fi

    log_lte "${VERT}Démarrage du scan LTE...${NEUTRE}"

    # Création d'un fichier temporaire pour les résultats
    temp_file=$(mktemp)

    if [ "$TEST_MODE" = "true" ]; then
        # En mode test, utiliser des données simulées
        simulate_lte_networks > "$temp_file"
    else
        # Scan des réseaux LTE avec ModemManager
        if ! mmcli -L > "$temp_file" 2>&1; then
            log_lte "${ROUGE}Erreur durant le scan LTE${NEUTRE}"
            rm "$temp_file"
            return 1
        fi
    fi

    # Vérification et affichage des résultats
    if [ ! -s "$temp_file" ]; then
        log_lte "${ROUGE}Aucun réseau LTE n'a été détecté${NEUTRE}"
        rm "$temp_file"
        return 1
    fi

    # Traitement et affichage des résultats
    log_lte "${VERT}Réseaux détectés :${NEUTRE}"
    current_network=""
    while IFS= read -r line; do
        if [[ $line =~ "Cell" ]]; then
            # Envoyer le réseau précédent s'il existe
            if [ ! -z "$current_network" ]; then
                echo -e "  ${current_network}"
                log_lte "Réseau détecté - ${current_network}"
                send_notification "${current_network}"
            fi
            current_network="$line"
        else
            current_network="${current_network}\n${line}"
        fi
    done < "$temp_file"

    # Envoyer le dernier réseau
    if [ ! -z "$current_network" ]; then
        echo -e "  ${current_network}"
        log_lte "Réseau détecté - ${current_network}"
        send_notification "${current_network}"
    fi

    rm "$temp_file"
    return 0
}

# Exécution de la détection si le script est appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    detect_lte_network
fi