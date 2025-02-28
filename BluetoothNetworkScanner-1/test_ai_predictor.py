import json
import logging
import traceback

# Configuration du logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def print_section_header(title):
    logger.info(f"Début de l'analyse {title}")
    print(f"\n{'='*50}")
    print(f"Test de l'analyse {title}")
    print(f"{'='*50}")

def print_analysis_results(analysis):
    try:
        print("\n>> Détails de l'analyse:")
        print(json.dumps(analysis['details'], indent=2, ensure_ascii=False))

        print("\n>> Performances:")
        print(json.dumps(analysis['performances'], indent=2, ensure_ascii=False))

        if 'analyse_ia' in analysis:
            print("\n>> Recommandations IA:")
            print(analysis['analyse_ia'])

        print("\n" + "-"*50)
    except Exception as e:
        logger.error(f"Erreur lors de l'affichage des résultats: {str(e)}")
        logger.error(f"Traceback complet:\n{traceback.format_exc()}")
        raise

# Création d'un prédicteur
predictor = NetworkAIPredictor()

# Données de test pour différents scénarios
test_scenarios = {
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
    },
    'bluetooth_normal': {
        'device_type': 'audio',
        'signal': '-70',
        'address': '00:11:22:33:44:55',
        'version': '5.0',
        'profiles': ['A2DP', 'HFP'],
        'nearby_devices': ['dev1', 'dev2']
    },
    'bluetooth_faible': {
        'device_type': 'peripheral',
        'signal': '-90',
        'address': 'AA:BB:CC:DD:EE:FF',
        'version': '4.0',
        'profiles': ['HID'],
        'nearby_devices': ['dev1', 'dev2', 'dev3', 'dev4', 'dev5', 'dev6']
    },
    'lte_normal': {
        'operator': 'Test Mobile',
        'technology': 'LTE',
        'signal': '-85',
        'band': 'B7',
        'roaming': False
    },
    'lte_faible': {
        'operator': 'Test Mobile',
        'technology': 'LTE',
        'signal': '-105',
        'band': 'B20',
        'roaming': True
    },
    'esim_normal': {
        'operator': 'eSIM Op',
        'technology': '5G',
        'signal': '-75',
        'band': 'n78',
        'roaming': False
    }
}

logger.info("Démarrage des tests d'analyse réseau avec scénarios spécifiques")

try:
    # Test de l'analyse pour chaque scénario
    for scenario_name, data in test_scenarios.items():
        try:
            print_section_header(scenario_name.upper())
            logger.debug(f"Analyse du scénario {scenario_name}: {json.dumps(data)}")

            analysis = predictor.analyze_device_details(data)
            print_analysis_results(analysis)

            logger.info(f"Analyse du scénario {scenario_name} terminée avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse du scénario {scenario_name}: {str(e)}")
            logger.error(f"Traceback complet:\n{traceback.format_exc()}")
            continue

    print("\nTous les tests des scénarios spécifiques sont terminés avec succès!")
    logger.info("Fin des tests d'analyse réseau")

except Exception as e:
    logger.error(f"Erreur fatale lors des tests: {str(e)}")
    logger.error(f"Traceback complet:\n{traceback.format_exc()}")
    raise