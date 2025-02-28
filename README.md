# NetSecure Pro avec API IA Multi-Origines

Une plateforme sophistiquée combinant sécurité réseau avancée et intelligence artificielle multi-origines pour analyser, visualiser et sécuriser tous les appareils connectés.

![NetSecure Pro](https://cdn.pixabay.com/photo/2017/01/18/08/25/social-media-1989152_960_720.jpg)

## Fonctionnalités principales

### 1. NetSecure Pro - Sécurité réseau

- **Détection des appareils** - Identifiez automatiquement tous les appareils connectés à votre réseau
- **Analyse de sécurité** - Évaluez le niveau de sécurité global et les vulnérabilités individuelles
- **Topologie interactive** - Visualisez la structure de votre réseau et les interconnexions
- **Alertes en temps réel** - Recevez des notifications pour les nouveaux appareils et les menaces potentielles
- **Rapports détaillés** - Générez des rapports complets sur l'état de santé de votre réseau

### 2. API IA Multi-Origines

- **Analyse intelligente** - Utilisez l'IA pour analyser le trafic réseau et identifier les comportements suspects
- **Sources d'IA multiples** - Choisissez entre OpenAI, implémentation locale ou sélection automatique
- **Mécanisme de repli** - Bascule automatique vers des alternatives en cas d'indisponibilité d'un service
- **Résumé de vulnérabilités** - Obtenez des résumés clairs des rapports techniques complexes
- **Recommandations personnalisées** - Recevez des suggestions adaptées à votre infrastructure

## Architecture technique

### Double serveur

Le projet fonctionne avec une architecture à double serveur :

- **Serveur Express (NodeJS)** sur le port 5000
  - Gestion des utilisateurs, des produits et des commandes
  - API principale et interface utilisateur React

- **Serveur Flask (Python)** sur le port 5001
  - Services IA multi-origines
  - Interface NetSecure Pro
  - Traitement des données de sécurité réseau

### Schéma fonctionnel

```
Client Web <-> Express Server (5000) <-> Database
                 |
                 v
          Flask Server (5001) <-> OpenAI API
                 |
                 v
          Local AI Algorithms
```

## Origines d'IA disponibles

| Origine | Description | Avantages | Inconvénients |
|---------|-------------|-----------|---------------|
| OpenAI  | Service IA externe utilisant GPT-4o | Haute qualité, comprend le contexte | Coût, dépendance externe |
| Local   | Algorithmes intégrés | Gratuit, rapide, toujours disponible | Qualité limitée |
| Auto    | Sélection automatique avec repli | Meilleur compromis | Performances variables |

## Installation

### Prérequis

- NodeJS 20+
- Python 3.11+
- Base de données PostgreSQL (optionnelle)

### Installation du serveur Express (principal)

```bash
# Installation des dépendances NodeJS
npm install

# Démarrage du serveur Express
npm run dev
```

### Installation du serveur Flask (IA & sécurité)

```bash
# Accéder au dossier Flask
cd FlaskServer

# Installation des dépendances Python
pip install -r requirements.txt

# Démarrage du serveur Flask
./run_flask.sh
```

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
# OpenAI API (optionnel, pour les fonctionnalités IA avancées)
OPENAI_API_KEY=votre_clé_api_openai

# Configuration base de données (optionnel)
DATABASE_URL=postgres://utilisateur:mot_de_passe@hôte:port/base_de_données
```

## Utilisation

1. Accédez à l'interface principale via `http://localhost:5000`
2. Pour interagir directement avec l'API IA et les fonctionnalités NetSecure Pro : `http://localhost:5001`

### API IA Multi-Origines

L'API IA est accessible via les endpoints suivants :

```
GET  /api/ai/config/origin          # Obtenir l'origine IA actuelle
POST /api/ai/config/origin          # Définir l'origine IA
POST /api/ai/sentiment              # Analyser le sentiment d'un texte/trafic
POST /api/ai/summary                # Résumer un texte/rapport
POST /api/ai/recommendations        # Obtenir des recommandations de sécurité
```

## Développement

### Structure du projet

```
.
├── FlaskServer/                    # Serveur Flask (IA & sécurité)
│   ├── static/                     # Fichiers statiques
│   ├── templates/                  # Templates HTML
│   ├── main.py                     # Application Flask principale
│   ├── requirements.txt            # Dépendances Python
│   └── run_flask.sh                # Script de démarrage
│
├── client/                         # Frontend React
│   ├── src/                        # Code source React
│   └── public/                     # Fichiers statiques
│
├── server/                         # Serveur Express principal
│   ├── controllers/                # Contrôleurs Express
│   ├── middlewares/                # Middlewares
│   ├── services/                   # Services
│   ├── index.ts                    # Point d'entrée Express
│   └── routes.ts                   # Définition des routes
│
├── shared/                         # Code partagé
│   └── schema.ts                   # Schémas de données
│
├── package.json                    # Configuration NPM
└── README.md                       # Documentation
```

### Personnalisation

- Modifiez `FlaskServer/templates/*.html` pour personnaliser l'interface NetSecure Pro
- Ajustez `FlaskServer/static/style.css` pour modifier l'apparence 
- Consultez `FlaskServer/ANALYSE_TECHNIQUE.md` pour plus de détails sur le module IA

## Sécurité et confidentialité

- Les données d'analyse réseau sont traitées localement par défaut
- L'utilisation d'OpenAI est optionnelle et nécessite une clé API
- Aucune donnée de sécurité réseau n'est stockée en externe

## Support et contact

Pour toute question, bug ou suggestion, veuillez créer une issue dans ce dépôt ou contacter l'équipe de support à l'adresse support@netsecurepro.com

## Licence

Copyright © 2025 NetSecure Pro. Tous droits réservés.