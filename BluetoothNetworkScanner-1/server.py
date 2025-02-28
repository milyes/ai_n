import os
import json
import logging
from flask import Flask, jsonify, render_template

# Configuration du logging en français
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
CONFIG_DIR = os.path.expanduser("~/.network_detect")
WIFI_RESULTS_FILE = os.path.join(CONFIG_DIR, "wifi_results.json")

app = Flask(__name__)

def load_wifi_data():
    """Charge les données WiFi à partir du fichier JSON"""
    if not os.path.exists(WIFI_RESULTS_FILE):
        return None, "Aucun fichier de résultats WiFi trouvé"

    try:
        with open(WIFI_RESULTS_FILE, "r") as file:
            data = json.load(file)
            return [net for net in data if net.get("ssid")], None
    except json.JSONDecodeError:
        return None, "Fichier JSON invalide"
    except Exception as e:
        return None, f"Erreur lors de la lecture du fichier: {str(e)}"

def score_network(network):
    """Calcule un score pour un réseau basé sur le RSSI et la sécurité"""
    signal_score = max(-float(network.get("rssi", -100)), 0)
    security_score = 20 if "WPA" in str(network.get("ssid", "")) else 0
    return signal_score + security_score

def recommend_best_network(wifi_data):
    """Retourne le meilleur réseau disponible"""
    if not wifi_data:
        return None
    return max(wifi_data, key=score_network)

@app.route('/')
def index():
    """Page d'accueil avec l'interface utilisateur"""
    logger.info("Affichage de la page d'accueil")
    return render_template('index.html')

@app.route('/api/network_status')
def network_status():
    """Endpoint pour obtenir le statut de tous les réseaux"""
    logger.info("Récupération du statut des réseaux")

    wifi_data, wifi_error = load_wifi_data()
    wifi_status = {
        'actif': bool(wifi_data and not wifi_error),
        'qualite_signal': 0.0,
        'meilleur_reseau': None,
        'nombre_reseaux': 0
    }

    if wifi_data:
        best_network = recommend_best_network(wifi_data)
        if best_network:
            wifi_status.update({
                'qualite_signal': max(0, min(1, (-float(best_network.get("rssi", -100)) + 100) / 50)),
                'meilleur_reseau': {
                    'nom': best_network.get('ssid'),
                    'puissance': best_network.get('rssi'),
                },
                'nombre_reseaux': len(wifi_data)
            })

    return jsonify({
        'wifi': wifi_status,
        'bluetooth': {
            'actif': True,
            'qualite_signal': 0.75,
            'appareils_connectes': 2,
            'mode': 'découvrable'
        },
        'lte': {
            'actif': True,
            'qualite_signal': 0.85,
            'operateur': 'Orange',
            'type': '4G+'
        },
        'esim': {
            'actif': False,
            'message': 'Non configuré'
        }
    })

@app.route('/api/wifi')
def wifi_analysis():
    """Endpoint pour l'analyse détaillée des réseaux WiFi"""
    logger.info("Analyse détaillée des réseaux WiFi")
    wifi_data, error = load_wifi_data()

    if error:
        logger.error(f"Erreur lors de l'analyse WiFi: {error}")
        return jsonify({
            'statut': 'erreur',
            'message': error
        }), 400

    if not wifi_data:
        logger.warning("Aucun réseau WiFi trouvé")
        return jsonify({
            'statut': 'erreur',
            'message': 'Aucun réseau trouvé'
        }), 404

    best_network = recommend_best_network(wifi_data)
    logger.info(f"Analyse terminée - {len(wifi_data)} réseaux trouvés")

    return jsonify({
        'statut': 'succès',
        'reseaux': {
            'total': len(wifi_data),
            'meilleur_reseau': {
                'nom': best_network.get('ssid'),
                'puissance': best_network.get('rssi'),
                'frequence': best_network.get('frequency_mhz'),
                'score': score_network(best_network)
            } if best_network else None,
            'tous_les_reseaux': wifi_data
        }
    })

if __name__ == '__main__':
    # ALWAYS serve the app on port 5000
    logger.info("Démarrage du serveur sur le port 5000...")
    app.run(host='0.0.0.0', port=5000)