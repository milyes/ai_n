import json
import os
from typing import List, Dict, Optional

class NetworkDataManager:
    def __init__(self):
        self.config_dir = os.path.expanduser("~/.network_detect")
        self.wifi_results_file = os.path.join(self.config_dir, "wifi_results.json")
        
    def load_wifi_data(self) -> List[Dict]:
        """Charge les données WiFi à partir du fichier JSON"""
        if not os.path.exists(self.wifi_results_file):
            return []
        
        try:
            with open(self.wifi_results_file, "r") as file:
                return json.load(file)
        except json.JSONDecodeError:
            return []

    def score_network(self, network: Dict) -> float:
        """Calcule un score pour un réseau basé sur le RSSI et la sécurité"""
        signal_score = max(-float(network.get("rssi", -100)), 0)
        security_score = 20 if "WPA" in str(network.get("ssid", "")) else 0
        return signal_score + security_score

    def get_best_network(self) -> Optional[Dict]:
        """Retourne le meilleur réseau disponible"""
        wifi_data = self.load_wifi_data()
        if not wifi_data:
            return None
        return max(wifi_data, key=self.score_network)

    def get_network_status(self) -> Dict:
        """Retourne le statut actuel de tous les réseaux"""
        wifi_data = self.load_wifi_data()
        best_network = self.get_best_network()
        
        return {
            'wifi': {
                'active': bool(wifi_data),
                'best_network': best_network,
                'networks_count': len(wifi_data),
                'signal_quality': self._calculate_signal_quality(best_network) if best_network else 0
            }
        }

    def _calculate_signal_quality(self, network: Dict) -> float:
        """Calcule la qualité du signal sur une échelle de 0 à 1"""
        if not network:
            return 0
        rssi = float(network.get("rssi", -100))
        # Convertit RSSI (-100 à -50) en score (0 à 1)
        return max(0, min(1, (rssi + 100) / 50))
