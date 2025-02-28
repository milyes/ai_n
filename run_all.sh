#!/bin/bash

# Script pour démarrer les deux serveurs ensemble
echo "============================================="
echo "  Démarrage de NetSecure Pro avec API IA    "
echo "============================================="

# Définir la variable d'environnement pour le mode de développement
export NODE_ENV=development

# Démarrer le serveur Express en arrière-plan
echo "[1/2] Démarrage du serveur Express (port 5000)..."
npm run dev &

# Attendre que le serveur Express démarre
sleep 3

echo ""

# Démarrer le serveur Flask
echo "[2/2] Démarrage du serveur Flask (port 5001)..."
cd FlaskServer && ./run_flask.sh

# Note : Ce script ne gère pas proprement la fermeture des processus.
# Pour arrêter proprement, utilisez Ctrl+C et tuez les processus restants avec 'pkill -f "npm run dev"'.