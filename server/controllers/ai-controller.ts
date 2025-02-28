import { Request, Response, NextFunction } from "express";
import { analyzeSentiment, summarizeText, generateProductRecommendations, setAIOrigin, getAIOrigin, AIOrigin, AI_ORIGINS } from "../services/ai-service";
import * as z from "zod";

// Schéma de validation pour les origines d'IA
const aiOriginEnum = z.enum(["openai", "local", "xai", "auto"]);

// Schéma de validation pour l'analyse de sentiment
const sentimentSchema = z.object({
  text: z.string().min(1, "Le texte est requis").max(5000, "Le texte ne doit pas dépasser 5000 caractères"),
  origin: aiOriginEnum.optional()
});

// Schéma de validation pour la génération de résumé
const summarySchema = z.object({
  text: z.string().min(50, "Le texte doit contenir au moins 50 caractères").max(10000, "Le texte ne doit pas dépasser 10000 caractères"),
  origin: aiOriginEnum.optional()
});

// Schéma de validation pour les recommandations de produits
const recommendationSchema = z.object({
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(1000, "La description ne doit pas dépasser 1000 caractères"),
  origin: aiOriginEnum.optional()
});

// Schéma pour la configuration de l'origine IA par défaut
const originConfigSchema = z.object({
  origin: aiOriginEnum
});

/**
 * Définir l'origine IA par défaut pour toutes les requêtes
 */
export const setDefaultAIOrigin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { origin } = originConfigSchema.parse(req.body);
    
    // Définir la nouvelle origine par défaut
    setAIOrigin(origin as AIOrigin);
    
    // Retourner la configuration actuelle
    res.json({
      success: true,
      data: {
        origin,
        name: AI_ORIGINS[origin as AIOrigin].name,
        description: AI_ORIGINS[origin as AIOrigin].description
      },
      message: `L'origine IA par défaut a été définie sur "${AI_ORIGINS[origin as AIOrigin].name}"`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Origine IA invalide",
        errors: error.errors
      });
    } else {
      next(error);
    }
  }
};

/**
 * Obtenir l'origine IA par défaut actuelle
 */
export const getDefaultAIOrigin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtenir l'origine actuelle
    const origin = getAIOrigin();
    
    res.json({
      success: true,
      data: {
        origin,
        name: AI_ORIGINS[origin].name,
        description: AI_ORIGINS[origin].description
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyse le sentiment d'un texte
 */
export const analyzeTextSentiment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, origin } = sentimentSchema.parse(req.body);
    
    const result = await analyzeSentiment(text, origin as AIOrigin);
    
    // Message d'avertissement en fonction de l'origine utilisée
    let warning: string | undefined;
    if (result.fromFallback) {
      warning = `Mode secours: Utilisation de l'implémentation locale pour l'analyse de sentiment.`;
    } else if (result.origin) {
      const originInfo = AI_ORIGINS[result.origin as AIOrigin];
      // Vérifier si c'est une origine externe (pas locale)
      if (originInfo && result.origin !== "local") {
        warning = `Analyse effectuée via ${originInfo.name}.`;
      }
    }
    
    res.json({
      success: true,
      data: {
        rating: result.rating,
        confidence: result.confidence,
        origin: result.origin
      },
      warning
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Données d'entrée invalides",
        errors: error.errors
      });
    } else {
      next(error);
    }
  }
};

/**
 * Génère un résumé d'un texte
 */
export const generateSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, origin } = summarySchema.parse(req.body);
    
    const result = await summarizeText(text, origin as AIOrigin);
    
    // Message d'avertissement en fonction de l'origine utilisée
    let warning: string | undefined;
    if (result.fromFallback) {
      warning = `Mode secours: Utilisation de l'implémentation locale pour la génération de résumé.`;
    } else if (result.origin) {
      const originInfo = AI_ORIGINS[result.origin as AIOrigin];
      // Vérifier si c'est une origine externe (pas locale)
      if (originInfo && result.origin !== "local") {
        warning = `Résumé généré via ${originInfo.name}.`;
      }
    }
    
    res.json({
      success: true,
      data: { 
        summary: result.summary,
        origin: result.origin
      },
      warning
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Données d'entrée invalides",
        errors: error.errors
      });
    } else {
      next(error);
    }
  }
};

/**
 * Génère des recommandations de produits
 */
export const getProductRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, origin } = recommendationSchema.parse(req.body);
    
    const result = await generateProductRecommendations(description, origin as AIOrigin);
    
    // Message d'avertissement en fonction de l'origine utilisée
    let warning: string | undefined;
    if (result.fromFallback) {
      warning = `Mode secours: Utilisation de l'implémentation locale pour les recommandations.`;
    } else if (result.origin) {
      const originInfo = AI_ORIGINS[result.origin as AIOrigin];
      // Vérifier si c'est une origine externe (pas locale)
      if (originInfo && result.origin !== "local") {
        warning = `Recommandations générées via ${originInfo.name}.`;
      }
    }
    
    res.json({
      success: true,
      data: { 
        recommendations: result.recommendations,
        origin: result.origin
      },
      warning
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Données d'entrée invalides",
        errors: error.errors
      });
    } else {
      next(error);
    }
  }
};