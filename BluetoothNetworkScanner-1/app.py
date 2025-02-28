import logging
import os
import socket
import traceback
from flask import Flask, render_template, jsonify

# Configuration du logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.debug("Démarrage de l'application...")

try:
    # Vérification du port 5000
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 5000))
    if result == 0:
        logger.error("Le port 5000 est déjà utilisé!")
        raise Exception("Le port 5000 est déjà utilisé")
    sock.close()
    logger.debug("Port 5000 disponible")

    app = Flask(__name__)
    logger.debug("Application Flask créée")

    @app.route('/')
    def hello():
        logger.debug("Route '/' appelée")
        try:
            return render_template('index.html')
        except Exception as e:
            logger.error(f"Erreur lors du rendu du template: {str(e)}")
            return str(e), 500

    @app.route('/api/network_status')
    def network_status():
        logger.debug("Route '/api/network_status' appelée")
        try:
            # Données de test statiques
            status = {
                'wifi': {
                    'active': True,
                    'signal_quality': 0.85,
                    'best_network': {
                        'ssid': 'Test-Network',
                        'rssi': -65,
                    },
                    'networks_count': 3
                }
            }
            return jsonify(status)
        except Exception as e:
            logger.error(f"Erreur lors de la génération du statut: {str(e)}")
            return jsonify({'error': str(e)}), 500

    if __name__ == '__main__':
        logger.info("Démarrage du serveur Flask sur le port 5000")
        try:
            app.run(
                host='0.0.0.0',
                port=5000,
                debug=False  # Désactivé pour éviter les conflits
            )
        except Exception as e:
            logger.error(f"Erreur au démarrage du serveur: {str(e)}")
            logger.error(f"Traceback:\n{traceback.format_exc()}")
            raise

except Exception as e:
    logger.error(f"Erreur: {str(e)}")
    logger.error(f"Traceback:\n{traceback.format_exc()}")
    raise