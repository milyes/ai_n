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
            <TabsTrigger value="training" className="flex-1">Entraînement</TabsTrigger>
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
              </div>
              <Button 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Analyse lancée",
                    description: "Traitement du texte en cours...",
                    variant: "default"
                  });
                  setTimeout(() => {
                    setAssistantState("thinking");
                    
                    // Simuler une analyse et afficher le formulaire de suivi
                    setTimeout(() => {
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
            
            <div className="space-y-3">
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