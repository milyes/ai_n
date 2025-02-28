# Analyse du Module IA avec Spécification d'Origine

Ce document détaille l'implémentation et le fonctionnement du système IA multi-origines, qui permet de basculer dynamiquement entre différentes sources d'intelligence artificielle.

## Fonctionnalités Implémentées

### 1. Origines Multiples d'IA
Le système prend en charge quatre origines différentes pour l'IA:

- **OpenAI**: Utilise l'API OpenAI avec GPT-4o pour des analyses sophistiquées
- **xAI**: Utilise l'API xAI avec le modèle Grok pour une alternative performante
- **Local**: Implémentation locale qui ne requiert aucune API externe
- **Auto**: Sélectionne automatiquement la meilleure option disponible en fonction des configurations et disponibilités

### 2. Fallback Automatique
Le système comprend un mécanisme de fallback intelligent:

- En cas d'indisponibilité d'API
- En cas d'erreur lors de l'appel d'API
- En cas d'absence de clés API
- Mode démo utilisant uniquement l'implémentation locale

### 3. Configuration Dynamique
L'application permet de changer l'origine par défaut via API:

- Possibilité de définir l'origine globale pour toutes les requêtes
- Possibilité de spécifier une origine spécifique par requête
- Changement à chaud sans redémarrage du serveur

### 4. Fonctionnalités IA Disponibles

Toutes les fonctionnalités IA intègrent le support multi-origines:

- **Analyse de sentiment**: Évaluation du sentiment d'un texte (1-5 étoiles avec niveau de confiance)
- **Génération de résumés**: Création de résumés automatiques de textes
- **Recommandations de produits**: Suggestions de produits basées sur des descriptions

## Architecture Technique

### Services AI

Le service AI (`ai-service.ts`) gère:
- La configuration des origines
- La logique de sélection automatique
- Les appels API avec gestion d'erreurs
- L'implémentation locale des fonctionnalités

### Contrôleur API

Le contrôleur AI (`ai-controller.ts`) fournit:
- Validation des données avec Zod
- Gestion du changement d'origine
- Exposition des fonctionnalités via API REST
- Informations sur l'origine utilisée dans les réponses

### Implémentation Locale

Pour chaque fonctionnalité, une implémentation locale existe:
- **localSentimentAnalysis**: Analyse basique basée sur des listes de mots
- **localSummarize**: Extraction de phrases clés basée sur la fréquence des mots
- **localRecommendations**: Système de recommandation basé sur des mots-clés et un catalogue de produits

## Tests et Validation

Un script de test complet (`test-ai-origins.js`) permet de valider:
- Le changement d'origine via API
- L'utilisation de chaque origine pour les différentes fonctionnalités
- La transition vers le mode fallback en cas d'erreur

## Utilisation du Système

### Exemples d'API

#### Configuration de l'origine par défaut
```
GET /api/ai/config/origin
POST /api/ai/config/origin
Body: { "origin": "openai" | "xai" | "local" | "auto" }
```

#### Analyse de sentiment
```
POST /api/ai/sentiment
Body: { 
  "text": "Texte à analyser", 
  "origin": "openai" | "xai" | "local" | "auto" (optionnel)
}
```

#### Génération de résumé
```
POST /api/ai/summary
Body: { 
  "text": "Texte à résumer", 
  "origin": "openai" | "xai" | "local" | "auto" (optionnel)
}
```

#### Recommandations de produits
```
POST /api/ai/recommendations
Body: { 
  "description": "Description des préférences", 
  "origin": "openai" | "xai" | "local" | "auto" (optionnel)
}
```

## Améliorations Futures

- Intégration d'une nouvelle origine (Claude, Gemini, etc.)
- Statistiques de performance par origine
- Interface utilisateur pour changer l'origine
- Amélioration des implémentations locales
- Cache des résultats pour optimiser les performances