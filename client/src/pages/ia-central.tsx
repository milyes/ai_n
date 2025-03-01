import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { IAActivexMobile } from '@/components/ai/ia-activex-mobile';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [showActivex, setShowActivex] = useState(true);
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
            <Button 
              variant="outline"
              onClick={() => setShowActivex(prev => !prev)}
            >
              {showActivex ? 'Masquer IActivex' : 'Afficher IActivex'}
            </Button>
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
          </Tabs>
        </div>
      </main>
      
      {/* IActivex Mobile Component */}
      {showActivex && <IAActivexMobile onClose={() => setShowActivex(false)} />}
    </div>
  );
}