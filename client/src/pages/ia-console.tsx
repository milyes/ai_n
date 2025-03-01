import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InnovationConsole } from '@/components/ai/innovation-console';
import { MascotAnimation } from '@/components/mascot/mascot-animation';

export default function IAConsolePage() {
  const [activeTab, setActiveTab] = useState('console');
  const [consoleTheme, setConsoleTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Commandes initiales à exécuter automatiquement
  const initialCommands = [
    'echo Bienvenue à la console d\'innovation IA',
    'echo Initialisation des modules en cours...',
    'status',
    'echo Connexion au service Internet Intelligence établie',
    'internet search'
  ];
  
  // Fonction de simulation d'exécution de commande externe
  const handleExecute = async (command: string): Promise<any> => {
    // Simulation de différentes commandes personnalisées
    if (command.startsWith('scan network')) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        status: 'success',
        devices: [
          { id: 1, name: 'Capteur Hall A', status: 'online', lastHeartbeat: '2 minutes ago' },
          { id: 2, name: 'Capteur de mouvement', status: 'online', lastHeartbeat: '30 seconds ago' },
          { id: 3, name: 'Caméra de surveillance', status: 'offline', lastHeartbeat: '1 day ago' }
        ]
      };
    }
    
    if (command.startsWith('predict')) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const args = command.replace('predict', '').trim();
      
      if (!args) {
        throw new Error('Arguments requis pour la prédiction');
      }
      
      return {
        input: args,
        prediction: Math.random() > 0.5 ? 'Autorisé' : 'Refusé',
        confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
        processed_at: new Date().toISOString()
      };
    }
    
    if (command.startsWith('benchmark')) {
      await new Promise(resolve => setTimeout(resolve, 4000));
      return `
Benchmark IA - Résultats
------------------------
Temps de réponse moyen: 124ms
Précision: 96.4%
Charge CPU: 23.5%
Charge mémoire: 512MB

Performance globale: Excellente
      `;
    }
    
    // Commandes non reconnues
    return null;
  };
  
  return (
    <div className="container py-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Centre de Contrôle IA</h1>
          <p className="text-muted-foreground">
            Accédez aux fonctionnalités avancées du module d'intelligence artificielle
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <MascotAnimation 
            state="greeting" 
            size="md"
            message="Bienvenue au Centre de Contrôle IA !"
            name="NetBot"
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="console" className="flex-1">
            <span className="material-icons mr-2">terminal</span>
            Console
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex-1">
            <span className="material-icons mr-2">dashboard</span>
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex-1">
            <span className="material-icons mr-2">apps</span>
            Modules
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="console">
          <InnovationConsole 
            onExecute={handleExecute}
            initialCommands={initialCommands}
            showMascot={true}
            theme={consoleTheme}
          />
          
          <div className="mt-4 bg-muted/50 p-4 rounded-md">
            <h2 className="text-lg font-medium mb-2">Exemples de commandes spéciales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="bg-background">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm font-medium">Scan du réseau</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <code className="text-xs bg-muted p-1 rounded block">scan network</code>
                  <p className="text-xs text-muted-foreground mt-1">Analyse tous les appareils connectés au réseau</p>
                </CardContent>
              </Card>
              
              <Card className="bg-background">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm font-medium">Prédiction d'accès</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <code className="text-xs bg-muted p-1 rounded block">predict [empreinte]</code>
                  <p className="text-xs text-muted-foreground mt-1">Simule une prédiction d'autorisation d'accès</p>
                </CardContent>
              </Card>
              
              <Card className="bg-background">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm font-medium">Test de performance</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <code className="text-xs bg-muted p-1 rounded block">benchmark</code>
                  <p className="text-xs text-muted-foreground mt-1">Lance un test de performance sur le système IA</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance du système</CardTitle>
                <CardDescription>Métriques en temps réel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Charge CPU</h3>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: '23%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>23%</span>
                    <span className="text-muted-foreground">Faible</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Mémoire</h3>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500" 
                      style={{ width: '67%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>67%</span>
                    <span className="text-muted-foreground">1.2 GB / 2 GB</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Précision IA</h3>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: '96%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>96%</span>
                    <span className="text-muted-foreground">Excellente</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Temps de réponse</h3>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: '35%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>124ms</span>
                    <span className="text-muted-foreground">Optimal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Dernières opérations du système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '14:32:45', type: 'info', message: 'Vérification des services terminée' },
                    { time: '14:30:12', type: 'success', message: 'Accès autorisé pour utilisateur: Technician-1' },
                    { time: '14:25:38', type: 'error', message: 'Tentative d\'accès non autorisée' },
                    { time: '14:20:05', type: 'warning', message: 'Mise à jour du modèle IA nécessaire' },
                    { time: '14:15:22', type: 'info', message: 'Synchronisation des données terminée' }
                  ].map((log, index) => (
                    <div key={index} className="flex items-start">
                      <Badge
                        className={`${
                          log.type === 'info' ? 'bg-blue-100 text-blue-800' :
                          log.type === 'success' ? 'bg-green-100 text-green-800' :
                          log.type === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        } mr-2 mt-1`}
                      >
                        {log.type.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-muted-foreground">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="modules">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Porte Automatique',
                icon: 'fingerprint',
                status: 'active',
                description: 'Système de contrôle d\'accès par empreinte digitale',
                route: '/porte-automatique'
              },
              {
                name: 'Analyse de sentiment',
                icon: 'sentiment_satisfied_alt',
                status: 'active',
                description: 'Module d\'analyse émotionnelle des textes',
                route: '/ai'
              },
              {
                name: 'Internet Intelligence',
                icon: 'public',
                status: 'active',
                description: 'Accès aux données d\'exploitation externes',
                route: '/ia-console'
              },
              {
                name: 'Résumé automatique',
                icon: 'summarize',
                status: 'active',
                description: 'Condensation intelligente de documents',
                route: '/ai'
              },
              {
                name: 'Reconnaissance visuelle',
                icon: 'visibility',
                status: 'inactive',
                description: 'Analyse et détection d\'objets dans les images',
                route: '#'
              },
              {
                name: 'Prédiction comportementale',
                icon: 'psychology',
                status: 'inactive',
                description: 'Anticipe les actions de l\'utilisateur',
                route: '#'
              },
              {
                name: 'Assistant conversationnel',
                icon: 'chat',
                status: 'active',
                description: 'Interface de dialogue en langage naturel',
                route: '/mascot'
              },
            ].map((module, index) => (
              <Card key={index} className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className="material-icons text-3xl text-primary">{module.icon}</span>
                    <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                      {module.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">{module.name}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="material-icons text-sm mr-1">info</span>
                    <span>Module v2.4</span>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button 
                    variant={module.status === 'active' ? 'default' : 'outline'}
                    disabled={module.status !== 'active'}
                    className="w-full"
                    onClick={() => window.location.href = module.route}
                  >
                    Accéder au module
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}