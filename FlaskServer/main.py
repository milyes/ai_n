from flask import Flask, render_template, request, jsonify
import logging
import requests
import os
import json
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
    
    # Pour cette démonstration, nous utilisons toujours l'implémentation locale
    logger.info(f"Analyzing sentiment with origin: {origin}")
    result = local_sentiment_analysis(text)
    
    return jsonify({
        "success": True,
        "data": {
            "rating": result["rating"],
            "confidence": result["confidence"],
            "origin": "local"
        },
        "warning": "Mode secours: Utilisation de l'implémentation locale pour l'analyse de sentiment."
    })

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
    
    # Pour cette démonstration, nous utilisons toujours l'implémentation locale
    logger.info(f"Generating summary with origin: {origin}")
    summary = local_summarize(text)
    
    return jsonify({
        "success": True,
        "data": {
            "summary": summary,
            "origin": "local"
        },
        "warning": "Mode secours: Utilisation de l'implémentation locale pour la génération de résumé."
    })

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
    
    # Pour cette démonstration, nous utilisons toujours l'implémentation locale
    logger.info(f"Generating recommendations with origin: {origin}")
    recommendations = local_recommendations(description)
    
    return jsonify({
        "success": True,
        "data": {
            "recommendations": recommendations,
            "origin": "local"
        },
        "warning": "Mode secours: Utilisation de l'implémentation locale pour les recommandations."
    })

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
    app.run(host='0.0.0.0', port=5000, debug=True)
