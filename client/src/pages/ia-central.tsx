import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { IAActivexMobile } from '@/components/ai/ia-activex-mobile';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface Dataset {
  id: string;
  name: string;
  source: string;
  size: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'processing';
}

interface Model {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  version: string;
  status: 'deployed' | 'training' | 'ready';
}

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requests: number;
  averageLatency: number;
}

export default function IACentral() {
  // Module IAActivex toujours visible
  const showActivex = true; // Valeur constante au lieu d'un état
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [activeModel, setActiveModel] = useState<string>('');
  const [predictionInput, setPredictionInput] = useState('');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setDatasets([
        {
          id: 'ds1',
          name: 'Utilisateurs Web',
          source: 'Application Web',
          size: '2.4 GB',
          lastUpdated: '2025-02-28',
          status: 'active'
        },
        {
          id: 'ds2',
          name: 'Téléchargements Mobile',
          source: 'Application Mobile',
          size: '1.7 GB',
          lastUpdated: '2025-02-27',
          status: 'active'
        },
        {
          id: 'ds3',
          name: 'Capteurs Environnementaux',
          source: 'Réseau IoT',
          size: '5.9 GB',
          lastUpdated: '2025-02-28',
          status: 'processing'
        },
        {
          id: 'ds4',
          name: 'Logs Serveur',
          source: 'Infrastructure Cloud',
          size: '8.1 GB',
          lastUpdated: '2025-02-25',
          status: 'active'
        },
        {
          id: 'ds5',
          name: 'Métriques Performance',
          source: 'Plateforme Analytique',
          size: '3.3 GB',
          lastUpdated: '2025-02-26',
          status: 'inactive'
        }
      ]);

      setModels([
        {
          id: 'ml1',
          name: 'PredictiveOps v2',
          type: 'Régression',
          accuracy: 92.5,
          version: '2.3.1',
          status: 'deployed'
        },
        {
          id: 'ml2',
          name: 'UserBehavior',
          type: 'Classification',
          accuracy: 89.7,
          version: '1.8.4',
          status: 'deployed'
        },
        {
          id: 'ml3',
          name: 'AnomalyDetector',
          type: 'Détection d\'anomalies',
          accuracy: 94.2,
          version: '3.1.0',
          status: 'ready'
        },
        {
          id: 'ml4',
          name: 'ResourceOptimizer',
          type: 'Optimisation',
          accuracy: 91.3,
          version: '2.0.5',
          status: 'training'
        }
      ]);

      setEndpoints([
        {
          id: 'api1',
          name: 'Analyse Prédictive',
          url: '/api/predict',
          method: 'POST',
          requests: 12458,
          averageLatency: 235
        },
        {
          id: 'api2',
          name: 'Recommandations',
          url: '/api/recommend',
          method: 'GET',
          requests: 34892,
          averageLatency: 189
        },
        {
          id: 'api3',
          name: 'Optimisation',
          url: '/api/optimize',
          method: 'POST',
          requests: 5671,
          averageLatency: 312
        },
        {
          id: 'api4',
          name: 'Détection Anomalies',
          url: '/api/anomalies',
          method: 'GET',
          requests: 8945,
          averageLatency: 267
        }
      ]);
      
      setActiveModel('ml1');
    }, 1000);
  }, []);

  const handlePredictionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!predictionInput.trim()) return;
    
    setIsLoading(true);
    
    // Simuler un appel API
    setTimeout(() => {
      // Génération de résultats simulés basés sur le modèle et l'entrée
      const selectedModel = models.find(m => m.id === activeModel);
      
      if (selectedModel) {
        if (selectedModel.type === 'Régression') {
          setPredictionResult({
            prediction: Math.floor(Math.random() * 1000) / 10,
            confidence: Math.floor(Math.random() * 1000) / 1000,
            factors: [
              { name: 'Facteur A', weight: Math.floor(Math.random() * 1000) / 1000 },
              { name: 'Facteur B', weight: Math.floor(Math.random() * 1000) / 1000 },
              { name: 'Facteur C', weight: Math.floor(Math.random() * 1000) / 1000 }
            ]
          });
        } else if (selectedModel.type === 'Classification') {
          setPredictionResult({
            class: ['Classe A', 'Classe B', 'Classe C'][Math.floor(Math.random() * 3)],
            probability: Math.floor(Math.random() * 1000) / 1000,
            alternatives: [
              { class: 'Classe X', probability: Math.floor(Math.random() * 300) / 1000 },
              { class: 'Classe Y', probability: Math.floor(Math.random() * 200) / 1000 }
            ]
          });
        } else {
          setPredictionResult({
            result: Math.random() > 0.5 ? 'Anomalie détectée' : 'Normal',
            score: Math.floor(Math.random() * 1000) / 1000,
            details: 'Analyse complétée en utilisant le modèle ' + selectedModel.name
          });
        }
      }
      
      setIsLoading(false);
      
      toast({
        title: "Prédiction générée",
        description: "L'analyse a été complétée avec succès",
        variant: "default"
      });
    }, 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar reste la même, non inclus ici pour être concis */}
      
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Centre IA Activex
            </h1>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm">
                Module IA Activex actif
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Jeux de données</h3>
              <div className="text-3xl font-bold">{datasets.length}</div>
              <p className="text-sm text-gray-500 mt-1">
                {datasets.filter(d => d.status === 'active').length} actifs
              </p>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Modèles IA</h3>
              <div className="text-3xl font-bold">{models.length}</div>
              <p className="text-sm text-gray-500 mt-1">
                {models.filter(m => m.status === 'deployed').length} déployés
              </p>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">API Endpoints</h3>
              <div className="text-3xl font-bold">{endpoints.length}</div>
              <p className="text-sm text-gray-500 mt-1">
                {endpoints.reduce((sum, endpoint) => sum + endpoint.requests, 0).toLocaleString()} requêtes
              </p>
            </Card>
          </div>
          
          <Tabs defaultValue="datasets" className="mb-8">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="datasets" className="flex-1">Jeux de données</TabsTrigger>
              <TabsTrigger value="models" className="flex-1">Modèles</TabsTrigger>
              <TabsTrigger value="endpoints" className="flex-1">Endpoints API</TabsTrigger>
              <TabsTrigger value="predictions" className="flex-1">Prédictions</TabsTrigger>
              <TabsTrigger value="training" className="flex-1">Entraînement</TabsTrigger>
              <TabsTrigger value="intent" className="flex-1">Détection d'intention</TabsTrigger>
            </TabsList>
            
            <TabsContent value="datasets">
              <Card>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Jeux de données disponibles</h2>
                    <Button size="sm">Ajouter un jeu de données</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Nom</th>
                          <th className="text-left py-2 px-3">Source</th>
                          <th className="text-left py-2 px-3">Taille</th>
                          <th className="text-left py-2 px-3">Dernière MAJ</th>
                          <th className="text-left py-2 px-3">Statut</th>
                          <th className="text-right py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datasets.map(dataset => (
                          <tr key={dataset.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-3 font-medium">{dataset.name}</td>
                            <td className="py-3 px-3">{dataset.source}</td>
                            <td className="py-3 px-3">{dataset.size}</td>
                            <td className="py-3 px-3">{dataset.lastUpdated}</td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                dataset.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                  : dataset.status === 'processing' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {dataset.status === 'active' ? 'Actif' : 
                                 dataset.status === 'processing' ? 'En traitement' : 'Inactif'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button variant="ghost" size="sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1"></circle>
                                  <circle cx="19" cy="12" r="1"></circle>
                                  <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="models">
              <Card>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Modèles IA</h2>
                    <Button size="sm">Créer un modèle</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Nom</th>
                          <th className="text-left py-2 px-3">Type</th>
                          <th className="text-left py-2 px-3">Précision</th>
                          <th className="text-left py-2 px-3">Version</th>
                          <th className="text-left py-2 px-3">Statut</th>
                          <th className="text-right py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {models.map(model => (
                          <tr key={model.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-3 font-medium">{model.name}</td>
                            <td className="py-3 px-3">{model.type}</td>
                            <td className="py-3 px-3">{model.accuracy}%</td>
                            <td className="py-3 px-3">{model.version}</td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                model.status === 'deployed' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                  : model.status === 'training' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              }`}>
                                {model.status === 'deployed' ? 'Déployé' : 
                                 model.status === 'training' ? 'En entraînement' : 'Prêt'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button variant="ghost" size="sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1"></circle>
                                  <circle cx="19" cy="12" r="1"></circle>
                                  <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="endpoints">
              <Card>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">API Endpoints</h2>
                    <Button size="sm">Créer un endpoint</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Nom</th>
                          <th className="text-left py-2 px-3">URL</th>
                          <th className="text-left py-2 px-3">Méthode</th>
                          <th className="text-left py-2 px-3">Requêtes</th>
                          <th className="text-left py-2 px-3">Latence moyenne (ms)</th>
                          <th className="text-right py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoints.map(endpoint => (
                          <tr key={endpoint.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-3 font-medium">{endpoint.name}</td>
                            <td className="py-3 px-3">{endpoint.url}</td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                endpoint.method === 'GET' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                  : endpoint.method === 'POST'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : endpoint.method === 'PUT'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {endpoint.method}
                              </span>
                            </td>
                            <td className="py-3 px-3">{endpoint.requests.toLocaleString()}</td>
                            <td className="py-3 px-3">{endpoint.averageLatency} ms</td>
                            <td className="py-3 px-3 text-right">
                              <Button variant="ghost" size="sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1"></circle>
                                  <circle cx="19" cy="12" r="1"></circle>
                                  <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="predictions">
              <Card>
                <div className="p-4">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Générateur de prédictions</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <form onSubmit={handlePredictionSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="model-select">Sélectionnez un modèle</Label>
                            <Select 
                              value={activeModel} 
                              onValueChange={setActiveModel}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un modèle" />
                              </SelectTrigger>
                              <SelectContent>
                                {models.map(model => (
                                  <SelectItem key={model.id} value={model.id}>
                                    {model.name} ({model.type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="prediction-input">Données d'entrée</Label>
                            <Input
                              id="prediction-input"
                              placeholder="Entrez les données pour la prédiction..."
                              value={predictionInput}
                              onChange={(e) => setPredictionInput(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Format: entrée libre ou JSON selon le modèle
                            </p>
                          </div>
                          
                          <Button 
                            type="submit" 
                            disabled={isLoading || !activeModel || !predictionInput.trim()}
                            className="w-full"
                          >
                            {isLoading ? 'Traitement...' : 'Générer une prédiction'}
                          </Button>
                        </form>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Résultat</h3>
                        {predictionResult ? (
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 h-[300px] overflow-auto">
                            <pre className="text-sm whitespace-pre-wrap">
                              {JSON.stringify(predictionResult, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 h-[300px] flex items-center justify-center text-gray-500">
                            Les résultats de prédiction apparaîtront ici
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Onglet Entraînement */}
            <TabsContent value="training">
              <Card>
                <div className="p-4">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Entraînement de modèles</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Card className="border-2 border-dashed border-gray-300 hover:border-primary p-6">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-primary/10">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium">Entraînement d'images</h3>
                            <p className="text-sm text-gray-500">
                              Entraînez des modèles de vision par ordinateur pour la reconnaissance d'objets, la classification d'images et la détection d'anomalies.
                            </p>
                            <div className="flex flex-col w-full space-y-2">
                              <Button variant="outline" className="w-full">
                                Sélectionner des images
                              </Button>
                              <Button disabled className="w-full">
                                Démarrer l'entraînement
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      <div>
                        <Card className="border-2 border-dashed border-gray-300 hover:border-primary p-6">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-primary/10">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="22" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium">Entraînement vocal</h3>
                            <p className="text-sm text-gray-500">
                              Créez des modèles de reconnaissance vocale, de synthèse vocale et d'analyse de tonalité adaptés à votre cas d'usage.
                            </p>
                            <div className="flex flex-col w-full space-y-2">
                              <Button variant="outline" className="w-full">
                                Enregistrer des échantillons
                              </Button>
                              <Button disabled className="w-full">
                                Démarrer l'entraînement
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      <div>
                        <Card className="border-2 border-dashed border-gray-300 hover:border-primary p-6">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-primary/10">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                <circle cx="12" cy="12" r="4" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium">Télédétection</h3>
                            <p className="text-sm text-gray-500">
                              Entraînez des modèles pour l'analyse de données satellitaires, la surveillance environnementale et la détection d'objets à distance.
                            </p>
                            <div className="flex flex-col w-full space-y-2">
                              <Button variant="outline" className="w-full">
                                Importer des données
                              </Button>
                              <Button disabled className="w-full">
                                Démarrer l'entraînement
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      <div>
                        <Card className="border-2 border-dashed border-gray-300 hover:border-primary p-6">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-primary/10">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <circle cx="10" cy="13" r="2" />
                                <path d="m20 17-2-2-2 2-2-2-2 2-2-2" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium">Traitement du langage</h3>
                            <p className="text-sm text-gray-500">
                              Développez des modèles de compréhension du langage naturel, d'analyse de sentiment et de classification de texte.
                            </p>
                            <div className="flex flex-col w-full space-y-2">
                              <Button variant="outline" className="w-full">
                                Préparer un corpus
                              </Button>
                              <Button disabled className="w-full">
                                Démarrer l'entraînement
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                    
                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2 text-blue-700 dark:text-blue-300">Filtrer des services spécifiques</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="service-classification" className="rounded border-gray-300" />
                          <label htmlFor="service-classification" className="text-sm">Classification</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="service-recognition" className="rounded border-gray-300" />
                          <label htmlFor="service-recognition" className="text-sm">Reconnaissance</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="service-generation" className="rounded border-gray-300" />
                          <label htmlFor="service-generation" className="text-sm">Génération</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="service-analysis" className="rounded border-gray-300" />
                          <label htmlFor="service-analysis" className="text-sm">Analyse</label>
                        </div>
                      </div>
                      <Button size="sm" className="mt-2">Appliquer les filtres</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            {/* Onglet Détection d'intention */}
            <TabsContent value="intent">
              <Card>
                <div className="p-4">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Détection d'intention du client</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="intent-input">Message du client</Label>
                          <Textarea
                            id="intent-input"
                            placeholder="Entrez un message client pour analyser son intention..."
                            rows={5}
                            className="w-full mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label className="block mb-2">Type d'analyse</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <input type="radio" id="intent-type-general" name="intent-type" className="rounded-full border-gray-300" checked />
                              <label htmlFor="intent-type-general" className="text-sm">Intention générale</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="radio" id="intent-type-specific" name="intent-type" className="rounded-full border-gray-300" />
                              <label htmlFor="intent-type-specific" className="text-sm">Intention spécifique</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="radio" id="intent-type-sentiment" name="intent-type" className="rounded-full border-gray-300" />
                              <label htmlFor="intent-type-sentiment" className="text-sm">Analyse de sentiment</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="radio" id="intent-type-topic" name="intent-type" className="rounded-full border-gray-300" />
                              <label htmlFor="intent-type-topic" className="text-sm">Extraction de sujets</label>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="block mb-2">Options avancées</Label>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="intent-multilingual" className="rounded border-gray-300" />
                              <label htmlFor="intent-multilingual" className="text-sm">Analyse multilingue</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="intent-context" className="rounded border-gray-300" />
                              <label htmlFor="intent-context" className="text-sm">Utiliser le contexte conversationnel</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="intent-entities" className="rounded border-gray-300" />
                              <label htmlFor="intent-entities" className="text-sm">Extraire les entités nommées</label>
                            </div>
                          </div>
                        </div>
                        
                        <Button className="w-full">
                          Analyser l'intention
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md h-[350px] overflow-auto">
                          <h3 className="text-lg font-medium mb-4">Résultat de l'analyse</h3>
                          <div className="space-y-4">
                            <div className="p-3 border rounded-md">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Intention principale</span>
                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">96%</span>
                              </div>
                              <p className="text-md mt-1">Demande d'information</p>
                            </div>
                            
                            <div className="p-3 border rounded-md">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Intentions secondaires</span>
                              </div>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Comparaison de produits</span>
                                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">45%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Demande de prix</span>
                                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">32%</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3 border rounded-md">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Entités détectées</span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">Produit: Module IA</span>
                                <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">Fonctionnalité: Détection</span>
                                <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">Date: Vendredi prochain</span>
                              </div>
                            </div>
                            
                            <div className="p-3 border rounded-md">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Sentiment global</span>
                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">Positif</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "72%" }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1">
                            Exporter le rapport
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Sauvegarder le modèle
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* IActivex Mobile Component - Toujours visible */}
      {showActivex && <IAActivexMobile />}
    </div>
  );
}