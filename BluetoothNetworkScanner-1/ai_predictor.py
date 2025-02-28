import os
from typing import Dict, List, Any
import warnings
import json
from datetime import datetime
from openai import OpenAI

class NetworkAIPredictor:
    def __init__(self, model_path: str = 'modele_ia.h5'):
        """Initialisation du prédicteur IA avec mode dégradé si le modèle n'est pas disponible"""
        self.model = None
        self.model_path = model_path
        self.is_fallback_mode = True
        self.stats_file = 'network_stats.json'
        self.network_types = {
            'wifi': [],
            'bluetooth': [],
            'lte': [],
            'esim': [],
            # VPN sera géré localement dans une future mise à jour
            'vpn': []
        }

        # Initialisation du client OpenAI pour l'analyse avancée
        self.openai_client = OpenAI()

    def analyze_device_details(self, device_info: Dict[str, Any]) -> Dict[str, Any]:
        """Analyser en détail un appareil spécifique avec plus de précision"""
        device_type = self.classify_network(device_info)
        analysis = {
            'type': device_type,
            'details': {},
            'risques': [],
            'recommandations': [],
            'historique_connexions': [],
            'qualite_service': {},
            'performances': {}
        }

        if device_type == 'wifi':
            analysis['details'] = self._analyze_wifi_network(device_info)
            analysis['performances'] = self._analyze_wifi_performance(device_info)
        elif device_type == 'bluetooth':
            analysis['details'] = self._analyze_bluetooth_device(device_info)
            analysis['performances'] = self._analyze_bluetooth_performance(device_info)
        elif device_type in ['lte', 'esim']:
            analysis['details'] = self._analyze_cellular_connection(device_info)
            analysis['performances'] = self._analyze_cellular_performance(device_info)

        # Analyse avancée avec GPT pour les recommandations en français
        if 'OPENAI_API_KEY' in os.environ:
            try:
                prompt = f"""Analyser en détail les aspects suivants pour cette connexion réseau:
                1. Risques de sécurité potentiels
                2. Recommandations d'optimisation
                3. Bonnes pratiques spécifiques
                4. Points d'attention particuliers

                Données de connexion: {json.dumps(analysis['details'])}"""

                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Vous êtes un expert en sécurité et optimisation réseau."},
                        {"role": "user", "content": prompt}
                    ]
                )
                ai_analysis = response.choices[0].message.content
                analysis['analyse_ia'] = ai_analysis
            except Exception as e:
                warnings.warn(f"Erreur lors de l'analyse GPT: {str(e)}")
                # Ajouter des recommandations par défaut en français selon le type de réseau
                default_analysis = {
                    'wifi': """
                    Recommandations par défaut pour le réseau WiFi:
                    1. Vérifiez régulièrement les mises à jour de sécurité
                    2. Utilisez un mot de passe fort et unique
                    3. Activez le filtrage MAC si disponible
                    4. Surveillez les appareils connectés inconnus
                    """,
                    'bluetooth': """
                    Recommandations par défaut pour la connexion Bluetooth:
                    1. Désactivez le Bluetooth quand il n'est pas utilisé
                    2. Évitez l'appairage dans les lieux publics
                    3. Mettez à jour le firmware des appareils
                    4. Utilisez le mode "non découvrable" par défaut
                    """,
                    'lte': """
                    Recommandations par défaut pour la connexion cellulaire:
                    1. Activez le chiffrement des données
                    2. Évitez les réseaux cellulaires inconnus
                    3. Utilisez un VPN sur les réseaux publics
                    4. Surveillez votre consommation de données
                    """,
                    'esim': """
                    Recommandations par défaut pour la connexion eSIM:
                    1. Vérifiez la compatibilité des opérateurs
                    2. Sauvegardez vos profils eSIM
                    3. Maintenez votre appareil à jour
                    4. Activez l'authentification forte
                    """
                }
                analysis['analyse_ia'] = default_analysis.get(device_type, 
                    "Analyse IA non disponible. Veuillez réessayer plus tard.")

        return analysis

    def _analyze_wifi_performance(self, network: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse détaillée des performances WiFi"""
        return {
            'latence': self._estimate_latency(network),
            'stabilite': self._evaluate_connection_stability(network),
            'interferences': self._detect_interference_level(network),
            'qualite_signal': self._calculate_signal_quality(
                float(str(network.get('signal', '-100')).split()[0]), 
                'wifi'
            ),
            'bande_passante_estimee': self._estimate_bandwidth(network),
            'congestion': self._evaluate_congestion(network)
        }

    def _analyze_bluetooth_performance(self, device: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse détaillée des performances Bluetooth"""
        return {
            'portee_estimee': self._estimate_bluetooth_range(device),
            'stabilite_connexion': self._evaluate_bluetooth_stability(device),
            'qualite_signal': self._calculate_signal_quality(
                float(str(device.get('signal', '-90')).split()[0]), 
                'bluetooth'
            ),
            'interferences': self._detect_bluetooth_interference(device),
            'compatibilite': self._check_bluetooth_compatibility(device)
        }

    def _analyze_cellular_performance(self, connection: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse détaillée des performances cellulaires"""
        return {
            'force_signal': self._calculate_signal_quality(
                float(str(connection.get('signal', '-100')).split()[0]), 
                'lte' if 'LTE' in str(connection.get('technology', '')) else 'esim'
            ),
            'latence_reseau': self._estimate_cellular_latency(connection),
            'stabilite': self._evaluate_cellular_stability(connection),
            'qualite_service': self._evaluate_qos(connection),
            'couverture': self._analyze_coverage(connection)
        }

    def _estimate_latency(self, network: Dict[str, Any]) -> str:
        """Estimation de la latence réseau"""
        signal_quality = self._calculate_signal_quality(
            float(str(network.get('signal', '-100')).split()[0]), 
            'wifi'
        )
        if signal_quality > 0.8:
            return "Excellente (<10ms)"
        elif signal_quality > 0.6:
            return "Bonne (10-30ms)"
        elif signal_quality > 0.4:
            return "Moyenne (30-50ms)"
        return "Élevée (>50ms)"

    def _detect_interference_level(self, network: Dict[str, Any]) -> str:
        """Détection du niveau d'interférence"""
        noise_level = network.get('noise', -90)
        if noise_level > -70:
            return "Élevé"
        elif noise_level > -80:
            return "Moyen"
        return "Faible"

    def _estimate_bandwidth(self, network: Dict[str, Any]) -> str:
        """Estimation de la bande passante"""
        if 'bandwidth' in network:
            return f"{network['bandwidth']} Mbps"
        # Estimation basée sur le type de réseau et la qualité du signal
        signal_quality = self._calculate_signal_quality(
            float(str(network.get('signal', '-100')).split()[0]), 
            'wifi'
        )
        if signal_quality > 0.8:
            return ">100 Mbps"
        elif signal_quality > 0.6:
            return "50-100 Mbps"
        elif signal_quality > 0.4:
            return "20-50 Mbps"
        return "<20 Mbps"

    def _evaluate_congestion(self, network: Dict[str, Any]) -> str:
        """Évaluation de la congestion réseau"""
        channel_utilization = network.get('channel_utilization', 0.5)
        if channel_utilization > 0.8:
            return "Élevée"
        elif channel_utilization > 0.5:
            return "Moyenne"
        return "Faible"

    def _estimate_bluetooth_range(self, device: Dict[str, Any]) -> str:
        """Estimation de la portée Bluetooth"""
        signal_strength = float(str(device.get('signal', '-90')).split()[0])
        if signal_strength > -60:
            return "Excellente (>10m)"
        elif signal_strength > -70:
            return "Bonne (5-10m)"
        elif signal_strength > -80:
            return "Moyenne (2-5m)"
        return "Faible (<2m)"

    def _evaluate_bluetooth_stability(self, device: Dict[str, Any]) -> str:
        """Évaluation de la stabilité de la connexion Bluetooth"""
        signal_quality = self._calculate_signal_quality(
            float(str(device.get('signal', '-90')).split()[0]), 
            'bluetooth'
        )
        if signal_quality > 0.8:
            return "Très stable"
        elif signal_quality > 0.6:
            return "Stable"
        elif signal_quality > 0.4:
            return "Variable"
        return "Instable"

    def _detect_bluetooth_interference(self, device: Dict[str, Any]) -> str:
        """Détection des interférences Bluetooth"""
        # Analyse basée sur le nombre d'appareils à proximité et la qualité du signal
        nearby_devices = len(device.get('nearby_devices', []))
        if nearby_devices > 10:
            return "Risque élevé d'interférences"
        elif nearby_devices > 5:
            return "Risque modéré d'interférences"
        return "Faible risque d'interférences"

    def _check_bluetooth_compatibility(self, device: Dict[str, Any]) -> Dict[str, Any]:
        """Vérification de la compatibilité Bluetooth"""
        version = device.get('version', '4.0')
        profiles = device.get('profiles', [])
        return {
            'version': version,
            'compatibilite': "Bonne" if float(version) >= 4.0 else "Limitée",
            'profiles_supportes': profiles
        }

    def _estimate_cellular_latency(self, connection: Dict[str, Any]) -> str:
        """Estimation de la latence cellulaire"""
        technology = connection.get('technology', '').upper()
        if 'LTE' in technology or '5G' in technology:
            return "Faible (<30ms)"
        elif '4G' in technology:
            return "Moyenne (30-50ms)"
        return "Élevée (>50ms)"

    def _evaluate_cellular_stability(self, connection: Dict[str, Any]) -> str:
        """Évaluation de la stabilité cellulaire"""
        signal_quality = self._calculate_signal_quality(
            float(str(connection.get('signal', '-100')).split()[0]), 
            'lte'
        )
        if signal_quality > 0.8:
            return "Excellente"
        elif signal_quality > 0.6:
            return "Bonne"
        elif signal_quality > 0.4:
            return "Moyenne"
        return "Faible"

    def _evaluate_qos(self, connection: Dict[str, Any]) -> Dict[str, Any]:
        """Évaluation de la qualité de service"""
        return {
            'latence': self._estimate_cellular_latency(connection),
            'stabilite': self._evaluate_cellular_stability(connection),
            'couverture': self._analyze_coverage(connection),
            'type_reseau': connection.get('technology', 'Inconnu')
        }

    def _analyze_coverage(self, connection: Dict[str, Any]) -> str:
        """Analyse de la couverture réseau"""
        signal_strength = float(str(connection.get('signal', '-100')).split()[0])
        if signal_strength > -70:
            return "Excellente"
        elif signal_strength > -85:
            return "Bonne"
        elif signal_strength > -100:
            return "Moyenne"
        return "Faible"


    def _evaluate_wifi_security(self, network: Dict[str, Any]) -> str:
        """Évaluer le niveau de sécurité d'un réseau WiFi"""
        encryption = network.get('encryption', '').lower()
        if not encryption or encryption == 'none':
            return 'Dangereux - Réseau ouvert'
        elif 'wep' in encryption:
            return 'Faible - WEP déprécié'
        elif 'wpa2' in encryption and 'enterprise' in encryption:
            return 'Excellent - WPA2 Enterprise'
        elif 'wpa3' in encryption:
            return 'Très bon - WPA3'
        elif 'wpa2' in encryption:
            return 'Bon - WPA2'
        return 'Moyen - Sécurité basique'

    def _evaluate_encryption_strength(self, encryption: str) -> str:
        """Évaluer la force du chiffrement"""
        encryption = encryption.lower()
        if 'wpa3' in encryption:
            return 'Forte'
        elif 'wpa2' in encryption and 'enterprise' in encryption:
            return 'Forte'
        elif 'wpa2' in encryption:
            return 'Moyenne'
        return 'Faible'

    def _detect_wifi_band(self, network: Dict[str, Any]) -> str:
        """Détecter la bande WiFi utilisée"""
        frequency = network.get('frequency', 0)
        if frequency > 5000:
            return '5GHz'
        elif frequency > 2400:
            return '2.4GHz'
        return 'Inconnue'

    def _detect_bluetooth_class(self, device: Dict[str, Any]) -> str:
        """Détecter la classe d'appareil Bluetooth"""
        device_class = device.get('class', '').lower()
        if 'audio' in device_class:
            return 'Audio'
        elif 'phone' in device_class:
            return 'Téléphone'
        elif 'computer' in device_class:
            return 'Ordinateur'
        return 'Autre'

    def _detect_manufacturer(self, mac_address: str) -> str:
        """Détecter le fabricant à partir de l'adresse MAC"""
        # Implémentation basique - à enrichir avec une base de données OUI
        manufacturers = {
            '00:11:22': 'Apple',
            'AA:BB:CC': 'Samsung',
            '12:34:56': 'Google'
        }
        prefix = mac_address[:8]
        return manufacturers.get(prefix, 'Inconnu')

    def _evaluate_connection_stability(self, network: Dict[str, Any]) -> str:
        """Évaluer la stabilité de la connexion"""
        signal_quality = self._calculate_signal_quality(
            float(str(network.get('signal', '-100')).split()[0]), 
            'wifi'
        )
        if signal_quality > 0.8:
            return 'Excellente'
        elif signal_quality > 0.6:
            return 'Bonne'
        elif signal_quality > 0.4:
            return 'Moyenne'
        return 'Faible'

    def classify_network(self, network_info: Dict[str, Any]) -> str:
        """Classifier le type de réseau basé sur ses caractéristiques"""
        if 'ssid' in network_info:
            return 'wifi'
        elif 'device_type' in network_info or 'bluetooth_address' in str(network_info):
            return 'bluetooth'
        elif 'operator' in network_info and 'technology' in network_info:
            return 'lte' if 'LTE' in str(network_info['technology']) else 'esim'
        return 'unknown'

    def _calculate_signal_quality(self, signal_strength: float, network_type: str) -> float:
        """Calculate quality score based on signal strength and network type"""
        thresholds = {
            'wifi': {'excellent': -50, 'poor': -80},
            'bluetooth': {'excellent': -60, 'poor': -90},
            'lte': {'excellent': -70, 'poor': -100},
            'esim': {'excellent': -70, 'poor': -100}
        }

        threshold = thresholds.get(network_type, {'excellent': -50, 'poor': -100})

        if signal_strength >= threshold['excellent']:
            return 1.0
        elif signal_strength <= threshold['poor']:
            return 0.0
        else:
            return (signal_strength - threshold['poor']) / (threshold['excellent'] - threshold['poor'])

    def _analyze_wifi_network(self, network: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse détaillée d'un réseau WiFi"""
        details = {
            'ssid': network.get('ssid', 'Unknown'),
            'security_level': self._evaluate_wifi_security(network),
            'signal_quality': self._calculate_signal_quality(
                float(str(network.get('signal', '-100')).split()[0]), 
                'wifi'
            ),
            'band': self._detect_wifi_band(network),
            'connection_stability': self._evaluate_connection_stability(network)
        }

        if network.get('encryption'):
            details['encryption_details'] = {
                'type': network['encryption'],
                'strength': self._evaluate_encryption_strength(network['encryption'])
            }

        return details

    def _analyze_bluetooth_device(self, device: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse détaillée d'un appareil Bluetooth"""
        return {
            'device_class': self._detect_bluetooth_class(device),
            'pairing_status': device.get('paired', False),
            'signal_strength': self._calculate_signal_quality(
                float(str(device.get('signal', '-90')).split()[0]), 
                'bluetooth'
            ),
            'services': device.get('services', []),
            'manufacturer': self._detect_manufacturer(device.get('address', ''))
        }

    def _analyze_cellular_connection(self, connection: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse détaillée d'une connexion cellulaire"""
        return {
            'operator': connection.get('operator', 'Unknown'),
            'technology': connection.get('technology', 'Unknown'),
            'signal_strength': self._calculate_signal_quality(
                float(str(connection.get('signal', '-100')).split()[0]), 
                'lte' if 'LTE' in str(connection.get('technology', '')) else 'esim'
            ),
            'band': connection.get('band', 'Unknown'),
            'roaming': connection.get('roaming', False)
        }

    def analyze_networks(self, networks_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyser une liste de réseaux et générer des statistiques"""
        stats = {
            'total_networks': len(networks_data),
            'network_types': {t: 0 for t in self.network_types.keys()},
            'average_signal': {},
            'security_stats': {
                'encrypted': 0,
                'open': 0
            },
            'timestamp': datetime.now().isoformat(),
            'detailed_analysis': []
        }

        for network in networks_data:
            detailed_analysis = self.analyze_device_details(network)
            stats['detailed_analysis'].append(detailed_analysis)
            network_type = self.classify_network(network)
            stats['network_types'][network_type] += 1

            # Calcul du signal moyen par type
            if 'signal' in network:
                signal = float(str(network['signal']).split()[0])
                if network_type not in stats['average_signal']:
                    stats['average_signal'][network_type] = []
                stats['average_signal'][network_type].append(signal)

            # Statistiques de sécurité pour WiFi
            if network_type == 'wifi':
                if network.get('encryption') and network['encryption'].lower() != 'none':
                    stats['security_stats']['encrypted'] += 1
                else:
                    stats['security_stats']['open'] += 1

        # Calcul des moyennes
        for net_type, signals in stats['average_signal'].items():
            if signals:
                stats['average_signal'][net_type] = sum(signals) / len(signals)

        # Sauvegarder les statistiques
        self._save_stats(stats)
        return stats

    def _save_stats(self, stats: Dict[str, Any]) -> None:
        """Sauvegarder les statistiques dans un fichier JSON"""
        try:
            # Charger l'historique existant
            history = []
            if os.path.exists(self.stats_file):
                with open(self.stats_file, 'r') as f:
                    history = json.load(f)

            # Ajouter les nouvelles stats
            history.append(stats)

            # Garder seulement les 100 dernières entrées
            history = history[-100:]

            # Sauvegarder
            with open(self.stats_file, 'w') as f:
                json.dump(history, f, indent=2)
        except Exception as e:
            warnings.warn(f"Erreur lors de la sauvegarde des stats: {str(e)}")

    def get_network_stats(self) -> List[Dict[str, Any]]:
        """Récupérer l'historique des statistiques"""
        try:
            if os.path.exists(self.stats_file):
                with open(self.stats_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            warnings.warn(f"Erreur lors de la lecture des stats: {str(e)}")
        return []

    def predict_network_quality(self, network_data: Dict[str, Any]) -> Dict[str, float]:
        """Prédire la qualité du réseau en utilisant soit le modèle AI soit l'heuristique"""
        try:
            if not self.is_fallback_mode and self.model is not None:
                import numpy as np
                features = []
                for net_type, info in network_data.items():
                    if isinstance(info, dict) and 'signal' in info:
                        signal = float(str(info['signal']).split()[0])
                        quality = self._calculate_signal_quality(signal, net_type)
                        features.append(quality)
                    else:
                        features.append(0.0)

                prediction = self.model.predict(np.array([features]), verbose=0)
                return {
                    "quality_score": float(prediction[0][0]),
                    "reliability": 0.95
                }

            # Mode dégradé - utilisation d'heuristiques
            total_quality = 0.0
            count = 0
            for net_type, info in network_data.items():
                if isinstance(info, dict) and 'signal' in info:
                    signal = float(str(info['signal']).split()[0])
                    quality = self._calculate_signal_quality(signal, net_type)
                    total_quality += quality
                    count += 1

            if count > 0:
                return {
                    "quality_score": total_quality / count,
                    "reliability": 0.7
                }

            return {
                "quality_score": 0.0,
                "reliability": 0.5
            }

        except Exception as e:
            print(f"Erreur lors de la prédiction: {str(e)}")
            return {
                "quality_score": 0.0,
                "reliability": 0.0
            }

    def _extract_signal_strength(self, network_info: str) -> float:
        """Extract signal strength from network info string"""
        try:
            if "Signal" in network_info:
                signal_str = network_info.split("Signal")[1].split("dBm")[0]
                return float(signal_str.strip(" :=-"))
        except:
            pass
        return -100.0  # Default poor signal if not found