import OpenAI from "openai";

// Module AI est en mode démonstration - pas d'appels API réels
// Cette constante contrôle si on utilise l'API OpenAI ou le système de secours
const USE_FALLBACK_SYSTEM = true; // Mettre à false pour activer les appels API OpenAI réels

// Types pour l'origine des requêtes IA
export type AIOrigin = "openai" | "local" | "xai" | "auto";

// Configuration des origines d'IA disponibles
export const AI_ORIGINS = {
  openai: {
    name: "OpenAI",
    description: "Utilise l'API OpenAI (GPT-4o)",
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-4o"
  },
  xai: {
    name: "xAI",
    description: "Utilise l'API xAI (Grok)",
    baseURL: "https://api.x.ai/v1",
    defaultModel: "grok-2-1212"
  },
  local: {
    name: "Local",
    description: "Utilise l'implémentation locale sans appel d'API externe",
    isOffline: true
  },
  auto: {
    name: "Auto",
    description: "Sélectionne automatiquement la meilleure option disponible",
    isAuto: true
  }
}

// Origine par défaut
let currentOrigin: AIOrigin = "auto";

// Fonction pour obtenir un client OpenAI configuré selon l'origine spécifiée
export function getAIClient(origin?: AIOrigin): OpenAI | null {
  // Utiliser l'origine spécifiée ou l'origine actuelle
  const selectedOrigin = origin || currentOrigin;
  
  // Si origine auto, choisir en priorité OpenAI, puis xAI, puis local
  let effectiveOrigin = selectedOrigin;
  if (selectedOrigin === "auto") {
    effectiveOrigin = USE_FALLBACK_SYSTEM ? "local" : "openai";
  }
  
  // Si on est en mode local, retourner null
  if (effectiveOrigin === "local" || USE_FALLBACK_SYSTEM) {
    return null;
  }
  
  // Configuration pour OpenAI
  if (effectiveOrigin === "openai") {
    return new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: AI_ORIGINS.openai.baseURL
    });
  }
  
  // Configuration pour xAI
  if (effectiveOrigin === "xai") {
    return new OpenAI({ 
      apiKey: process.env.XAI_API_KEY, 
      baseURL: AI_ORIGINS.xai.baseURL
    });
  }
  
  return null;
}

// Définir l'origine de l'IA
export function setAIOrigin(origin: AIOrigin): void {
  currentOrigin = origin;
  console.log(`Origine de l'IA définie sur: ${AI_ORIGINS[origin].name}`);
}

// Récupérer l'origine actuelle de l'IA
export function getAIOrigin(): AIOrigin {
  return currentOrigin;
}

// Initialiser le client OpenAI avec l'origine par défaut
const openai = getAIClient();

// Constantes pour les réponses de secours
const FALLBACK_SENTIMENT = { rating: 3, confidence: 0.5 };
const FALLBACK_SUMMARY = "Résumé non disponible. Veuillez réessayer plus tard.";
const FALLBACK_RECOMMENDATIONS = [
  "Smartphone dernière génération",
  "Ordinateur portable performant",
  "Écouteurs sans fil",
  "Montre connectée",
  "Enceinte intelligente"
];

// Interface pour les erreurs d'API OpenAI
interface OpenAIError extends Error {
  status?: number;
  code?: string;
  type?: string;
}

/**
 * Analyse de sentiment d'un texte sans appel API
 * Implementation locale basique
 */
function localSentimentAnalysis(text: string): {
  rating: number,
  confidence: number
} {
  // Analyse de sentiment basique (très simplifiée)
  const positiveWords = ["bon", "super", "excellent", "génial", "magnifique", "heureux", "content", "satisfait", 
    "plaisir", "réussi", "parfait", "merci", "agréable", "sourire", "fantastique", "impressionnant"];
  const negativeWords = ["mauvais", "terrible", "horrible", "déçu", "décevant", "triste", "fâché", "insatisfait",
    "colère", "problème", "pire", "difficile", "échec", "peur", "détester", "pénible", "ennuyeux"];
  
  const words = text.toLowerCase().split(/\s+/);
  let posCount = 0;
  let negCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) posCount++;
    if (negativeWords.some(nw => word.includes(nw))) negCount++;
  });
  
  // Calcul simple du sentiment
  const totalWords = Math.max(words.length, 1);
  const posRatio = posCount / totalWords;
  const negRatio = negCount / totalWords;
  const sentimentScore = posRatio - negRatio;
  
  // Convertir en note de 1 à 5
  const rating = Math.max(1, Math.min(5, Math.round((sentimentScore + 1) * 2.5)));
  
  // Calcul de la confiance basé sur le nombre de mots analysés
  const wordConfidence = Math.min(1, words.length / 50);
  const matchConfidence = Math.min(1, (posCount + negCount) / Math.max(words.length * 0.2, 1));
  
  return {
    rating,
    confidence: Math.min(0.8, (wordConfidence + matchConfidence) / 2)
  };
}

/**
 * Génération de résumé sans appel API
 * Implémentation locale basique
 */
function localSummarize(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Si le texte est court, le retourner tel quel
  if (sentences.length <= 3) {
    return text;
  }
  
  // Compter les occurrences de mots pour trouver les phrases importantes
  const wordCounts: Record<string, number> = {};
  const stopWords = ["le", "la", "les", "un", "une", "des", "et", "ou", "à", "de", "du", "ce", "cette", "ces", "est"];
  
  // Prétraitement - compter les occurrences de mots
  sentences.forEach(sentence => {
    const words = sentence.trim().toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 2 && !stopWords.includes(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });
  
  // Notation des phrases selon l'importance des mots
  const scoredSentences = sentences.map((sentence, index) => {
    const words = sentence.trim().toLowerCase().split(/\s+/);
    let score = 0;
    
    // Bonus pour les premières phrases
    if (index < 3) score += 3 - index;
    
    // Score basé sur les mots importants
    words.forEach(word => {
      if (wordCounts[word]) {
        score += wordCounts[word];
      }
    });
    
    // Normaliser par longueur
    score = score / Math.max(words.length, 1);
    
    return { text: sentence, score, index };
  });
  
  // Sélection des 3 meilleures phrases
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.index - b.index); // Remettre dans l'ordre original
  
  return topSentences.map(s => s.text.trim()).join('. ') + '.';
}

/**
 * Génération de recommandations de produits sans appel API
 * Implémentation locale basique
 */
function localRecommendations(description: string): string[] {
  // Catalogue de produits par catégorie
  const productCatalog: Record<string, string[]> = {
    "téléphone": [
      "Smartphone Samsung Galaxy S23", 
      "iPhone 15 Pro", 
      "Google Pixel 7", 
      "Xiaomi Redmi Note 12", 
      "OnePlus 11",
      "Asus ROG Phone 7"
    ],
    "ordinateur": [
      "Laptop Dell XPS 15", 
      "MacBook Air M2", 
      "ThinkPad X1 Carbon", 
      "HP Spectre x360", 
      "Asus ZenBook 14",
      "Surface Laptop 5"
    ],
    "musique": [
      "Écouteurs Sony WH-1000XM5", 
      "Casque Bose QuietComfort 45", 
      "Enceinte JBL Charge 5", 
      "AirPods Pro 2", 
      "Platine vinyle Audio-Technica LP120X",
      "Enceinte Marshall Stanmore III"
    ],
    "photo": [
      "Appareil photo Canon EOS R6", 
      "Sony Alpha A7 IV", 
      "GoPro Hero 11 Black", 
      "Nikon Z6 II", 
      "Objectif Sigma 24-70mm f/2.8",
      "Stabilisateur DJI Ronin RS 3"
    ],
    "tablette": [
      "iPad Pro 12.9", 
      "Samsung Galaxy Tab S9", 
      "Microsoft Surface Pro 9", 
      "Lenovo Tab P12 Pro", 
      "Xiaomi Pad 6",
      "Amazon Fire HD 10"
    ],
    "jeu": [
      "PlayStation 5", 
      "Xbox Series X", 
      "Nintendo Switch OLED", 
      "Manette Xbox Elite Series 2", 
      "Casque VR Meta Quest 3",
      "Steam Deck OLED"
    ],
    "maison": [
      "Aspirateur robot Roomba j7+", 
      "Thermostat intelligent Nest", 
      "Ampoules connectées Philips Hue", 
      "Assistant vocal Amazon Echo", 
      "Serrure intelligente Yale",
      "Caméra de sécurité Ring"
    ],
    "sport": [
      "Montre Garmin Forerunner 955", 
      "Vélo électrique VanMoof S3", 
      "Tapis de course NordicTrack", 
      "Raquette de tennis Head", 
      "Ballon de football Adidas",
      "Chaussures de course Nike Pegasus"
    ]
  };
  
  // Rechercher des mots-clés dans la description
  let matchedRecommendations: string[] = [];
  let categorieTrouvee = false;
  
  Object.entries(productCatalog).forEach(([category, products]) => {
    if (description.toLowerCase().includes(category.toLowerCase())) {
      // Prendre 3 produits aléatoires de cette catégorie
      const randomProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 3);
      matchedRecommendations.push(...randomProducts);
      categorieTrouvee = true;
    }
  });
  
  // Si aucune catégorie n'est trouvée, utiliser des mots-clés pour détecter les intérêts
  if (!categorieTrouvee) {
    const interestsKeywords: Record<string, string[]> = {
      "qualité": ["téléphone", "photo"],
      "performance": ["ordinateur", "jeu"],
      "divertissement": ["musique", "jeu"],
      "travail": ["ordinateur", "tablette"],
      "voyage": ["téléphone", "photo", "tablette"],
      "étudiant": ["ordinateur", "tablette"],
      "créativité": ["tablette", "photo", "ordinateur"],
      "famille": ["maison", "tablette", "jeu"],
      "exercice": ["sport", "musique"]
    };
    
    // Détecter les intérêts potentiels
    const potentialCategories: string[] = [];
    
    Object.entries(interestsKeywords).forEach(([interest, categories]) => {
      if (description.toLowerCase().includes(interest.toLowerCase())) {
        potentialCategories.push(...categories);
      }
    });
    
    // Sélectionner des produits des catégories d'intérêt identifiées
    if (potentialCategories.length > 0) {
      // Choisir jusqu'à 2 catégories uniques
      const uniqueCategories = Array.from(new Set(potentialCategories)).slice(0, 2);
      
      uniqueCategories.forEach(category => {
        if (productCatalog[category]) {
          // Prendre 2-3 produits par catégorie d'intérêt
          const randomProducts = [...productCatalog[category]].sort(() => 0.5 - Math.random()).slice(0, 2);
          matchedRecommendations.push(...randomProducts);
        }
      });
    }
  }
  
  // Si toujours aucune recommandation pertinente, utiliser les produits par défaut
  if (matchedRecommendations.length === 0) {
    // Prendre quelques produits aléatoires de différentes catégories
    const allCategories = Object.keys(productCatalog);
    const randomCategories = [...allCategories].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    randomCategories.forEach(category => {
      const randomProduct = productCatalog[category][Math.floor(Math.random() * productCatalog[category].length)];
      matchedRecommendations.push(randomProduct);
    });
    
    // Si par hasard on n'a toujours rien, utiliser les recommandations par défaut
    if (matchedRecommendations.length === 0) {
      return FALLBACK_RECOMMENDATIONS;
    }
  }
  
  // Limiter à 5 recommandations maximum
  return matchedRecommendations.slice(0, 5);
}

/**
 * Analyse de sentiment d'un texte
 * @param text Le texte à analyser
 * @param origin L'origine à utiliser pour l'analyse (OpenAI, xAI, local, auto)
 * @returns Un objet contenant une note de 1 à 5 et un niveau de confiance entre 0 et 1
 */
export async function analyzeSentiment(
  text: string, 
  origin?: AIOrigin
): Promise<{
  rating: number,
  confidence: number,
  fromFallback?: boolean,
  origin?: string
}> {
  // Déterminer l'origine à utiliser
  const selectedOrigin = origin || currentOrigin;
  let effectiveOrigin: AIOrigin = selectedOrigin;
  
  // Si origine auto, choisir en priorité OpenAI, puis xAI, puis local
  if (selectedOrigin === "auto") {
    // Si le mode fallback est activé, utiliser local
    if (USE_FALLBACK_SYSTEM) {
      effectiveOrigin = "local";
    } else {
      // Sinon, vérifier les clés API disponibles
      if (process.env.OPENAI_API_KEY) {
        effectiveOrigin = "openai";
      } else if (process.env.XAI_API_KEY) {
        effectiveOrigin = "xai";
      } else {
        effectiveOrigin = "local";
      }
    }
  }
  
  // Si on est en mode local ou fallback, utiliser l'implémentation locale
  if (effectiveOrigin === "local" || USE_FALLBACK_SYSTEM) {
    console.log("Mode démo: Utilisation de l'analyse de sentiment locale");
    const result = localSentimentAnalysis(text);
    return {
      ...result,
      fromFallback: true,
      origin: "local"
    };
  }
  
  // Obtenir le bon client selon l'origine
  const client = getAIClient(effectiveOrigin);
  if (!client) {
    console.log(`Client IA non disponible pour ${effectiveOrigin}, utilisation du mode local`);
    const result = localSentimentAnalysis(text);
    return {
      ...result,
      fromFallback: true,
      origin: "local"
    };
  }
  
  // Obtenir le modèle approprié selon l'origine
  const model = effectiveOrigin === "openai" 
    ? AI_ORIGINS.openai.defaultModel
    : AI_ORIGINS.xai.defaultModel;
  
  // Tenter l'appel API avec fallback en cas d'erreur
  try {
    console.log(`Analyse de sentiment via ${AI_ORIGINS[effectiveOrigin].name} (${model})`);
    
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Vous êtes un expert en analyse de sentiment. Analysez le sentiment du texte et fournissez une note de 1 à 5 étoiles et un score de confiance entre 0 et 1. Répondez avec un JSON dans ce format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || JSON.stringify(FALLBACK_SENTIMENT));

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
      origin: effectiveOrigin
    };
  } catch (error) {
    console.error(`Erreur lors de l'analyse de sentiment via ${effectiveOrigin}:`, error);
    
    // Utiliser l'analyse locale en cas d'erreur
    console.log("Utilisation de l'analyse de sentiment locale suite à une erreur");
    const result = localSentimentAnalysis(text);
    return {
      ...result,
      fromFallback: true,
      origin: "local"
    };
  }
}

/**
 * Génération de résumé d'un texte
 * @param text Le texte à résumer
 * @param origin L'origine à utiliser pour l'analyse (OpenAI, xAI, local, auto)
 * @returns Le résumé généré
 */
export async function summarizeText(
  text: string,
  origin?: AIOrigin
): Promise<{ 
  summary: string, 
  fromFallback?: boolean,
  origin?: string 
}> {
  // Déterminer l'origine à utiliser
  const selectedOrigin = origin || currentOrigin;
  let effectiveOrigin: AIOrigin = selectedOrigin;
  
  // Si origine auto, choisir en priorité OpenAI, puis xAI, puis local
  if (selectedOrigin === "auto") {
    // Si le mode fallback est activé, utiliser local
    if (USE_FALLBACK_SYSTEM) {
      effectiveOrigin = "local";
    } else {
      // Sinon, vérifier les clés API disponibles
      if (process.env.OPENAI_API_KEY) {
        effectiveOrigin = "openai";
      } else if (process.env.XAI_API_KEY) {
        effectiveOrigin = "xai";
      } else {
        effectiveOrigin = "local";
      }
    }
  }
  
  // Si on est en mode local ou fallback, utiliser l'implémentation locale
  if (effectiveOrigin === "local" || USE_FALLBACK_SYSTEM) {
    console.log("Mode démo: Utilisation du résumé local");
    return {
      summary: localSummarize(text),
      fromFallback: true,
      origin: "local"
    };
  }
  
  // Obtenir le bon client selon l'origine
  const client = getAIClient(effectiveOrigin);
  if (!client) {
    console.log(`Client IA non disponible pour ${effectiveOrigin}, utilisation du mode local`);
    return {
      summary: localSummarize(text),
      fromFallback: true,
      origin: "local"
    };
  }
  
  // Obtenir le modèle approprié selon l'origine
  const model = effectiveOrigin === "openai" 
    ? AI_ORIGINS.openai.defaultModel
    : AI_ORIGINS.xai.defaultModel;
  
  // Tenter l'appel API avec fallback en cas d'erreur
  try {
    console.log(`Génération de résumé via ${AI_ORIGINS[effectiveOrigin].name} (${model})`);
    
    const prompt = `Veuillez résumer le texte suivant de façon concise tout en conservant les points clés:\n\n${text}`;

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    return {
      summary: response.choices[0].message.content || FALLBACK_SUMMARY,
      origin: effectiveOrigin
    };
  } catch (error) {
    console.error(`Erreur lors de la génération du résumé via ${effectiveOrigin}:`, error);
    
    // Utiliser le résumé local en cas d'erreur
    console.log("Utilisation du résumé local suite à une erreur");
    return {
      summary: localSummarize(text),
      fromFallback: true,
      origin: "local"
    };
  }
}

/**
 * Génération de recommandations de produits basée sur une description
 * @param description La description des préférences de l'utilisateur
 * @param origin L'origine à utiliser pour l'analyse (OpenAI, xAI, local, auto)
 * @returns Une liste de recommandations de produits
 */
export async function generateProductRecommendations(
  description: string,
  origin?: AIOrigin
): Promise<{ 
  recommendations: string[], 
  fromFallback?: boolean,
  origin?: string
}> {
  // Déterminer l'origine à utiliser
  const selectedOrigin = origin || currentOrigin;
  let effectiveOrigin: AIOrigin = selectedOrigin;
  
  // Si origine auto, choisir en priorité OpenAI, puis xAI, puis local
  if (selectedOrigin === "auto") {
    // Si le mode fallback est activé, utiliser local
    if (USE_FALLBACK_SYSTEM) {
      effectiveOrigin = "local";
    } else {
      // Sinon, vérifier les clés API disponibles
      if (process.env.OPENAI_API_KEY) {
        effectiveOrigin = "openai";
      } else if (process.env.XAI_API_KEY) {
        effectiveOrigin = "xai";
      } else {
        effectiveOrigin = "local";
      }
    }
  }
  
  // Si on est en mode local ou fallback, utiliser l'implémentation locale
  if (effectiveOrigin === "local" || USE_FALLBACK_SYSTEM) {
    console.log("Mode démo: Utilisation des recommandations locales");
    return {
      recommendations: localRecommendations(description),
      fromFallback: true,
      origin: "local"
    };
  }
  
  // Obtenir le bon client selon l'origine
  const client = getAIClient(effectiveOrigin);
  if (!client) {
    console.log(`Client IA non disponible pour ${effectiveOrigin}, utilisation du mode local`);
    return {
      recommendations: localRecommendations(description),
      fromFallback: true,
      origin: "local"
    };
  }
  
  // Obtenir le modèle approprié selon l'origine
  const model = effectiveOrigin === "openai" 
    ? AI_ORIGINS.openai.defaultModel
    : AI_ORIGINS.xai.defaultModel;
  
  // Tenter l'appel API avec fallback en cas d'erreur
  try {
    console.log(`Génération de recommandations via ${AI_ORIGINS[effectiveOrigin].name} (${model})`);
    
    const prompt = `En tant qu'expert en recommandation de produits, générez une liste de 5 recommandations de produits basées sur cette description: "${description}". Répondez avec un objet JSON qui contient une seule propriété "recommendations" qui est un tableau de chaînes de caractères.`;

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    return {
      recommendations: result.recommendations || [],
      origin: effectiveOrigin
    };
  } catch (error) {
    console.error(`Erreur lors de la génération des recommandations via ${effectiveOrigin}:`, error);
    
    // Utiliser les recommandations locales en cas d'erreur
    console.log("Utilisation des recommandations locales suite à une erreur");
    return {
      recommendations: localRecommendations(description),
      fromFallback: true,
      origin: "local"
    };
  }
}