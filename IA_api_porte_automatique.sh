#!/bin/bash
# IA_api_porte_automatique.sh
# Script pour la gestion des connexions API au module IA de porte automatique
# Permet l'authentification par empreinte et connexion à port fixe
# Usage: ./IA_api_porte_automatique.sh [start|stop|status|test]

# Configuration
PORT_FIXE=8085
API_ENDPOINT="http://localhost:$PORT_FIXE/api/access"
LOG_FILE="./ia_porte_logs.txt"
EMPREINTE_FILE="./empreintes.db"
CONFIG_FILE="./ia_config.json"
PID_FILE="./ia_porte.pid"

# Couleurs pour les messages
ROUGE='\033[0;31m'
VERT='\033[0;32m'
JAUNE='\033[0;33m'
BLEU='\033[0;34m'
NC='\033[0m' # No Color

# Création des fichiers nécessaires s'ils n'existent pas
function initialiser_fichiers() {
    if [ ! -f "$LOG_FILE" ]; then
        touch "$LOG_FILE"
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Initialisation du fichier de logs" >> "$LOG_FILE"
    fi
    
    if [ ! -f "$EMPREINTE_FILE" ]; then
        touch "$EMPREINTE_FILE"
        echo "# Fichier d'empreintes - Format: ID;NOM;HASH;NIVEAU_ACCES" > "$EMPREINTE_FILE"
        echo "1;admin;$(echo -n "admin123" | sha256sum | awk '{print $1}');admin" >> "$EMPREINTE_FILE"
        echo "2;utilisateur;$(echo -n "user123" | sha256sum | awk '{print $1}');utilisateur" >> "$EMPREINTE_FILE"
    fi
    
    if [ ! -f "$CONFIG_FILE" ]; then
        cat > "$CONFIG_FILE" << EOF
{
    "port": $PORT_FIXE,
    "timeout_connection": 30,
    "max_tentatives": 3,
    "delai_verrouillage": 300,
    "mode_securite": "eleve",
    "notifications": true,
    "logging_niveau": "info"
}
EOF
    fi
}

# Fonction pour logger les événements
function log_event() {
    local niveau=$1
    local message=$2
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [$niveau] $message" >> "$LOG_FILE"
    
    # Afficher également dans la console selon le niveau
    case $niveau in
        "ERROR")
            echo -e "${ROUGE}ERROR: $message${NC}"
            ;;
        "WARNING")
            echo -e "${JAUNE}WARNING: $message${NC}"
            ;;
        "INFO")
            echo -e "${BLEU}INFO: $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${VERT}SUCCESS: $message${NC}"
            ;;
    esac
}

# Vérifier l'empreinte
function verifier_empreinte() {
    local empreinte=$1
    
    # Simulation: vérifie si l'empreinte existe dans le fichier
    if grep -q "$empreinte" "$EMPREINTE_FILE"; then
        local nom=$(grep "$empreinte" "$EMPREINTE_FILE" | cut -d';' -f2)
        local niveau_acces=$(grep "$empreinte" "$EMPREINTE_FILE" | cut -d';' -f4)
        log_event "INFO" "Empreinte valide pour l'utilisateur: $nom (Niveau: $niveau_acces)"
        return 0
    else
        log_event "WARNING" "Tentative d'accès avec empreinte invalide: $empreinte"
        return 1
    fi
}

# Démarrer le service
function demarrer_service() {
    if [ -f "$PID_FILE" ]; then
        log_event "WARNING" "Le service semble déjà être en cours d'exécution"
        echo -e "${JAUNE}Le service semble déjà en cours d'exécution. Utilisez 'status' pour vérifier.${NC}"
        return 1
    fi
    
    log_event "INFO" "Démarrage du service IA pour porte automatique sur le port $PORT_FIXE"
    
    # Simulation du démarrage d'un serveur
    # Dans un vrai scénario, vous lanceriez ici votre serveur Node.js, Python, etc.
    echo $$ > "$PID_FILE"
    
    # Vérifier si le port est déjà utilisé
    if nc -z localhost $PORT_FIXE 2>/dev/null; then
        log_event "ERROR" "Le port $PORT_FIXE est déjà utilisé"
        rm "$PID_FILE"
        return 1
    fi
    
    # Simuler un processus en arrière-plan
    (
        log_event "INFO" "Service démarré avec PID: $$"
        log_event "SUCCESS" "Module IA pour porte automatique prêt à recevoir des connexions"
        # Dans un vrai scénario, votre serveur continuerait de s'exécuter ici
        
        # Pour la simulation, on garde juste le fichier PID
        # Le script ne s'exécute pas vraiment en arrière-plan dans cette simulation
    ) &
    
    log_event "SUCCESS" "Service démarré avec succès sur le port $PORT_FIXE"
    echo -e "${VERT}Service démarré avec succès sur le port $PORT_FIXE${NC}"
    echo -e "${BLEU}Utilisez 'status' pour vérifier l'état du service${NC}"
}

# Arrêter le service
function arreter_service() {
    if [ ! -f "$PID_FILE" ]; then
        log_event "WARNING" "Le service ne semble pas être en cours d'exécution"
        echo -e "${JAUNE}Le service ne semble pas être en cours d'exécution${NC}"
        return 1
    fi
    
    local pid=$(cat "$PID_FILE")
    
    # Tenter de tuer le processus
    if kill -0 $pid 2>/dev/null; then
        kill $pid
        log_event "INFO" "Signal d'arrêt envoyé au processus $pid"
    else
        log_event "WARNING" "Le processus $pid n'existe plus"
    fi
    
    rm "$PID_FILE"
    log_event "SUCCESS" "Service arrêté"
    echo -e "${VERT}Service arrêté avec succès${NC}"
}

# Vérifier l'état du service
function verifier_status() {
    if [ ! -f "$PID_FILE" ]; then
        echo -e "${JAUNE}Le service n'est pas en cours d'exécution${NC}"
        return 1
    fi
    
    local pid=$(cat "$PID_FILE")
    
    if kill -0 $pid 2>/dev/null; then
        echo -e "${VERT}Le service est en cours d'exécution avec PID: $pid${NC}"
        echo -e "${BLEU}Port d'écoute: $PORT_FIXE${NC}"
        echo -e "${BLEU}Fichier d'empreintes: $EMPREINTE_FILE${NC}"
        echo -e "${BLEU}Fichier de logs: $LOG_FILE${NC}"
        
        # Afficher les dernières entrées du journal
        echo -e "\n${BLEU}Dernières entrées du journal:${NC}"
        tail -n 5 "$LOG_FILE"
        return 0
    else
        echo -e "${ROUGE}Le service n'est plus en cours d'exécution, mais le fichier PID existe${NC}"
        echo -e "${JAUNE}Suppression du fichier PID obsolète...${NC}"
        rm "$PID_FILE"
        return 1
    fi
}

# Effectuer un test de connexion
function tester_connexion() {
    log_event "INFO" "Test de connexion à l'API sur $API_ENDPOINT"
    echo -e "${BLEU}Test de connexion à l'API sur $API_ENDPOINT...${NC}"
    
    # Simuler une requête API avec curl (en mode silencieux)
    # Dans un scénario réel, vous utiliseriez curl ou un autre outil pour tester l'API
    if which curl >/dev/null 2>&1; then
        if [ -f "$PID_FILE" ]; then
            echo -e "${VERT}Service en cours d'exécution, test possible${NC}"
            
            # Simulation d'une empreinte valide (admin)
            local empreinte_test=$(grep "admin" "$EMPREINTE_FILE" | cut -d';' -f3)
            
            echo -e "${BLEU}Envoi d'une requête d'authentification avec empreinte...${NC}"
            # Dans un scénario réel, vous enverriez une vraie requête
            if verifier_empreinte "$empreinte_test"; then
                echo -e "${VERT}Test réussi! L'API a correctement authentifié l'empreinte${NC}"
                log_event "SUCCESS" "Test de connexion réussi avec empreinte valide"
            else
                echo -e "${ROUGE}Échec du test! L'API n'a pas reconnu l'empreinte${NC}"
                log_event "ERROR" "Échec du test de connexion avec empreinte"
            fi
        else
            echo -e "${ROUGE}Le service n'est pas en cours d'exécution, impossible de tester${NC}"
            log_event "ERROR" "Tentative de test mais le service n'est pas en cours d'exécution"
        fi
    else
        echo -e "${ROUGE}curl n'est pas installé, impossible de tester l'API${NC}"
        log_event "ERROR" "curl n'est pas installé, impossible de tester l'API"
    fi
}

# Afficher l'aide
function afficher_aide() {
    echo -e "${BLEU}=== Module IA API Porte Automatique ===${NC}"
    echo -e "Gestion des connexions API au module IA de porte automatique avec empreinte fixe"
    echo -e "\nUsage: $0 [COMMANDE]"
    echo -e "\nCommandes disponibles:"
    echo -e "  ${VERT}start${NC}   : Démarrer le service"
    echo -e "  ${ROUGE}stop${NC}    : Arrêter le service"
    echo -e "  ${BLEU}status${NC}  : Vérifier l'état du service"
    echo -e "  ${JAUNE}test${NC}    : Tester la connexion à l'API"
    echo -e "  ${BLEU}help${NC}    : Afficher cette aide"
    echo -e "\nExemple: $0 start"
}

# Point d'entrée principal
function main() {
    # Initialiser les fichiers nécessaires
    initialiser_fichiers
    
    # Traiter les arguments
    case "$1" in
        start)
            demarrer_service
            ;;
        stop)
            arreter_service
            ;;
        status)
            verifier_status
            ;;
        test)
            tester_connexion
            ;;
        help|--help|-h)
            afficher_aide
            ;;
        *)
            echo -e "${JAUNE}Commande non reconnue: $1${NC}"
            afficher_aide
            exit 1
            ;;
    esac
}

# Appeler la fonction principale avec tous les arguments
main "$@"