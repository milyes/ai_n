import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AssistantAnimation, AssistantState } from '@/components/ai/assistant-animation';
import { apiRequest } from '@/lib/queryClient';

interface IActivexMobileProps {
  initialPlatforms?: string[];
  autoScan?: boolean;
}

interface PlatformData {
  id: string;
  name: string;
  connected: boolean;
  lastSync: string | null;
  dataPoints: number;
  performanceScore: number;
}

interface PerformanceMetric {
  category: string;
  score: number;
  change: number;
  recommendations: string[];
}

interface AnalysisData {
  timestamp: string;
  source: string;
  type: string;
  confidence: number;
  summary: string;
  insights: string[];
}

export function IAActivexMobile({
  initialPlatforms = ['web', 'mobile', 'iot', 'cloud'],
  autoScan = true
}: IActivexMobileProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activePlatforms, setActivePlatforms] = useState<string[]>(initialPlatforms);
  const [platformsData, setPlatformsData] = useState<PlatformData[]>([]);
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoOptimize, setIsAutoOptimize] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Générer des données de plateforme simulées
  const generateMockPlatformData = useCallback(() => {
    const mockData: PlatformData[] = [
      {
        id: 'web',
        name: 'Application Web',
        connected: true,
        lastSync: new Date().toISOString(),
        dataPoints: Math.floor(Math.random() * 5000) + 1000,
        performanceScore: Math.floor(Math.random() * 30) + 65
      },
      {
        id: 'mobile',
        name: 'Application Mobile',
        connected: true,
        lastSync: new Date().toISOString(),
        dataPoints: Math.floor(Math.random() * 3000) + 500,
        performanceScore: Math.floor(Math.random() * 25) + 70
      },
      {
        id: 'iot',
        name: 'Capteurs IoT',
        connected: Math.random() > 0.3,
        lastSync: Math.random() > 0.3 ? new Date().toISOString() : null,
        dataPoints: Math.floor(Math.random() * 10000) + 2000,
        performanceScore: Math.floor(Math.random() * 20) + 75
      },
      {
        id: 'cloud',
        name: 'Services Cloud',
        connected: true,
        lastSync: new Date().toISOString(),
        dataPoints: Math.floor(Math.random() * 8000) + 3000,
        performanceScore: Math.floor(Math.random() * 15) + 80
      },
      {
        id: 'analytics',
        name: 'Plateforme Analytique',
        connected: Math.random() > 0.2,
        lastSync: Math.random() > 0.2 ? new Date().toISOString() : null,
        dataPoints: Math.floor(Math.random() * 12000) + 5000,
        performanceScore: Math.floor(Math.random() * 25) + 70
      }
    ];
    
    return mockData.filter(platform => activePlatforms.includes(platform.id));
  }, [activePlatforms]);

  // Générer des métriques de performance simulées
  const generateMockPerformanceMetrics = useCallback(() => {
    const categories = [
      'Temps de réponse API', 
      'Utilisation mémoire', 
      'Latence réseau', 
      'Temps de chargement', 
      'Utilisation CPU',
      'Flux de données'
    ];
    
    return categories.map(category => ({
      category,
      score: Math.floor(Math.random() * 40) + 60,
      change: Math.floor(Math.random() * 20) - 10,
      recommendations: [
        'Optimiser les appels asynchrones',
        'Mettre en cache les données fréquemment utilisées',
        'Réduire la taille des payloads JSON',
        'Implémenter une stratégie de pagination'
      ].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  }, []);
  
  // Générer des données d'analyse IA simulées
  const generateMockAnalysisData = useCallback((text: string = "", filters: string[] = []) => {
    const sources = ['web', 'mobile', 'iot', 'cloud', 'analytics', 'manuel', 'santé', 'sécurité'];
    const types = ['pédagogique', 'technique', 'sentiment', 'intention', 'médical', 'cybersécurité'];
    const selectedTypes = filters.length > 0 ? filters : types;
    
    // Format date: DD/MM/YYYY HH:MM
    const timestamp = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Détection du domaine basée sur le texte d'entrée
    let domaine = "standard";
    if (text.toLowerCase().includes("patient") || 
        text.toLowerCase().includes("médic") || 
        text.toLowerCase().includes("santé") ||
        text.toLowerCase().includes("diagnostic") ||
        text.toLowerCase().includes("symptôme") ||
        text.toLowerCase().includes("traitement")) {
      domaine = "santé";
    } else if (text.toLowerCase().includes("attaque") || 
               text.toLowerCase().includes("vulnérabilité") || 
               text.toLowerCase().includes("sécurité") ||
               text.toLowerCase().includes("hacker") ||
               text.toLowerCase().includes("pare-feu") ||
               text.toLowerCase().includes("malware") ||
               text.toLowerCase().includes("exploit")) {
      domaine = "sécurité";
    }
    
    // Ajuster les sources et types probables selon le domaine détecté
    let sourcesProbables = sources;
    let typesProbables = selectedTypes;
    
    if (domaine === "santé") {
      sourcesProbables = ['santé', 'iot', 'mobile'];
      if (selectedTypes.includes('médical')) {
        typesProbables = ['médical'];
      } else if (selectedTypes.length > 0) {
        typesProbables = selectedTypes;
      } else {
        typesProbables = ['médical', 'technique'];
      }
    } else if (domaine === "sécurité") {
      sourcesProbables = ['sécurité', 'cloud', 'web'];
      if (selectedTypes.includes('cybersécurité')) {
        typesProbables = ['cybersécurité'];
      } else if (selectedTypes.length > 0) {
        typesProbables = selectedTypes;
      } else {
        typesProbables = ['cybersécurité', 'technique'];
      }
    }
    
    const source = sourcesProbables[Math.floor(Math.random() * sourcesProbables.length)];
    const type = typesProbables[Math.floor(Math.random() * typesProbables.length)];
    const confidence = Math.round((Math.random() * 30 + 70)) / 100; // Entre 0.7 et 1.0
    
    let summary = "";
    let insights: string[] = [];
    
    switch (type) {
      case 'pédagogique':
        summary = "Le contenu présente des caractéristiques éducatives adaptées à un niveau intermédiaire";
        insights = [
          "Structure progressive bien adaptée à l'apprentissage",
          "Concepts techniques avec exemples pratiques",
          "Manque potentiel d'exercices d'application",
          "Bon équilibre entre théorie et pratique"
        ];
        break;
      case 'technique':
        summary = "Analyse technique révélant des aspects d'implémentation de niveau avancé";
        insights = [
          "Architecture modulaire et extensible",
          "Utilisation efficace des patrons de conception",
          "Quelques optimisations potentielles identifiées",
          "Compatibilité multi-environnements"
        ];
        break;
      case 'sentiment':
        summary = "Sentiment globalement positif avec quelques réserves mineures";
        insights = [
          "Ton enthousiaste et optimiste",
          "Inquiétudes sous-jacentes concernant l'implémentation",
          "Engagement fort envers la qualité",
          "Curiosité et ouverture aux améliorations"
        ];
        break;
      case 'intention':
        summary = "L'intention principale est l'amélioration des processus existants";
        insights = [
          "Recherche active de solutions d'optimisation",
          "Désir d'automatisation des tâches répétitives",
          "Intérêt pour l'intégration de nouvelles technologies",
          "Objectif d'amélioration de l'expérience utilisateur"
        ];
        break;
      case 'médical':
        summary = "Analyse des informations médicales avec identification des points critiques";
        insights = [
          "Détection de tendances physiologiques anormales",
          "Correspondance avec des profils pathologiques connus",
          "Recommandations pour suivi médical personnalisé",
          "Corrélation de multiples facteurs de santé",
          "Identification de signaux d'alerte précoces"
        ];
        break;
      case 'cybersécurité':
        summary = "Évaluation des risques de sécurité avec identification des vulnérabilités potentielles";
        insights = [
          "Détection de modèles d'attaque connus",
          "Failles potentielles dans la structure défensive",
          "Recommandations de renforcement du périmètre de sécurité",
          "Vecteurs d'attaque à surveiller en priorité",
          "Stratégies de mitigation des risques identifiés"
        ];
        break;
    }
    
    // Si le texte est court, utiliser un résumé générique
    if (text.length < 10) {
      if (domaine === "santé") {
        summary = "Analyse préliminaire d'informations médicales limitées";
      } else if (domaine === "sécurité") {
        summary = "Évaluation initiale de données de sécurité insuffisantes";
      }
    }
    
    return {
      timestamp,
      source,
      type,
      confidence,
      summary,
      insights: insights.slice(0, Math.floor(Math.random() * 2) + 3)
    };
  }, []);

  // Effet initial: Charger les données simulées
  useEffect(() => {
    if (autoScan) {
      startScan();
    } else {
      setPlatformsData(generateMockPlatformData());
      setPerformanceMetrics(generateMockPerformanceMetrics());
    }
  }, [autoScan, generateMockPlatformData, generateMockPerformanceMetrics]);

  // Fonction pour simuler un scan complet
  const startScan = async () => {
    setAssistantState("thinking");
    setIsSyncing(true);
    setScanProgress(0);
    
    const totalSteps = 10;
    const stepDuration = 500; // ms
    
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      setScanProgress(Math.floor((step / totalSteps) * 100));
    }
    
    setPlatformsData(generateMockPlatformData());
    setPerformanceMetrics(generateMockPerformanceMetrics());
    
    setIsSyncing(false);
    setAssistantState("success");
    
    toast({
      title: "Scan complété",
      description: "Toutes les plateformes ont été analysées avec succès.",
      variant: "default"
    });
    
    setTimeout(() => {
      setAssistantState("idle");
    }, 2000);
  };

  // Fonction pour appliquer les optimisations automatiques
  const applyAutoOptimizations = async () => {
    if (!isAutoOptimize) return;
    
    setAssistantState("thinking");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simuler des améliorations
    setPerformanceMetrics(prev => 
      prev.map(metric => ({
        ...metric,
        score: Math.min(100, metric.score + Math.floor(Math.random() * 8) + 2),
        change: Math.floor(Math.random() * 10) + 1,
        recommendations: metric.recommendations.length > 1 
          ? metric.recommendations.slice(0, -1) 
          : metric.recommendations
      }))
    );
    
    setAssistantState("success");
    
    toast({
      title: "Optimisations appliquées",
      description: "Les performances ont été améliorées sur toutes les plateformes.",
      variant: "default"
    });
    
    setTimeout(() => {
      setAssistantState("idle");
    }, 1500);
  };

  // Traitement de commande IA
  const processCommand = async () => {
    if (!currentCommand.trim()) return;
    
    setAssistantState("listening");
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setAssistantState("thinking");
    
    try {
      // Simuler un traitement de commande IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (currentCommand.toLowerCase().includes("scan") || 
          currentCommand.toLowerCase().includes("analyse")) {
        startScan();
      } 
      else if (currentCommand.toLowerCase().includes("optimis") || 
               currentCommand.toLowerCase().includes("améliore")) {
        applyAutoOptimizations();
      }
      else if (currentCommand.toLowerCase().includes("rapport") || 
               currentCommand.toLowerCase().includes("résumé")) {
        setAssistantState("speaking");
        toast({
          title: "Rapport généré",
          description: `Performance moyenne: ${calculateAveragePerformance()}%. ${platformsData.length} plateformes connectées.`,
          variant: "default"
        });
        setTimeout(() => setAssistantState("idle"), 2000);
      }
      else {
        setAssistantState("error");
        toast({
          title: "Commande non reconnue",
          description: "Essayez 'scanner les plateformes', 'optimiser les performances' ou 'générer un rapport'",
          variant: "destructive"
        });
        setTimeout(() => setAssistantState("idle"), 1500);
      }
      
      setCurrentCommand("");
    } catch (error) {
      console.error("Erreur lors du traitement de la commande:", error);
      setAssistantState("error");
      toast({
        title: "Erreur d'exécution",
        description: "Impossible de traiter votre commande pour le moment.",
        variant: "destructive"
      });
      setTimeout(() => setAssistantState("idle"), 1500);
    }
  };

  // Calculer la performance moyenne
  const calculateAveragePerformance = () => {
    if (platformsData.length === 0) return 0;
    const total = platformsData.reduce((sum, platform) => sum + platform.performanceScore, 0);
    return Math.floor(total / platformsData.length);
  };

  // Déterminer la classe de couleur basée sur le score
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Déterminer la classe de couleur pour le changement
  const getChangeColorClass = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-gray-500";
  };

  // Rendu du widget IActivex mobile en mode minimisé
  if (!isExpanded) {
    return (
      <div className={`fixed ${isMobile ? 'bottom-16 right-4' : 'bottom-24 right-8'} z-50`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="relative p-3 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <div className="relative">
            <AssistantAnimation state={assistantState} size="sm" />
            {isSyncing && (
              <div className="absolute -top-1 -right-1 w-3 h-3">
                <div className="absolute animate-ping w-3 h-3 rounded-full bg-blue-400 opacity-75"></div>
                <div className="relative rounded-full w-3 h-3 bg-blue-500"></div>
              </div>
            )}
          </div>
        </button>
      </div>
    );
  }

  // Rendu du widget IActivex mobile en mode étendu
  return (
    <Card className={`fixed z-50 shadow-xl transition-all duration-200 ${
      isMobile 
        ? 'bottom-0 left-0 right-0 rounded-b-none max-h-[85vh] overflow-y-auto' 
        : 'bottom-8 right-8 w-96'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AssistantAnimation state={assistantState} size="sm" />
            <h2 className="text-lg font-medium">IActivex Mobile</h2>
            {isSyncing && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full animate-pulse">
                Synchronisation...
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="mb-2">
          <TabsList className="w-full">
            <TabsTrigger value="dashboard" className="flex-1">Tableau de bord</TabsTrigger>
            <TabsTrigger value="platforms" className="flex-1">Plateformes</TabsTrigger>
            <TabsTrigger value="health" className="flex-1 text-blue-600 dark:text-blue-400">Santé</TabsTrigger>
            <TabsTrigger value="security" className="flex-1 text-red-600 dark:text-red-400">Sécurité</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4 py-2">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium">Performance Globale</h3>
              <div className={`text-xl font-bold ${getScoreColorClass(calculateAveragePerformance())}`}>
                {calculateAveragePerformance()}%
              </div>
            </div>
            
            <div className="mb-4 p-3 border rounded-md bg-blue-50 dark:bg-blue-900/10">
              <Label htmlFor="manual-text-input" className="block mb-2 font-medium">Analyse de texte manuelle</Label>
              <Textarea 
                id="manual-text-input"
                placeholder="Entrez un texte à analyser..."
                className="min-h-[80px] mb-2 w-full"
              />
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-pedagogical" defaultChecked />
                  <label htmlFor="filter-pedagogical" className="text-sm">Pédagogique</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-technical" defaultChecked />
                  <label htmlFor="filter-technical" className="text-sm">Technique</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-sentiment" />
                  <label htmlFor="filter-sentiment" className="text-sm">Sentiment</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-intention" />
                  <label htmlFor="filter-intention" className="text-sm">Intention</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-medical" />
                  <label htmlFor="filter-medical" className="text-sm text-blue-600 dark:text-blue-400">Médical</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-security" />
                  <label htmlFor="filter-security" className="text-sm text-red-600 dark:text-red-400">Cybersécurité</label>
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => {
                  const textElement = document.getElementById('manual-text-input') as HTMLTextAreaElement;
                  const text = textElement?.value || "Exemple de texte à analyser pour démontrer les capacités d'analyse du système.";
                  
                  // Récupérer les filtres sélectionnés
                  const filters: string[] = [];
                  if ((document.getElementById('filter-pedagogical') as HTMLInputElement)?.checked) {
                    filters.push('pédagogique');
                  }
                  if ((document.getElementById('filter-technical') as HTMLInputElement)?.checked) {
                    filters.push('technique');
                  }
                  if ((document.getElementById('filter-sentiment') as HTMLInputElement)?.checked) {
                    filters.push('sentiment');
                  }
                  if ((document.getElementById('filter-intention') as HTMLInputElement)?.checked) {
                    filters.push('intention');
                  }
                  if ((document.getElementById('filter-medical') as HTMLInputElement)?.checked) {
                    filters.push('médical');
                  }
                  if ((document.getElementById('filter-security') as HTMLInputElement)?.checked) {
                    filters.push('cybersécurité');
                  }
                  
                  toast({
                    title: "Analyse lancée",
                    description: "Traitement du texte en cours...",
                    variant: "default"
                  });
                  
                  setTimeout(() => {
                    setAssistantState("thinking");
                    
                    // Simuler une analyse et afficher le formulaire de suivi
                    setTimeout(() => {
                      // Générer et ajouter une nouvelle analyse
                      const newAnalysis = generateMockAnalysisData(text, filters);
                      setAnalysisData(prev => [newAnalysis, ...prev].slice(0, 10)); // Garder les 10 dernières analyses
                      
                      setAssistantState("success");
                      
                      // Afficher une boîte de dialogue pour recueillir plus d'informations
                      const dialogId = "followup-dialog";
                      const dialog = document.createElement("dialog");
                      dialog.id = dialogId;
                      dialog.className = "fixed inset-0 p-4 bg-black/50 flex items-center justify-center z-50";
                      dialog.innerHTML = `
                        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md w-full">
                          <h3 class="text-lg font-bold mb-2">Informations complémentaires</h3>
                          <p class="mb-4 text-sm">Pour affiner notre réponse, veuillez fournir des détails supplémentaires:</p>
                          
                          <form id="followup-form" class="space-y-3">
                            <div>
                              <label class="block text-sm font-medium mb-1">Niveau de compétence</label>
                              <select class="w-full p-2 border rounded">
                                <option>Débutant</option>
                                <option>Intermédiaire</option>
                                <option selected>Avancé</option>
                                <option>Expert</option>
                              </select>
                            </div>
                            
                            <div>
                              <label class="block text-sm font-medium mb-1">Objectif principal</label>
                              <select class="w-full p-2 border rounded">
                                <option>Apprentissage</option>
                                <option selected>Application pratique</option>
                                <option>Recherche</option>
                                <option>Enseignement</option>
                              </select>
                            </div>
                            
                            <div>
                              <label class="block text-sm font-medium mb-1">Contexte d'utilisation</label>
                              <textarea class="w-full p-2 border rounded min-h-[80px]" placeholder="Décrivez le contexte dans lequel vous utiliserez cette information..."></textarea>
                            </div>
                            
                            <div class="flex justify-end space-x-2 pt-2">
                              <button type="button" id="cancel-btn" class="px-4 py-2 border rounded">Annuler</button>
                              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Envoyer</button>
                            </div>
                          </form>
                        </div>
                      `;
                      
                      document.body.appendChild(dialog);
                      dialog.showModal();
                      
                      // Gérer les événements du formulaire
                      document.getElementById("cancel-btn")?.addEventListener("click", () => {
                        dialog.close();
                        dialog.remove();
                      });
                      
                      document.getElementById("followup-form")?.addEventListener("submit", (e) => {
                        e.preventDefault();
                        dialog.close();
                        dialog.remove();
                        
                        toast({
                          title: "Analyse complétée",
                          description: "Votre texte a été analysé avec succès avec les informations supplémentaires.",
                          variant: "default"
                        });
                      });
                    }, 1800);
                  }, 500);
                }}
              >
                Analyser le texte
              </Button>
            </div>
            
            {analysisData.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Analyses récentes</h3>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {analysisData.length}
                  </Badge>
                </div>
                
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {analysisData.map((analysis, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm capitalize">{analysis.type}</span>
                          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {analysis.source}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">{analysis.timestamp}</span>
                      </div>
                      <p className="text-sm mb-1">{analysis.summary}</p>
                      <div className="mt-1">
                        {analysis.insights.map((insight, i) => (
                          <div key={i} className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 flex-shrink-0">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {insight}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-2">
                        <div className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">
                          Confiance: {Math.round(analysis.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-medium">Métriques de performance</h3>
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{metric.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getScoreColorClass(metric.score)}`}>
                        {metric.score}%
                      </span>
                      <span className={`text-xs ${getChangeColorClass(metric.change)}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                  <Progress value={metric.score} className="h-1.5" />
                </div>
              ))}
            </div>
            
            <Button 
              onClick={applyAutoOptimizations} 
              className="w-full"
              disabled={isSyncing || !isAutoOptimize || assistantState !== "idle"}
            >
              Optimiser les performances
            </Button>
          </TabsContent>
          
          <TabsContent value="platforms" className="space-y-4 py-2">
            <div className="space-y-3">
              {platformsData.map((platform) => (
                <div key={platform.id} className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <h4 className="font-medium">{platform.name}</h4>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${platform.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>{platform.connected ? 'Connecté' : 'Déconnecté'}</span>
                      {platform.lastSync && (
                        <span>· Mise à jour: {new Date(platform.lastSync).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getScoreColorClass(platform.performanceScore)}`}>
                      {platform.performanceScore}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {platform.dataPoints.toLocaleString()} points
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={startScan}
              disabled={isSyncing || assistantState !== "idle"}
            >
              Rafraîchir les données
            </Button>
          </TabsContent>
          
          <TabsContent value="health" className="space-y-4 py-2">
            <div className="p-4 border rounded-md bg-blue-50 dark:bg-blue-900/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Analyse médicale IA</h3>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Module spécialisé
                </Badge>
              </div>
              
              <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
                Notre système d'analyse médicale utilise des algorithmes avancés pour identifier des tendances, détecter des anomalies et générer des insights à partir de données médicales, tout en respectant strictement les normes de confidentialité.
              </p>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-md bg-white dark:bg-gray-800">
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Capacités d'analyse</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </div>
                      <span className="text-sm">Diagnostics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      </div>
                      <span className="text-sm">Tendances</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                          <path d="M2 9h20" />
                          <path d="M2 15h20" />
                          <path d="M12 3v18" />
                          <path d="m15 7 3-3 3 3" />
                          <path d="m15 21 3-3 3 3" />
                          <path d="m9 3-3 3-3-3" />
                          <path d="m9 17-3 3-3-3" />
                        </svg>
                      </div>
                      <span className="text-sm">Corrélations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                          <path d="M4 22h16" />
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                        </svg>
                      </div>
                      <span className="text-sm">Recommandations</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <h4 className="font-medium mb-2">Analyse de texte médical</h4>
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Entrez une description de symptômes ou un texte médical à analyser..." 
                      className="w-full h-24 mb-2"
                    />
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Analyser les données médicales
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <h4 className="font-medium mb-2">Confidentialité des données</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Niveau de chiffrement</span>
                    <span className="text-sm font-medium">AES-256</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Conformité RGPD</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Actif
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rétention des données</span>
                    <span className="text-sm font-medium">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4 py-2">
            <div className="p-4 border rounded-md bg-red-50 dark:bg-red-900/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Cybersécurité IA</h3>
                <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  Surveillance active
                </Badge>
              </div>
              
              <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
                Notre système de cybersécurité utilise l'IA pour détecter et prévenir les menaces en temps réel, analyser les vulnérabilités et renforcer la posture de sécurité globale de votre infrastructure.
              </p>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-md bg-white dark:bg-gray-800">
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Tableau de bord sécurité</h4>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">Menaces détectées</span>
                        <span className="text-xs text-gray-500">24h</span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-xl font-bold">7</span>
                        <span className="text-xs ml-1 text-red-500">(+2)</span>
                      </div>
                    </div>
                    <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">Vulnérabilités</span>
                        <span className="text-xs text-gray-500">Total</span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-xl font-bold">12</span>
                        <span className="text-xs ml-1 text-green-500">(-4)</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      <div className="bg-green-500 h-full" style={{ width: '65%' }}>
                        <span className="flex items-center justify-center h-full text-xs font-bold text-white">
                          65% Sécurisé
                        </span>
                      </div>
                      <div className="bg-yellow-500 h-full" style={{ width: '20%' }}>
                        <span className="flex items-center justify-center h-full text-xs font-bold text-white">
                          20%
                        </span>
                      </div>
                      <div className="bg-red-500 h-full" style={{ width: '15%' }}>
                        <span className="flex items-center justify-center h-full text-xs font-bold text-white">
                          15%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <h4 className="font-medium mb-2">Analyse de vulnérabilités</h4>
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Entrez une URL, un code ou une description de système pour analyser les vulnérabilités..." 
                      className="w-full h-24 mb-2"
                    />
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Analyser les vulnérabilités
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <h4 className="font-medium mb-2">Dernières menaces détectées</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    <div className="flex items-center gap-2 p-2 border rounded bg-gray-50 dark:bg-gray-800">
                      <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">Tentative d'injection SQL</span>
                          <span className="text-xs text-gray-500">12:45</span>
                        </div>
                        <span className="text-xs text-gray-500">Source: 192.168.1.45</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-2 border rounded bg-gray-50 dark:bg-gray-800">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 dark:text-yellow-400">
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                          <path d="M3.6 9h16.8a1 1 0 0 1 .87 1.5l-8.4 14.1a1 1 0 0 1-1.74 0L2.73 10.5a1 1 0 0 1 .87-1.5Z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">Authentification excessive</span>
                          <span className="text-xs text-gray-500">11:32</span>
                        </div>
                        <span className="text-xs text-gray-500">10+ tentatives en 5 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4 py-2">
            <div className="space-y-3">
              <div className="p-3 border rounded-md">
                <h4 className="font-medium mb-2">Entraînement d'image</h4>
                <div className="flex justify-between items-center text-sm">
                  <span>Images disponibles: <strong>52</strong></span>
                  <Badge variant="outline">Prêt</Badge>
                </div>
                <Progress value={100} className="h-1.5 mt-2" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Importer
                  </Button>
                  <Button size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M5 7 12 3l7 4" />
                      <path d="M12 21V7" />
                      <path d="M9 13 5 17l-2-2" />
                      <path d="M9 13c0 2.188 2 5 5 5s5-2.812 5-5" />
                    </svg>
                    Entraîner
                  </Button>
                </div>
              </div>
              
              <div className="p-3 border rounded-md">
                <h4 className="font-medium mb-2">Entraînement vocal</h4>
                <div className="flex justify-between items-center text-sm">
                  <span>Échantillons: <strong>18 / 50</strong></span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    En cours
                  </Badge>
                </div>
                <Progress value={36} className="h-1.5 mt-2" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="12" cy="12" r="1" />
                      <path d="M6 12a6 6 0 0 1 6-6" />
                      <path d="M12 18a6 6 0 0 0 0-12" />
                    </svg>
                    Enregistrer
                  </Button>
                  <Button size="sm" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M5 7 12 3l7 4" />
                      <path d="M12 21V7" />
                      <path d="M9 13 5 17l-2-2" />
                      <path d="M9 13c0 2.188 2 5 5 5s5-2.812 5-5" />
                    </svg>
                    Entraîner
                  </Button>
                </div>
              </div>
              
              <div className="p-3 border rounded-md">
                <h4 className="font-medium mb-2">Test de phrases télédétection</h4>
                <div className="flex justify-between items-center text-sm">
                  <span>Phrases: <strong>0 / 20</strong></span>
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Non démarré
                  </Badge>
                </div>
                <Progress value={0} className="h-1.5 mt-2" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Ajouter
                  </Button>
                  <Button size="sm" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M5 7 12 3l7 4" />
                      <path d="M12 21V7" />
                      <path d="M9 13 5 17l-2-2" />
                      <path d="M9 13c0 2.188 2 5 5 5s5-2.812 5-5" />
                    </svg>
                    Entraîner
                  </Button>
                </div>
              </div>
              
              <div className="p-3 border rounded-md bg-green-50 dark:bg-green-900/10">
                <h4 className="font-medium mb-2">Analyse du contenu pédagogique</h4>
                <div className="flex justify-between items-center text-sm">
                  <span>Échantillons: <strong>12 / 25</strong></span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Actif
                  </Badge>
                </div>
                <Progress value={48} className="h-1.5 mt-2" />
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Dernière analyse: <span className="font-medium">13 mars 2025, 15:42</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Éditer
                  </Button>
                  <Button size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.851 1 6.525 2.674" />
                      <path d="M21 3v9h-9" />
                    </svg>
                    Analyser
                  </Button>
                </div>
              </div>
              
              <div className="p-3 border rounded-md bg-purple-50 dark:bg-purple-900/10">
                <h4 className="font-medium mb-2">Détection des besoins du locuteur</h4>
                <div className="flex justify-between items-center text-sm">
                  <span>Profils analysés: <strong>8</strong></span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    En cours
                  </Badge>
                </div>
                <Progress value={65} className="h-1.5 mt-2" />
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Précision actuelle: <span className="font-medium">87%</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="18" cy="18" r="3" />
                      <circle cx="6" cy="6" r="3" />
                      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                      <path d="M11 18H8a2 2 0 0 1-2-2V9" />
                    </svg>
                    Profils
                  </Button>
                  <Button size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z" />
                      <path d="M12 13v8" />
                      <path d="M12 3v3" />
                    </svg>
                    Tester
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h4 className="font-medium mb-2">Filtres de services</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <Switch id="filter-image" />
                  <Label htmlFor="filter-image" className="text-sm">
                    Images
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="filter-voice" />
                  <Label htmlFor="filter-voice" className="text-sm">
                    Voix
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="filter-text" />
                  <Label htmlFor="filter-text" className="text-sm">
                    Texte
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="filter-remote" />
                  <Label htmlFor="filter-remote" className="text-sm">
                    Télédétection
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="filter-pedagogy" defaultChecked />
                  <Label htmlFor="filter-pedagogy" className="text-sm">
                    Pédagogie
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="filter-speaker" defaultChecked />
                  <Label htmlFor="filter-speaker" className="text-sm">
                    Besoins locuteur
                  </Label>
                </div>
              </div>
              <Button size="sm" className="w-full">
                Appliquer les filtres
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="chatbot" className="space-y-4 py-2">
            <div className="flex flex-col h-[350px]">
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-md p-3 mb-3">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-300">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85 1 6.54 2.75" />
                        <path d="M21 3v9h-9" />
                      </svg>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm text-sm max-w-[85%]">
                      <p>Bonjour, je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-lg shadow-sm text-sm max-w-[85%]">
                      <p>J'ai besoin d'aide pour naviguer sur ce site. Pouvez-vous m'expliquer comment fonctionne le mode navigation ?</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 7v4" />
                        <path d="M5 7v4" />
                        <circle cx="12" cy="11" r="1" />
                        <path d="M8 21h8" />
                        <path d="M12 21v-6.5" />
                        <path d="M8 4h8" />
                        <path d="M12 7V4" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-300">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85 1 6.54 2.75" />
                        <path d="M21 3v9h-9" />
                      </svg>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm text-sm max-w-[85%]">
                      <p>Le mode Navigation vous guide intelligemment à travers les menus et options des sites web. Voici ses fonctionnalités principales :</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li><span className="font-medium">Surbrillance des menus</span> : met en évidence les éléments de navigation pertinents</li>
                        <li><span className="font-medium">Suggestions contextuelles</span> : propose des actions basées sur votre comportement</li>
                        <li><span className="font-medium">Raccourcis intelligents</span> : offre des commandes rapides pour accéder aux fonctions fréquentes</li>
                        <li><span className="font-medium">Analyse de la structure</span> : comprend la hiérarchie des menus pour une navigation plus fluide</li>
                      </ul>
                      <p className="mt-2">Puis-je vous aider à naviguer vers une section spécifique du site ?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-lg shadow-sm text-sm max-w-[85%]">
                      <p>J'aimerais comprendre comment fonctionne l'analyse pédagogique dans ce contexte.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 7v4" />
                        <path d="M5 7v4" />
                        <circle cx="12" cy="11" r="1" />
                        <path d="M8 21h8" />
                        <path d="M12 21v-6.5" />
                        <path d="M8 4h8" />
                        <path d="M12 7V4" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-300">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85 1 6.54 2.75" />
                        <path d="M21 3v9h-9" />
                      </svg>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm text-sm max-w-[85%]">
                      <p>Dans le contexte de la navigation, l'analyse pédagogique combine deux aspects :</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Elle adapte l'assistance de navigation selon votre niveau de compétence</li>
                        <li>Elle identifie les zones du site qui correspondent à vos besoins pédagogiques</li>
                        <li>Elle suggère des parcours de navigation optimisés pour l'apprentissage</li>
                        <li>Elle présente les menus et options avec des explications adaptées à votre profil</li>
                      </ul>
                      <p className="mt-2">Je vois que vous êtes dans la section IA Centrale, souhaitez-vous explorer les fonctionnalités pédagogiques disponibles ici ?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-gray-500">Aujourd'hui, 15:32</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Saisissez votre message..."
                    className="pr-10"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </button>
                </div>
                <Button type="submit" size="icon" className="h-10 w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </Button>
              </div>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-2">Options du chatbot</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Select defaultValue="french">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner la langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="french">Français</SelectItem>
                      <SelectItem value="english">Anglais</SelectItem>
                      <SelectItem value="spanish">Espagnol</SelectItem>
                      <SelectItem value="german">Allemand</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="navigation">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner le mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                      <SelectItem value="pedagogical">Pédagogique</SelectItem>
                      <SelectItem value="navigation">Navigation</SelectItem>
                      <SelectItem value="technical">Technique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-md mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Mode Navigation IA</h4>
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                      Actif
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Le mode Navigation guide les utilisateurs à travers les menus et les options des sites web.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="nav-highlight" defaultChecked />
                      <label htmlFor="nav-highlight" className="text-xs">Surbrillance des menus</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="nav-suggestions" defaultChecked />
                      <label htmlFor="nav-suggestions" className="text-xs">Suggestions contextuelles</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="nav-shortcuts" defaultChecked />
                      <label htmlFor="nav-shortcuts" className="text-xs">Raccourcis intelligents</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="nav-history" />
                      <label htmlFor="nav-history" className="text-xs">Suivi d'historique</label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="chatbot-memory" defaultChecked />
                    <Label htmlFor="chatbot-memory" className="text-sm">Mémoire conversationnelle</Label>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 p-0 px-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M12 5v14" />
                      <path d="M18 13a5 5 0 0 0-6 0 5 5 0 0 0-6 0" />
                    </svg>
                    Exporter
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 py-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-optimize" className="cursor-pointer">Optimisation automatique</Label>
                <Switch 
                  id="auto-optimize" 
                  checked={isAutoOptimize}
                  onCheckedChange={setIsAutoOptimize}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Plateformes à surveiller</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'web', label: 'Application Web' },
                    { id: 'mobile', label: 'Application Mobile' },
                    { id: 'iot', label: 'Capteurs IoT' },
                    { id: 'cloud', label: 'Services Cloud' },
                    { id: 'analytics', label: 'Plateforme Analytique' }
                  ].map(platform => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <Switch
                        id={`platform-${platform.id}`}
                        checked={activePlatforms.includes(platform.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setActivePlatforms(prev => [...prev, platform.id]);
                          } else {
                            setActivePlatforms(prev => prev.filter(p => p !== platform.id));
                          }
                        }}
                      />
                      <Label htmlFor={`platform-${platform.id}`} className="cursor-pointer">
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={startScan} 
                className="w-full"
                disabled={isSyncing || assistantState !== "idle" || activePlatforms.length === 0}
              >
                Appliquer et scanner
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Zone de commande IA */}
        <div className="mt-3 pt-3 border-t">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              processCommand();
            }}
            className="flex gap-2"
          >
            <Input
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              placeholder="Entrez une commande IA..."
              disabled={assistantState !== "idle" && assistantState !== "listening"}
              onFocus={() => {
                if (assistantState === "idle") {
                  setAssistantState("listening");
                }
              }}
              onBlur={() => {
                if (assistantState === "listening" && !currentCommand) {
                  setAssistantState("idle");
                }
              }}
              className="flex-1"
            />
            <Button 
              type="submit"
              disabled={!currentCommand.trim() || (assistantState !== "idle" && assistantState !== "listening")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </Button>
          </form>
          <div className="mt-2 text-xs text-gray-500">
            Exemples: "Scanner les plateformes", "Optimiser les performances", "Générer un rapport"
          </div>
        </div>
      </div>
      
      {/* Barre de progression pour la synchronisation */}
      {isSyncing && (
        <Progress value={scanProgress} className="h-1" />
      )}
    </Card>
  );
}