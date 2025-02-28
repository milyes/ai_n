import OpenAI from "openai";

// Initialiser le client OpenAI avec la clé API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyse de sentiment d'un texte
 * @param text Le texte à analyser
 * @returns Un objet contenant une note de 1 à 5 et un niveau de confiance entre 0 et 1
 */
export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // le modèle OpenAI le plus récent, sorti en mai 2024
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

    const result = JSON.parse(response.choices[0].message.content || '{"rating": 3, "confidence": 0.5}');

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error) {
    console.error("Erreur lors de l'analyse de sentiment:", error);
    throw new Error("Échec de l'analyse de sentiment: " + (error as Error).message);
  }
}

/**
 * Génération de résumé d'un texte
 * @param text Le texte à résumer
 * @returns Le résumé généré
 */
export async function summarizeText(text: string): Promise<string> {
  try {
    const prompt = `Veuillez résumer le texte suivant de façon concise tout en conservant les points clés:\n\n${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || "Impossible de générer un résumé.";
  } catch (error) {
    console.error("Erreur lors de la génération du résumé:", error);
    throw new Error("Échec de la génération du résumé: " + (error as Error).message);
  }
}

/**
 * Génération de recommandations de produits basée sur une description
 * @param description La description des préférences de l'utilisateur
 * @returns Une liste de recommandations de produits
 */
export async function generateProductRecommendations(description: string): Promise<string[]> {
  try {
    const prompt = `En tant qu'expert en recommandation de produits, générez une liste de 5 recommandations de produits basées sur cette description: "${description}". Répondez avec un objet JSON qui contient une seule propriété "recommendations" qui est un tableau de chaînes de caractères.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    return result.recommendations || [];
  } catch (error) {
    console.error("Erreur lors de la génération des recommandations:", error);
    throw new Error("Échec de la génération des recommandations: " + (error as Error).message);
  }
}