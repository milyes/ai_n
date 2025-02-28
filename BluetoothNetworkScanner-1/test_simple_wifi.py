import logging
import json
from ai_predictor import NetworkAIPredictor

# Configuration du logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_wifi_scenarios():
    predictor = NetworkAIPredictor()
    
    # Scénarios WiFi
    wifi_scenarios = {
        'wifi_normal': {
            'ssid': 'WiFi-Test-Normal',
            'signal': '-65',
            'encryption': 'WPA2',
            'frequency': 5200,
            'noise': -85,
            'channel_utilization': 0.4
        },
        'wifi_faible': {
            'ssid': 'WiFi-Test-Faible',
            'signal': '-85',
            'encryption': 'WPA2',
            'frequency': 2400,
            'noise': -95,
            'channel_utilization': 0.7
        },
        'wifi_non_securise': {
            'ssid': 'WiFi-Test-Ouvert',
            'signal': '-70',
            'encryption': 'none',
            'frequency': 2400,
            'noise': -90,
            'channel_utilization': 0.3
        }
    }

    logger.info("Début des tests des scénarios WiFi")
    
    for scenario_name, data in wifi_scenarios.items():
        try:
            logger.info(f"\nTest du scénario: {scenario_name}")
            logger.debug(f"Données du scénario: {json.dumps(data, indent=2)}")
            
            analysis = predictor.analyze_device_details(data)
            
            logger.info(f"\nRésultats pour {scenario_name}:")
            logger.info(f"Détails: {json.dumps(analysis['details'], indent=2)}")
            logger.info(f"Performances: {json.dumps(analysis['performances'], indent=2)}")
            
            if 'analyse_ia' in analysis:
                logger.info(f"Analyse IA:\n{analysis['analyse_ia']}")
            
            # Vérifications spécifiques selon le scénario
            if scenario_name == 'wifi_faible':
                assert float(data['signal']) <= -85, "Le signal devrait être faible"
                assert 'faible' in analysis['performances']['bande_passante_estimee'].lower(), \
                    "La bande passante devrait être faible"
            
            elif scenario_name == 'wifi_non_securise':
                assert 'none' in data['encryption'].lower(), "Le réseau devrait être non sécurisé"
                assert 'danger' in analysis['details']['security_level'].lower(), \
                    "Le niveau de sécurité devrait indiquer un danger"
            
            logger.info(f"Test {scenario_name} réussi!")
            
        except Exception as e:
            logger.error(f"Erreur lors du test {scenario_name}: {str(e)}")
            raise

    logger.info("\nTous les tests WiFi sont terminés avec succès!")

if __name__ == '__main__':
    test_wifi_scenarios()
