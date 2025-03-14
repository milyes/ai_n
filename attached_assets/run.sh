#!/bin/bash

# Script pour démarrer NetSecurePro_IA

# Activer l'environnement virtuel (si utilisé)
source venv/bin/activate 2>/dev/null

# Définir le mode (real ou demo)
MODE=${1:-real}  # Par défaut : mode "real"

echo "Démarrage de NetSecurePro_IA en mode $MODE..."

# Lancer le script Python
python3 start_ia.py --mode "$MODE"

# Vérifier si le script s'est terminé correctement
if [ $? -eq 0 ]; then
    echo "NetSecurePro_IA a démarré avec succès."
else
    echo "Erreur lors du démarrage de NetSecurePro_IA."
    exit 1
fi

