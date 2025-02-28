# Guide de référence pour le système d'IA

## Table des matières
1. [Introduction](#introduction)
2. [Architecture du système](#architecture-du-système)
3. [Mode de fonctionnement](#mode-de-fonctionnement)
4. [Fonctionnalités disponibles](#fonctionnalités-disponibles)
5. [Test du système](#test-du-système)
6. [Gestion des erreurs](#gestion-des-erreurs)
7. [Modification du système](#modification-du-système)

## Introduction
Ce guide explique le fonctionnement du système d'IA dans notre application. Le système est conçu pour offrir des fonctionnalités intelligentes sans dépendre d'API externes coûteuses, en utilisant un mécanisme de secours local.

## Architecture du système
Notre système d'IA suit une architecture hybride :

1. **Mode primaire** : Utilisation de l'API OpenAI (désactivée par défaut)
2. **Mode de secours** : Algorithmes locaux simples mais efficaces

Fichiers clés :
- `server/services/ai-service.ts` : Services et logique d'IA
- `server/controllers/ai-controller.ts` : Points d'entrée API
- `client/src/pages/ai.tsx` : Interface utilisateur

## Mode de fonctionnement
Le système fonctionne actuellement en **mode local** uniquement, déterminé par la constante `USE_FALLBACK_SYSTEM = true` dans `server/services/ai-service.ts`.

```typescript
// Cette constante contrôle si on utilise l'API OpenAI ou le système de secours
const USE_FALLBACK_SYSTEM = true; // true = mode local uniquement
```

## Fonctionnalités disponibles

### 1. Analyse de sentiment
Détermine si un texte est positif, négatif ou neutre, avec un score de confiance.

**Mode local :** Analyse basée sur un dictionnaire de mots-clés positifs et négatifs.

```typescript
// Exemple d'appel API
POST /api/ai/analyze-sentiment
Body: { "text": "J'adore ce produit, c'est fantastique!" }
```

### 2. Génération de résumé
Crée un résumé concis d'un texte plus long.

**Mode local :** Extraction des phrases principales en fonction de mots-clés et de leur position.

```typescript
// Exemple d'appel API
POST /api/ai/summarize
Body: { "text": "Long texte à résumer..." }
```

### 3. Recommandations de produits
Génère des suggestions de produits basées sur une description.

**Mode local :** Suggestions prédéfinies classifiées par catégories.

```typescript
// Exemple d'appel API
POST /api/ai/recommend-products
Body: { "description": "Je cherche des produits pour la cuisine" }
```

## Test du système

### Test via l'interface utilisateur
1. Accédez à la page d'IA à l'adresse `/ai`
2. Utilisez les formulaires disponibles pour tester chaque fonctionnalité
3. Vérifiez que les réponses sont cohérentes

### Test via API (avec curl)
```bash
# Test d'analyse de sentiment
curl -X POST http://localhost:5000/api/ai/analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{"text":"Ce produit est excellent"}'

# Test de résumé
curl -X POST http://localhost:5000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor."}'

# Test de recommandations
curl -X POST http://localhost:5000/api/ai/recommend-products \
  -H "Content-Type: application/json" \
  -d '{"description":"cuisine"}'
```

## Gestion des erreurs
Notre système gère plusieurs types d'erreurs :

1. **Entrées invalides** : Validation via Zod
2. **Erreurs serveur** : Réponses 500 avec messages explicatifs
3. **Passage en mode de secours** : Automatique en cas d'erreur API

## Modification du système

### Activer les appels API OpenAI
Pour utiliser l'API OpenAI (attention aux coûts) :

1. Modifiez `USE_FALLBACK_SYSTEM` à `false` dans `server/services/ai-service.ts`
2. Assurez-vous que `OPENAI_API_KEY` est correctement défini dans les variables d'environnement

### Améliorer le système local
Pour améliorer les algorithmes locaux :

1. Modifiez les fonctions `localSentimentAnalysis`, `localSummarize` ou `localRecommendations` dans `server/services/ai-service.ts`
2. Ajoutez des dictionnaires plus complets ou des algorithmes plus sophistiqués

### Ajouter de nouvelles fonctionnalités
Pour ajouter de nouvelles capacités d'IA :

1. Créez une nouvelle fonction dans `server/services/ai-service.ts`
2. Ajoutez un nouveau contrôleur dans `server/controllers/ai-controller.ts`
3. Enregistrez la route dans `server/routes.ts`
4. Mettez à jour l'interface utilisateur dans `client/src/pages/ai.tsx`