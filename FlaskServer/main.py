from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_cors import CORS
import os
import json
import requests
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

# Récupération de la clé API OpenAI depuis les variables d'environnement
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

# Décorateur pour gérer les erreurs de requête JSON
def handle_invalid_json(f):
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except json.JSONDecodeError:
            return jsonify({
                "success": False,
                "message": "Format JSON invalide dans la requête"
            }), 400
    decorated_function.__name__ = f.__name__
    return decorated_function

# Configuration d'origine IA par défaut
AI_ORIGINS = {
    "openai": {
        "name": "OpenAI GPT-4o",
        "description": "Service IA basé sur OpenAI, haute qualité mais nécessite une clé API"
    },
    "local": {
        "name": "Implémentation locale",
        "description": "Algorithmes locaux simples, rapides mais moins précis"
    },
    "auto": {
        "name": "Sélection automatique",
        "description": "Utilise OpenAI si disponible, sinon repli sur l'implémentation locale"
    }
}

current_origin = "auto"

# Fonctions d'IA

def get_openai_client():
    """Vérifier si OpenAI est configuré correctement"""
    if not OPENAI_API_KEY:
        return False
    return True

def openai_sentiment_analysis(text):
    """Analyse de sentiment avec OpenAI"""
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system", 
                    "content": "Tu es un expert en analyse de sentiment. Analyse le sentiment du texte et fournis une note de 1 à 5 étoiles et un score de confiance entre 0 et 1. Réponds uniquement avec un JSON au format: { 'rating': nombre, 'confidence': nombre }"
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            "response_format": {"type": "json_object"}
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        response_data = response.json()
        
        if "choices" in response_data:
            content = response_data["choices"][0]["message"]["content"]
            result = json.loads(content)
            return {
                "rating": max(1, min(5, int(result.get("rating", 3)))),
                "confidence": max(0, min(1, float(result.get("confidence", 0.5))))
            }
        else:
            return None
    except Exception as e:
        print(f"Erreur OpenAI: {str(e)}")
        return None

def openai_summarize(text):
    """Génération de résumé avec OpenAI"""
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system", 
                    "content": "Tu es un expert en résumé de texte. Génère un résumé concis mais informatif du texte fourni. Conserve les points clés et l'essence du message."
                },
                {
                    "role": "user",
                    "content": text
                }
            ]
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        response_data = response.json()
        
        if "choices" in response_data:
            return response_data["choices"][0]["message"]["content"]
        else:
            return None
    except Exception as e:
        print(f"Erreur OpenAI: {str(e)}")
        return None

def openai_recommendations(description):
    """Recommandations de produits avec OpenAI"""
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system", 
                    "content": "Tu es un expert en sécurité réseau. Basé sur la description fournie, suggère 5 recommandations de sécurité réseau spécifiques et pertinentes. Fournis uniquement une liste de recommandations sans commentaires supplémentaires."
                },
                {
                    "role": "user",
                    "content": description
                }
            ]
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        response_data = response.json()
        
        if "choices" in response_data:
            content = response_data["choices"][0]["message"]["content"]
            # Traitement du texte pour extraire les recommandations
            recommendations = []
            for line in content.split("\n"):
                line = line.strip()
                if line and (line.startswith("- ") or line.startswith("• ") or line.startswith("* ") or 
                           line[0].isdigit() and line[1] in [".", ")", ":"]):
                    recommendations.append(line.lstrip("- •*0123456789.):").strip())
                elif len(recommendations) < 5 and line:
                    recommendations.append(line)
            
            return recommendations[:5]  # Garantir exactement 5 recommandations
        else:
            return None
    except Exception as e:
        print(f"Erreur OpenAI: {str(e)}")
        return None

def local_sentiment_analysis(text):
    """Analyse de sentiment basique locale"""
    # Liste de mots positifs et négatifs en français
    positive_words = ["bon", "super", "excellent", "formidable", "magnifique", "beau", "réussi", 
                     "merveilleux", "parfait", "agréable", "heureux", "content", "satisfait", 
                     "joie", "plaisir", "génial", "sécurité", "sécurisé", "protégé", "fiable"]
    
    negative_words = ["mauvais", "terrible", "horrible", "affreux", "pauvre", "décevant", 
                     "déception", "problème", "triste", "malheureux", "échec", "faible", 
                     "erreur", "pire", "panne", "danger", "vulnérable", "menace", "risque", "faille"]
    
    # Analyse simple
    text_lower = text.lower()
    words = text_lower.split()
    
    # Compter les mots positifs et négatifs
    positive_count = sum(1 for word in words if any(pw in word for pw in positive_words))
    negative_count = sum(1 for word in words if any(nw in word for nw in negative_words))
    
    # Calculer le score et la confiance
    total = positive_count + negative_count
    if total == 0:
        rating = 3  # Neutre
        confidence = 0.3  # Confiance faible
    else:
        positive_ratio = positive_count / total
        rating = 1 + int(positive_ratio * 4)  # Échelle de 1 à 5
        
        # Plus le nombre total de mots reconnus est élevé, plus la confiance est grande
        # mais plafonnée à 0.8 pour l'algorithme local
        confidence = min(0.8, total / (len(words) * 0.5))
    
    return {
        "rating": rating,
        "confidence": confidence
    }

def local_summarize(text):
    """Génération de résumé simple locale"""
    # Diviser le texte en phrases
    sentences = text.replace("!", ".").replace("?", ".").split(".")
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Pour un résumé très simple, prendre les premières phrases
    if len(sentences) <= 3:
        return text
    
    # Prendre les 3 premières phrases comme résumé
    summary = ". ".join(sentences[:3]) + "."
    
    return summary

def local_recommendations(description):
    """Recommandations de sécurité réseau basiques locales"""
    
    # Dictionnaire de mots-clés et recommandations associées
    security_recommendations = {
        "wifi": [
            "Utilisez WPA3 pour le chiffrement de votre réseau WiFi",
            "Changez régulièrement le mot de passe de votre réseau WiFi",
            "Activez le filtrage MAC pour limiter les appareils autorisés"
        ],
        "mot de passe": [
            "Utilisez des mots de passe forts d'au moins 12 caractères",
            "Activez l'authentification à deux facteurs (2FA) sur tous vos comptes",
            "Utilisez un gestionnaire de mots de passe pour générer et stocker des mots de passe complexes"
        ],
        "entreprise": [
            "Mettez en place un VPN pour les connexions distantes",
            "Segmentez votre réseau pour isoler les systèmes critiques",
            "Formez régulièrement vos employés aux menaces de sécurité"
        ],
        "iot": [
            "Isolez vos appareils IoT sur un réseau séparé",
            "Désactivez les fonctionnalités non utilisées des appareils connectés",
            "Mettez à jour régulièrement le firmware de vos appareils IoT"
        ],
        "routeur": [
            "Mettez à jour régulièrement le firmware de votre routeur",
            "Changez les identifiants par défaut de votre routeur",
            "Désactivez WPS pour éviter les attaques brute force"
        ]
    }
    
    # Recommandations générales toujours incluses
    general_recommendations = [
        "Installez et maintenez à jour un logiciel antivirus",
        "Activez votre pare-feu réseau",
        "Effectuez des sauvegardes régulières de vos données",
        "Mettez à jour régulièrement tous vos logiciels et systèmes d'exploitation",
        "Réalisez des audits de sécurité périodiques de votre réseau"
    ]
    
    # Analyser les mots clés dans la description
    desc_lower = description.lower()
    matched_recommendations = []
    
    for keyword, recs in security_recommendations.items():
        if keyword in desc_lower:
            matched_recommendations.extend(recs)
    
    # Si aucune recommandation spécifique n'a été trouvée, utiliser les recommandations générales
    if not matched_recommendations:
        return general_recommendations
    
    # Mélanger les recommandations spécifiques avec quelques recommandations générales
    import random
    
    # Limiter à 3 recommandations spécifiques maximum
    if len(matched_recommendations) > 3:
        matched_recommendations = random.sample(matched_recommendations, 3)
    
    # Compléter avec des recommandations générales
    remaining_slots = 5 - len(matched_recommendations)
    general_sample = random.sample(general_recommendations, remaining_slots)
    
    # Combiner et mélanger
    final_recommendations = matched_recommendations + general_sample
    random.shuffle(final_recommendations)
    
    return final_recommendations

# Routes pour les pages web

@app.route('/')
def accueil():
    """Page d'accueil"""
    return render_template('index.html')

@app.route('/login')
def login():
    """Page de connexion"""
    return render_template('login.html')

@app.route('/register')
def register():
    """Page d'inscription"""
    return render_template('register.html')

@app.route('/dashboard')
def dashboard():
    """Tableau de bord"""
    return render_template('dashboard.html')

@app.route('/devices')
def devices():
    """Liste des appareils"""
    return render_template('devices.html')

# Routes API pour l'IA

@app.route('/api/ai/config/origin', methods=['GET'])
def get_ai_origin():
    """Obtenir l'origine IA actuelle"""
    global current_origin
    return jsonify({
        "success": True,
        "data": {
            "origin": current_origin,
            "name": AI_ORIGINS[current_origin]["name"],
            "description": AI_ORIGINS[current_origin]["description"]
        }
    })

@app.route('/api/ai/config/origin', methods=['POST'])
@handle_invalid_json
def set_ai_origin():
    """Définir l'origine IA par défaut"""
    global current_origin
    
    data = request.json
    
    if not data or "origin" not in data:
        return jsonify({
            "success": False,
            "message": "Le paramètre 'origin' est requis"
        }), 400
    
    origin = data["origin"]
    
    if origin not in AI_ORIGINS:
        return jsonify({
            "success": False,
            "message": f"Origine invalide. Options valides: {', '.join(AI_ORIGINS.keys())}"
        }), 400
    
    current_origin = origin
    
    return jsonify({
        "success": True,
        "data": {
            "origin": current_origin,
            "name": AI_ORIGINS[current_origin]["name"],
            "description": AI_ORIGINS[current_origin]["description"]
        }
    })

@app.route('/api/ai/sentiment', methods=['POST'])
@handle_invalid_json
def analyze_sentiment():
    """Analyser le sentiment d'un texte"""
    data = request.json
    
    if not data or "text" not in data:
        return jsonify({
            "success": False,
            "message": "Le paramètre 'text' est requis"
        }), 400
    
    text = data["text"]
    origin = data.get("origin", current_origin)
    
    if origin not in AI_ORIGINS:
        return jsonify({
            "success": False,
            "message": f"Origine invalide. Options valides: {', '.join(AI_ORIGINS.keys())}"
        }), 400
    
    warning = None
    effective_origin = origin
    
    if origin == "openai" or origin == "auto":
        # Tenter OpenAI d'abord
        if get_openai_client():
            result = openai_sentiment_analysis(text)
            if result:
                effective_origin = "openai"
            elif origin == "auto":
                # Fallback vers l'implémentation locale
                result = local_sentiment_analysis(text)
                effective_origin = "local"
                warning = "Mode secours activé: OpenAI indisponible, utilisation de l'implémentation locale"
            else:
                return jsonify({
                    "success": False,
                    "message": "Service OpenAI indisponible"
                }), 503
        else:
            if origin == "auto":
                # Fallback vers l'implémentation locale
                result = local_sentiment_analysis(text)
                effective_origin = "local"
                warning = "Mode secours activé: OpenAI non configuré, utilisation de l'implémentation locale"
            else:
                return jsonify({
                    "success": False,
                    "message": "Clé API OpenAI non configurée"
                }), 503
    else:
        # Utilisation directe de l'implémentation locale
        result = local_sentiment_analysis(text)
        effective_origin = "local"
    
    response = {
        "success": True,
        "data": {
            "rating": result["rating"],
            "confidence": result["confidence"],
            "origin": effective_origin
        }
    }
    
    if warning:
        response["warning"] = warning
    
    return jsonify(response)

@app.route('/api/ai/summary', methods=['POST'])
@handle_invalid_json
def generate_summary():
    """Générer un résumé d'un texte"""
    data = request.json
    
    if not data or "text" not in data:
        return jsonify({
            "success": False,
            "message": "Le paramètre 'text' est requis"
        }), 400
    
    text = data["text"]
    origin = data.get("origin", current_origin)
    
    if origin not in AI_ORIGINS:
        return jsonify({
            "success": False,
            "message": f"Origine invalide. Options valides: {', '.join(AI_ORIGINS.keys())}"
        }), 400
    
    warning = None
    effective_origin = origin
    
    if origin == "openai" or origin == "auto":
        # Tenter OpenAI d'abord
        if get_openai_client():
            summary = openai_summarize(text)
            if summary:
                effective_origin = "openai"
            elif origin == "auto":
                # Fallback vers l'implémentation locale
                summary = local_summarize(text)
                effective_origin = "local"
                warning = "Mode secours activé: OpenAI indisponible, utilisation de l'implémentation locale"
            else:
                return jsonify({
                    "success": False,
                    "message": "Service OpenAI indisponible"
                }), 503
        else:
            if origin == "auto":
                # Fallback vers l'implémentation locale
                summary = local_summarize(text)
                effective_origin = "local"
                warning = "Mode secours activé: OpenAI non configuré, utilisation de l'implémentation locale"
            else:
                return jsonify({
                    "success": False,
                    "message": "Clé API OpenAI non configurée"
                }), 503
    else:
        # Utilisation directe de l'implémentation locale
        summary = local_summarize(text)
        effective_origin = "local"
    
    response = {
        "success": True,
        "data": {
            "summary": summary,
            "origin": effective_origin
        }
    }
    
    if warning:
        response["warning"] = warning
    
    return jsonify(response)

@app.route('/api/ai/recommendations', methods=['POST'])
@handle_invalid_json
def get_recommendations():
    """Générer des recommandations de produits"""
    data = request.json
    
    if not data or "description" not in data:
        return jsonify({
            "success": False,
            "message": "Le paramètre 'description' est requis"
        }), 400
    
    description = data["description"]
    origin = data.get("origin", current_origin)
    
    if origin not in AI_ORIGINS:
        return jsonify({
            "success": False,
            "message": f"Origine invalide. Options valides: {', '.join(AI_ORIGINS.keys())}"
        }), 400
    
    warning = None
    effective_origin = origin
    
    if origin == "openai" or origin == "auto":
        # Tenter OpenAI d'abord
        if get_openai_client():
            recommendations = openai_recommendations(description)
            if recommendations:
                effective_origin = "openai"
            elif origin == "auto":
                # Fallback vers l'implémentation locale
                recommendations = local_recommendations(description)
                effective_origin = "local"
                warning = "Mode secours activé: OpenAI indisponible, utilisation de l'implémentation locale"
            else:
                return jsonify({
                    "success": False,
                    "message": "Service OpenAI indisponible"
                }), 503
        else:
            if origin == "auto":
                # Fallback vers l'implémentation locale
                recommendations = local_recommendations(description)
                effective_origin = "local"
                warning = "Mode secours activé: OpenAI non configuré, utilisation de l'implémentation locale"
            else:
                return jsonify({
                    "success": False,
                    "message": "Clé API OpenAI non configurée"
                }), 503
    else:
        # Utilisation directe de l'implémentation locale
        recommendations = local_recommendations(description)
        effective_origin = "local"
    
    response = {
        "success": True,
        "data": {
            "recommendations": recommendations,
            "origin": effective_origin
        }
    }
    
    if warning:
        response["warning"] = warning
    
    return jsonify(response)

# Gestion des erreurs

@app.errorhandler(404)
def page_non_trouvee(error):
    return render_template('index.html', error="Page non trouvée"), 404

@app.errorhandler(500)
def erreur_serveur(error):
    return render_template('index.html', error="Erreur interne du serveur"), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)