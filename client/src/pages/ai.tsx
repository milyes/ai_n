import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Star, StarHalf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AssistantAnimation, AssistantState } from "@/components/ai/assistant-animation";
import { AssistantDemo } from "@/components/ai/assistant-demo";

export default function AI() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sentiment");
  const [inputText, setInputText] = useState("");
  const [description, setDescription] = useState("");
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [assistantMessage, setAssistantMessage] = useState<string>("Je suis votre assistant IA. Comment puis-je vous aider ?");

  // Mutation pour l'analyse de sentiment
  const sentimentMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest<{
        success: boolean;
        data: { rating: number; confidence: number }
      }>("/api/ai/sentiment", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'analyser le sentiment: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation pour la génération de résumé
  const summaryMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest<{
        success: boolean;
        data: { summary: string }
      }>("/api/ai/summary", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de générer le résumé: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation pour les recommandations de produits
  const recommendationsMutation = useMutation({
    mutationFn: async (description: string) => {
      return apiRequest<{
        success: boolean;
        data: { recommendations: string[] }
      }>("/api/ai/recommendations", {
        method: "POST",
        body: JSON.stringify({ description }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de générer les recommandations: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Effet pour mettre à jour l'état de l'assistant en fonction des mutations
  useEffect(() => {
    if (sentimentMutation.isPending || summaryMutation.isPending || recommendationsMutation.isPending) {
      setAssistantState("thinking");
      setAssistantMessage("Je réfléchis à votre demande...");
    } else if (sentimentMutation.isSuccess || summaryMutation.isSuccess || recommendationsMutation.isSuccess) {
      setAssistantState("success");
      if (sentimentMutation.isSuccess) {
        const rating = sentimentMutation.data.data.rating;
        const sentiment = rating >= 4 ? "positif" : rating >= 3 ? "neutre" : "négatif";
        setAssistantMessage(`Analyse terminée ! Le sentiment est ${sentiment} (${rating}/5).`);
      } else if (summaryMutation.isSuccess) {
        setAssistantMessage("J'ai généré un résumé basé sur votre texte.");
      } else if (recommendationsMutation.isSuccess) {
        setAssistantMessage("Voici quelques recommandations qui pourraient vous intéresser.");
      }
    } else if (sentimentMutation.isError || summaryMutation.isError || recommendationsMutation.isError) {
      setAssistantState("error");
      setAssistantMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  }, [
    sentimentMutation.isPending, sentimentMutation.isSuccess, sentimentMutation.isError,
    summaryMutation.isPending, summaryMutation.isSuccess, summaryMutation.isError,
    recommendationsMutation.isPending, recommendationsMutation.isSuccess, recommendationsMutation.isError
  ]);

  // Fonction pour analyser le sentiment
  const handleSentimentAnalysis = () => {
    if (!inputText.trim()) {
      toast({
        title: "Attention",
        description: "Veuillez entrer un texte à analyser",
        variant: "default",
      });
      return;
    }
    setAssistantState("listening");
    setAssistantMessage("J'analyse le sentiment de votre texte...");
    sentimentMutation.mutate(inputText);
  };

  // Fonction pour générer un résumé
  const handleSummarize = () => {
    if (inputText.trim().length < 50) {
      toast({
        title: "Attention",
        description: "Le texte doit contenir au moins 50 caractères",
        variant: "default",
      });
      return;
    }
    setAssistantState("listening");
    setAssistantMessage("Je vais résumer votre texte...");
    summaryMutation.mutate(inputText);
  };

  // Fonction pour générer des recommandations
  const handleRecommendations = () => {
    if (description.trim().length < 10) {
      toast({
        title: "Attention",
        description: "La description doit contenir au moins 10 caractères",
        variant: "default",
      });
      return;
    }
    setAssistantState("listening");
    setAssistantMessage("Je cherche des recommandations pour vous...");
    recommendationsMutation.mutate(description);
  };

  // Fonction pour rendre les étoiles selon la note
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-yellow-400 text-yellow-400" />);
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return stars;
  };

  // Fonction qui gère le changement d'onglet
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Réinitialiser l'état de l'assistant
    setAssistantState("idle");
    
    // Adapter le message en fonction de l'onglet sélectionné
    switch (tab) {
      case "sentiment":
        setAssistantMessage("Je peux analyser le sentiment d'un texte pour vous. Entrez votre texte et cliquez sur le bouton.");
        break;
      case "summary":
        setAssistantMessage("Je peux résumer votre texte. Assurez-vous qu'il contient au moins 50 caractères.");
        break;
      case "recommendations":
        setAssistantMessage("Décrivez vos préférences et je vous proposerai des recommandations personnalisées.");
        break;
      case "demo":
        setAssistantMessage("Découvrez toutes les animations de l'assistant IA !");
        break;
      default:
        setAssistantMessage("Je suis votre assistant IA. Comment puis-je vous aider ?");
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
        Module d'Intelligence Artificielle
      </h1>
      
      {/* Assistant IA animé */}
      <div className="flex justify-center mb-6">
        <AssistantAnimation 
          state={assistantState} 
          size="lg" 
          message={assistantMessage}
        />
      </div>
      
      <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
        Explorez nos fonctionnalités alimentées par l'IA pour améliorer votre expérience utilisateur et obtenir des informations précieuses.
      </p>
      
      <Tabs defaultValue="sentiment" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sentiment">Analyse de Sentiment</TabsTrigger>
          <TabsTrigger value="summary">Génération de Résumé</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="demo">Démo Assistant</TabsTrigger>
        </TabsList>
        
        {/* Onglet Analyse de Sentiment */}
        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle>Analyse de Sentiment</CardTitle>
              <CardDescription>
                Analysez le sentiment d'un texte pour déterminer s'il est positif, négatif ou neutre.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Entrez le texte à analyser..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  className="w-full"
                />
                
                {sentimentMutation.isSuccess && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(sentimentMutation.data.data.rating)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Note: <strong>{sentimentMutation.data.data.rating}/5</strong>
                      </span>
                      <Badge variant={sentimentMutation.data.data.confidence > 0.7 ? "default" : "outline"}>
                        Confiance: {Math.round(sentimentMutation.data.data.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                )}
                
                {sentimentMutation.isError && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={16} />
                    <span>Une erreur s'est produite lors de l'analyse.</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSentimentAnalysis}
                disabled={sentimentMutation.isPending || !inputText.trim()}
                className="w-full"
              >
                {sentimentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : "Analyser le sentiment"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Onglet Génération de Résumé */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Génération de Résumé</CardTitle>
              <CardDescription>
                Générez un résumé concis d'un texte long tout en préservant les points clés.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Entrez le texte à résumer (minimum 50 caractères)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  className="w-full"
                />
                
                {summaryMutation.isSuccess && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h4 className="font-medium mb-2">Résumé:</h4>
                    <p className="text-sm">{summaryMutation.data.data.summary}</p>
                  </div>
                )}
                
                {summaryMutation.isError && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={16} />
                    <span>Une erreur s'est produite lors de la génération du résumé.</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSummarize}
                disabled={summaryMutation.isPending || inputText.trim().length < 50}
                className="w-full"
              >
                {summaryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : "Générer un résumé"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Onglet Recommandations de Produits */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations de Produits</CardTitle>
              <CardDescription>
                Obtenez des recommandations de produits personnalisées en fonction de vos préférences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Décrivez vos préférences ou besoins (minimum 10 caractères)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full"
                />
                
                {recommendationsMutation.isSuccess && recommendationsMutation.data.data.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recommandations:</h4>
                    <ul className="space-y-2">
                      {recommendationsMutation.data.data.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {recommendationsMutation.isError && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={16} />
                    <span>Une erreur s'est produite lors de la génération des recommandations.</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleRecommendations}
                disabled={recommendationsMutation.isPending || description.trim().length < 10}
                className="w-full"
              >
                {recommendationsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : "Obtenir des recommandations"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        {/* Onglet Démo Assistant */}
        <TabsContent value="demo">
          <div className="mt-4">
            <AssistantDemo />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}