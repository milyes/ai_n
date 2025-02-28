import logging
import traceback

# Configuration du logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Application Flask minimale
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Le serveur Flask fonctionne!"

if __name__ == '__main__':
    try:
        # Vérification du port 5000
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 5000))
        if result == 0:
            logger.error("Le port 5000 est déjà utilisé!")
            raise Exception("Le port 5000 est déjà utilisé")
        sock.close()

        logger.info("Démarrage du serveur Flask minimal sur le port 5000")
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True)
    except Exception as e:
        logger.error(f"Erreur fatale lors du démarrage du serveur: {str(e)}")
        logger.error(f"Traceback complet:\n{traceback.format_exc()}")
        raise
