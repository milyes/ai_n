from flask import Flask, render_template, request, jsonify
import logging
import requests
import os
import json
import time
from flask_cors import CORS

# Configuration du logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permettre les requêtes cross-origin

# Configuration OpenAI (si disponible)
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Origines IA disponibles
AI_ORIGINS = {
    "openai": {
        "name": "OpenAI",
        "description": "Utilise l'API OpenAI (GPT-4o)"
    },
    "local": {
        "name": "Local",
        "description": "Utilise l'implémentation locale sans appel d'API externe"
    },
    "auto": {
        "name": "Auto",
        "description": "Sélectionne automatiquement la meilleure option disponible"
    }
}

# Origine par défaut
current_origin = "auto"

# Configuration et gestion OpenAI
def get_openai_client():
    if not OPENAI_API_KEY:
        logger.warning("La clé API OpenAI n'est pas disponible")
        return None
    return {"api_key": OPENAI_API_KEY}

def openai_sentiment_analysis(text):
    """Analyse de sentiment avec OpenAI"""
    if not OPENAI_API_KEY:
        return None
    
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        payload = {
            "model": "gpt-4o",  # le modèle le plus récent (après votre date de connaissance)
            "messages": [
                {
                    "role": "system", 
                    "content": "Tu es un expert en analyse de sentiment. Analyse le sentiment du texte fourni et fournit une évaluation de 1 à 5 étoiles et un niveau de confiance entre 0 et 1. Réponds uniquement avec un objet JSON ayant les clés 'rating' (nombre entier) et 'confidence' (nombre décimal)."
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
        
        if response.status_code == 200:
            result = response.json()
            content = json.loads(result['choices'][0]['message']['content'])
            return {
                "rating": content.get("rating", 3),
                "confidence": content.get("confidence", 0.5)
            }
        else:
            logger.error(f"Erreur OpenAI: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Exception lors de l'appel OpenAI: {e}")
        return None

def openai_summarize(text):
    """Génération de résumé avec OpenAI"""
    if not OPENAI_API_KEY:
        return None
    
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
                    "content": "Tu es un expert en rédaction de résumés concis. Résume le texte fourni en préservant les informations essentielles."
                },
                {
                    "role": "user",
                    "content": f"Résume ce texte en français de façon concise:\n\n{text}"
                }
            ]
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            logger.error(f"Erreur OpenAI: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Exception lors de l'appel OpenAI: {e}")
        return None

def openai_recommendations(description):
    """Recommandations de produits avec OpenAI"""
    if not OPENAI_API_KEY:
        return None
    
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
                    "content": "Tu es un expert en recommandations de produits. Fournis une liste de 4 recommandations de produits spécifiques avec leurs noms exacts (pas de descriptions génériques) basées sur la description des préférences de l'utilisateur. Réponds uniquement avec un objet JSON contenant une clé 'recommendations' qui contient un tableau de chaînes de caractères représentant les noms des produits."
                },
                {
                    "role": "user",
                    "content": description
                }
            ],
            "response_format": {"type": "json_object"}
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            content = json.loads(result['choices'][0]['message']['content'])
            return content.get("recommendations", [])
        else:
            logger.error(f"Erreur OpenAI: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Exception lors de l'appel OpenAI: {e}")
        return None

# Implémentations locales
def local_sentiment_analysis(text):
    """Analyse de sentiment basique locale"""
    positive_words = ["bon", "super", "excellent", "génial", "magnifique", "heureux", "content", "satisfait", 
        "plaisir", "réussi", "parfait", "merci", "agréable", "sourire", "fantastique", "impressionnant"]
    negative_words = ["mauvais", "terrible", "horrible", "déçu", "décevant", "triste", "fâché", "insatisfait",
        "colère", "problème", "pire", "difficile", "échec", "peur", "détester", "pénible", "ennuyeux"]
  
    words = text.lower().split()
    pos_count = 0
    neg_count = 0
  
    for word in words:
        if any(pw in word for pw in positive_words):
            pos_count += 1
        if any(nw in word for nw in negative_words):
            neg_count += 1
  
    # Calcul simple du sentiment
    total_words = max(len(words), 1)
    pos_ratio = pos_count / total_words
    neg_ratio = neg_count / total_words
    sentiment_score = pos_ratio - neg_ratio
  
    # Convertir en note de 1 à 5
    rating = max(1, min(5, round((sentiment_score + 1) * 2.5)))
  
    # Calcul de la confiance
    word_confidence = min(1, len(words) / 50)
    match_confidence = min(1, (pos_count + neg_count) / max(len(words) * 0.2, 1))
  
    return {
        "rating": rating,
        "confidence": min(0.8, (word_confidence + match_confidence) / 2)
    }

def local_summarize(text):
    """Génération de résumé simple locale"""
    sentences = [s.strip() for s in text.split('.') if s.strip()]
    if len(sentences) <= 3:
        return text
    return '. '.join(sentences[:3]) + '.'

def local_recommendations(description):
    """Recommandations de produits basiques locales"""
    if "smartphone" in description.lower() or "téléphone" in description.lower():
        return ["iPhone 15 Pro", "Samsung Galaxy S23", "Google Pixel 7", "Xiaomi Redmi Note 12"]
    elif "ordinateur" in description.lower() or "laptop" in description.lower():
        return ["MacBook Air M2", "Dell XPS 15", "Lenovo ThinkPad X1", "HP Spectre x360"]
    elif "caméra" in description.lower() or "photo" in description.lower():
        return ["Canon EOS R6", "Sony Alpha A7 IV", "Nikon Z6 II", "Fujifilm X-T5"]
    else:
        return ["Smartphone haut de gamme", "Ordinateur portable performant", "Écouteurs sans fil", "Montre connectée", "Enceinte intelligente"]

# Routes API
@app.route('/')
def accueil():
    logger.info('Page d\'accueil visitée')
    return render_template('index.html')

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
def set_ai_origin():
    """Définir l'origine IA par défaut"""
    global current_origin
    data = request.json
    
    if not data or 'origin' not in data:
        return jsonify({
            "success": False,
            "message": "Origin parameter is required"
        }), 400
        
    origin = data['origin']
    if origin not in AI_ORIGINS:
        return jsonify({
            "success": False,
            "message": f"Invalid origin: {origin}. Must be one of: {', '.join(AI_ORIGINS.keys())}"
        }), 400
    
    current_origin = origin
    logger.info(f"AI origin set to: {origin}")
    
    return jsonify({
        "success": True,
        "data": {
            "origin": origin,
            "name": AI_ORIGINS[origin]["name"],
            "description": AI_ORIGINS[origin]["description"]
        },
        "message": f"Default AI origin set to {AI_ORIGINS[origin]['name']}"
    })

@app.route('/api/ai/sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyser le sentiment d'un texte"""
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({
            "success": False,
            "message": "Text parameter is required"
        }), 400
    
    text = data['text']
    origin = data.get('origin', current_origin)
    
    if origin not in AI_ORIGINS:
        return jsonify({
            "success": False,
            "message": f"Invalid origin: {origin}"
        }), 400
    
    logger.info(f"Analyzing sentiment with origin: {origin}")
    
    # Sélection de l'implémentation en fonction de l'origine demandée
    effective_origin = origin
    result = None
    warning = None
    
    if origin == "openai" or origin == "auto":
        # Essayer OpenAI en premier si demandé ou en mode auto
        result = openai_sentiment_analysis(text)
        if result:
            effective_origin = "openai"
        elif origin == "auto":
            # Fallback vers l'implémentation locale en mode auto
            result = local_sentiment_analysis(text)
            effective_origin = "local"
            warning = "Mode secours: Utilisation de l'implémentation locale (OpenAI indisponible)."
        else:
            # Erreur si OpenAI explicitement demandé mais non disponible
            return jsonify({
                "success": False,
                "message": "Service OpenAI non disponible. Réessayez plus tard ou utilisez l'origine 'local'."
            }), 503
    else:
        # Utilisation de l'implémentation locale si explicitement demandée
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
def generate_summary():
    """Générer un résumé d'un texte"""
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({
            "success": False,
            "message": "Text parameter is required"
        }), 400
    
    text = data['text']
    origin = data.get('origin', current_origin)
    
    if origin not in AI_ORIGINS:
        return jsonify({
            "success": False,
            "message": f"Invalid origin: {origin}"
        }), 400
    
    logger.info(f"Generating summary with origin: {origin}")
    
    # Sélection de l'implémentation en fonction de l'origine demandée
    effective_origin = origin
    summary = None
    warning = None
    
    if origin == "openai" or origin == "auto":
        # Essayer OpenAI en premier si demandé ou en mode auto
        summary = openai_summarize(text)
        if summary:
            effective_origin = "openai"
        elif origin == "auto":
            # Fallback vers l'implémentation locale en mode auto
            summary = local_summarize(text)
            effective_origin = "local"
            warning = "Mode secours: Utilisation de l'implémentation locale (OpenAI indisponible)."
        else:
            # Erreur si OpenAI explicitement demandé mais non disponible
            return jsonify({
                "success": False,
                "message": "Service OpenAI non disponible. Réessayez plus tard ou utilisez l'origine 'local'."
            }), 503
    else:
        # Utilisation de l'implémentation locale si explicitement demandée
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
def get_recommendations():
    """Générer des recommandations de produits"""
    data = request.json
    
    if not data or 'description' not in data:
        return jsonify({
            "success": False,
            "message": "Description parameter is required"
        }), 400
    
    description = data['description']
    origin = data.get('origin', current_origin)
    
    if origin not in AI_ORIGINS:
        return jsonify({
            "success": False,
            "message": f"Invalid origin: {origin}"
        }), 400
    
    logger.info(f"Generating recommendations with origin: {origin}")
    
    # Sélection de l'implémentation en fonction de l'origine demandée
    effective_origin = origin
    recommendations = None
    warning = None
    
    if origin == "openai" or origin == "auto":
        # Essayer OpenAI en premier si demandé ou en mode auto
        recommendations = openai_recommendations(description)
        if recommendations:
            effective_origin = "openai"
        elif origin == "auto":
            # Fallback vers l'implémentation locale en mode auto
            recommendations = local_recommendations(description)
            effective_origin = "local"
            warning = "Mode secours: Utilisation de l'implémentation locale (OpenAI indisponible)."
        else:
            # Erreur si OpenAI explicitement demandé mais non disponible
            return jsonify({
                "success": False,
                "message": "Service OpenAI non disponible. Réessayez plus tard ou utilisez l'origine 'local'."
            }), 503
    else:
        # Utilisation de l'implémentation locale si explicitement demandée
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

@app.errorhandler(404)
def page_non_trouvee(error):
    logger.error(f'Page non trouvée: {error}')
    return render_template('index.html', 
                         error="Page non trouvée. Retournez à l'accueil."), 404

@app.errorhandler(500)
def erreur_serveur(error):
    logger.error(f'Erreur serveur: {error}')
    return render_template('index.html', 
                         error="Erreur serveur. Veuillez réessayer plus tard."), 500

if __name__ == '__main__':
    # Utilisation du port 5001 pour ne pas interférer avec le serveur Express sur le port 5000
    port = int(os.environ.get('PORT', 5001))
    
    logger.info(f"==== API IA Multi-Origines (Flask) ====")
    logger.info(f"Démarrage du serveur sur le port {port}")
    logger.info(f"OpenAI API disponible: {'Oui' if OPENAI_API_KEY else 'Non'}")
    logger.info(f"URL: http://0.0.0.0:{port}")
    logger.info(f"======================================")
    
    app.run(host='0.0.0.0', port=port, debug=True)
