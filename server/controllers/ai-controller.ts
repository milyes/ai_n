import { Request, Response, NextFunction } from "express";
import { analyzeSentiment, summarizeText, generateProductRecommendations } from "../services/ai-service";
import * as z from "zod";

// Schéma de validation pour l'analyse de sentiment
const sentimentSchema = z.object({
  text: z.string().min(1, "Le texte est requis").max(5000, "Le texte ne doit pas dépasser 5000 caractères")
});

// Schéma de validation pour la génération de résumé
const summarySchema = z.object({
  text: z.string().min(50, "Le texte doit contenir au moins 50 caractères").max(10000, "Le texte ne doit pas dépasser 10000 caractères")
});

// Schéma de validation pour les recommandations de produits
const recommendationSchema = z.object({
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(1000, "La description ne doit pas dépasser 1000 caractères")
});

/**
 * Analyse le sentiment d'un texte
 */
export const analyzeTextSentiment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = sentimentSchema.parse(req.body);
    
    const result = await analyzeSentiment(text);
    
    // Si nous avons utilisé la réponse de secours, indiquer un avertissement
    const warning = result.fromFallback 
      ? "L'API OpenAI n'est pas disponible actuellement. Les résultats sont générés par un système de secours et peuvent être moins précis."
      : undefined;
    
    res.json({
      success: true,
      data: {
        rating: result.rating,
        confidence: result.confidence
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
    const { text } = summarySchema.parse(req.body);
    
    const result = await summarizeText(text);
    
    // Si nous avons utilisé la réponse de secours, indiquer un avertissement
    const warning = result.fromFallback 
      ? "L'API OpenAI n'est pas disponible actuellement. Les résultats sont générés par un système de secours et peuvent être moins précis."
      : undefined;
    
    res.json({
      success: true,
      data: { summary: result.summary },
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
    const { description } = recommendationSchema.parse(req.body);
    
    const result = await generateProductRecommendations(description);
    
    // Si nous avons utilisé la réponse de secours, indiquer un avertissement
    const warning = result.fromFallback 
      ? "L'API OpenAI n'est pas disponible actuellement. Les recommandations sont générées par un système de secours et peuvent être moins précises."
      : undefined;
    
    res.json({
      success: true,
      data: { recommendations: result.recommendations },
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