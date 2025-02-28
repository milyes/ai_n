#!/bin/bash
# Définition des couleurs pour les messages
ROUGE='\033[0;31m'
VERT='\033[0;32m'
NEUTRE='\033[0m'

# Création du répertoire d'installation et de logs
install_dir="$HOME/.network_detect"
mkdir -p "$install_dir"
chmod 700 "$install_dir"

# Fonction de logging
log_message() {
    local message=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ${message}" >> "${install_dir}/install.log"
    echo -e "${message}"
}

# Création et initialisation du fichier de logs
touch "${install_dir}/network_detect.log"
chmod 600 "${install_dir}/network_detect.log"

# Vérification des outils nécessaires
log_message "Vérification des outils réseau..."
required_tools_wifi=("iwconfig" "iwlist")
required_tools_lte=("mmcli")
missing_tools=()

# Vérification des outils WiFi
for tool in "${required_tools_wifi[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        missing_tools+=("$tool")
    fi
done

# Installation des outils manquants pour WiFi
if [ ${#missing_tools[@]} -ne 0 ]; then
    log_message "${ROUGE}Outils WiFi manquants: ${missing_tools[*]}${NEUTRE}"
    log_message "Les outils WiFi doivent être installés via le gestionnaire de dépendances système de Replit"
fi

# Réinitialisation de la liste des outils manquants
missing_tools=()

# Vérification des outils LTE
for tool in "${required_tools_lte[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        missing_tools+=("$tool")
    fi
done

# Installation des outils manquants pour LTE
if [ ${#missing_tools[@]} -ne 0 ]; then
    log_message "${ROUGE}Outils LTE manquants: ${missing_tools[*]}${NEUTRE}"
    log_message "Les outils LTE doivent être installés via le gestionnaire de dépendances système de Replit"
fi

# Copie des fichiers avec les bonnes permissions
cp wifi_detect.sh lte_detect.sh bluetooth_detect.sh esim_detect.sh notify.py config.sh "$install_dir/"
chmod 700 "$install_dir/wifi_detect.sh"
chmod 700 "$install_dir/lte_detect.sh"
chmod 700 "$install_dir/bluetooth_detect.sh"
chmod 700 "$install_dir/esim_detect.sh"
chmod 600 "$install_dir/config.sh"
chmod 600 "$install_dir/notify.py"

# Détection de l'environnement Replit
is_replit_env() {
    [ -n "$REPL_ID" ] || [ -n "$REPL_OWNER" ]
    return $?
}

# Configuration de .bashrc avec gestion des erreurs
if ! is_replit_env; then
    if [ ! -f "$HOME/.bashrc" ]; then
        touch "$HOME/.bashrc" 2>/dev/null || log_message "${ROUGE}Impossible de créer .bashrc. Les scripts devront être sourcés manuellement.${NEUTRE}"
        [ -f "$HOME/.bashrc" ] && chmod 600 "$HOME/.bashrc"
    fi

    if [ -f "$HOME/.bashrc" ] && [ -w "$HOME/.bashrc" ]; then
        for script in wifi_detect.sh lte_detect.sh bluetooth_detect.sh esim_detect.sh; do
            if ! grep -q "source ${install_dir}/${script}" "$HOME/.bashrc" 2>/dev/null; then
                echo "source ${install_dir}/${script}" >> "$HOME/.bashrc" 2>/dev/null || \
                log_message "${ROUGE}Impossible de modifier .bashrc. Vous devrez sourcer ${script} manuellement.${NEUTRE}"
            fi
        done
    else
        log_message "${ROUGE}Pas de permission d'écriture sur .bashrc. Les scripts devront être sourcés manuellement.${NEUTRE}"
    fi
fi

log_message "${VERT}Installation terminée${NEUTRE}"
log_message "Pour commencer à utiliser les scripts, exécutez:"
log_message "source ${install_dir}/wifi_detect.sh"
log_message "source ${install_dir}/lte_detect.sh"
log_message "source ${install_dir}/bluetooth_detect.sh"
log_message "source ${install_dir}/esim_detect.sh"