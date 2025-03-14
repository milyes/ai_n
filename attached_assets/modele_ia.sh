#!/bin/bash

set -e  # Arrête le script en cas d'erreur

API_KEY="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"
#API_KEY = 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
# "sk-proj-BbaR0X2Prw794jceGexbsfZx-_-PqmIAJjXkRJgg-Xb0V3qbeBkUPYhxw_M4e0yGdAyZhHJ2-ZT3BlbkFJkpKbnD_CR4Oi7ZghTGIMJIhqb8rzt_xFhYN-NRzNQ-ZYzu8nZQSHrLoSabxZjElC2
#="B4xg4zzx-kI3s-641OGExdXPqP0ch6VEdde-HiFygJ2BhNi16_/

 # API Key pour sécuriser l'IA
IA_DIR="$HOME/modele_ia"  # Dossier de l'IA

echo "🚀 Initialisation du module IA automatique..."

# Vérifier et installer Python
if ! command -v python3 &> /dev/null; then
    echo "📌 Python3 non trouvé. Installation..."
    apt update && apt install python3 -y
else
    echo "✅ Python3 est installé."
fi

# Vérifier et installer pip
if ! command -v pip3 &> /dev/null; then
    echo "📌 pip non trouvé. Installation..."
    python3 get-pip.py
else
    echo "✅ pip est installé."
fi

# Installer les dépendances IA
echo "📦 Installation des dépendances..."
pip3 install flask openai numpy pandas

# Créer le dossier du modèle IA
mkdir -p "$IA_DIR"

# Créer le fichier de configuration avec l'API Key
echo "🔑 Configuration de l'API Key..."
echo "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" > "$IA_DIR/config.env"

# Créer le serveur IA Flask
cat > "$IA_DIR/ia_server.py" <<EOL
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Charger l'API Key
API_KEY = ("API_KEY","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")
#sk-proj-705CZOZrUV_pB4xg4zzx-kI3s-641OGExdXPqPch6VEdde-HiFygJ2BhNi16_cyxuHg23wZXm8T3BlbkFJsrxRLArIhzvblAy_rdXeq_PK7TjxFsLVRT7xtBpa6IrGGDZCl55bOyeDyHWmb1u_cxJB_T

@app.route('/ia', methods=['POST'])
def ia_request():
    user_api_key = request.headers.get("Authorization")
    
    if user_api_key != f"Bearer {API_KEY}":
        return jsonify({"error": "Clé API invalide"}), 403

    data = request.json.get("input", "Aucune donnée reçue")
    response = f"IA a analysé : {data}"  # Simulation de réponse IA

    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
EOL

# Ajouter un alias pour exécuter le modèle IA avec une commande personnalisée
echo "alias modele_ia.root@cmd$='python3 $IA_DIR/ia_server.py'" >> ~/.bashrc
source ~/.bashrc

echo "✅ Installation et configuration terminées !"
echo "🔥 Utilisez 'modele_ia.root@cmd$' pour démarrer l'IA."
