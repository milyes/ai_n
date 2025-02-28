import logging
import socket
import traceback

# Configuration du logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Test du port 8001
try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex(('127.0.0.1', 8001))
    if result == 0:
        logger.error("Le port 8001 est déjà utilisé!")
        raise Exception("Le port 8001 est déjà utilisé")
    sock.close()
    logger.info("Le port 8001 est disponible")
except Exception as e:
    logger.error(f"Erreur lors du test du port: {str(e)}")
    logger.error(f"Traceback:\n{traceback.format_exc()}")
    raise

# Application Flask minimale
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Le serveur de test fonctionne!"

if __name__ == '__main__':
    try:
        logger.info("Démarrage du serveur Flask minimal")
        app.run(host='0.0.0.0', port=8001, debug=True)
    except Exception as e:
        logger.error(f"Erreur au démarrage du serveur: {str(e)}")
        logger.error(f"Traceback complet:\n{traceback.format_exc()}")
        raise