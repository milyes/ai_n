#!/bin/bash

# Script de démarrage du serveur Flask
echo "Démarrage du serveur Flask NetSecure Pro..."

# Vérification de l'existence de l'environnement virtuel
if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Démarrage du serveur Flask sur le port 5001
echo "Lancement du serveur sur http://0.0.0.0:5001"
python main.py