import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MascotAnimation, MascotState } from '@/components/mascot/mascot-animation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InnovationConsoleProps {
  onExecute?: (command: string) => Promise<any>;
  initialCommands?: string[];
  title?: string;
  description?: string;
  className?: string;
  showMascot?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

interface LogEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * Composant de console d'innovation pour le module IA
 * Une interface de console interactive avec animations et mascotte
 */
export function InnovationConsole({
  onExecute,
  initialCommands = [],
  title = "Console d'Innovation IA",
  description = "Explorez les fonctionnalités avancées du module IA",
  className,
  showMascot = true,
  theme = 'system'
}: InnovationConsoleProps) {
  // États
  const [command, setCommand] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [mascotMessage, setMascotMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('console');
  const [consoleTheme, setConsoleTheme] = useState<'light' | 'dark' | 'system'>(theme);
  
  // Ref pour le scroll automatique
  const consoleEndRef = useRef<HTMLDivElement>(null);
  
  // Commandes prédéfinies pour l'aide
  const predefinedCommands = {
    help: "Affiche la liste des commandes disponibles",
    clear: "Efface le contenu de la console",
    echo: "Affiche un message (echo <message>)",
    status: "Vérifie le statut des services IA",
    modules: "Liste les modules IA disponibles",
    analyze: "Analyse un texte (analyze <texte>)",
    mascot: "Change l'état de la mascotte (mascot <état>)",
    theme: "Change le thème de la console (theme <light|dark|system>)",
    internet: "Accède à Internet Intelligence (internet <query>)",
    connect: "Connecte à un service externe (connect <service>)",
    fetch: "Récupère des données d'une source (fetch <source> <params>)",
    clone: "Clone la console pour des opérations parallèles (clone <nom>)"
  };
  
  // Effet pour défiler automatiquement vers le bas
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  // Effet pour exécuter les commandes initiales
  useEffect(() => {
    if (initialCommands.length > 0) {
      // Ajouter un message de bienvenue
      addSystemLog("📊 Console d'Innovation IA initialisée");
      addSystemLog("🤖 Tapez 'help' pour voir les commandes disponibles");
      
      // Exécuter les commandes initiales avec un délai
      let delay = 500;
      initialCommands.forEach((cmd) => {
        setTimeout(() => {
          handleCommand(cmd);
        }, delay);
        delay += 1500;
      });
    }
  }, []);
  
  // Fonction pour ajouter une entrée de log
  const addLog = (type: LogEntry['type'], content: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      type,
      content,
      timestamp: new Date()
    };
    
    setLogs(prev => [...prev, newLog]);
  };
  
  // Fonctions pour chaque type de log
  const addInputLog = (content: string) => addLog('input', content);
  const addOutputLog = (content: string) => addLog('output', content);
  const addErrorLog = (content: string) => addLog('error', content);
  const addSystemLog = (content: string) => addLog('system', content);
  
  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!command.trim() || isExecuting) return;
    
    handleCommand(command);
    setCommand('');
  };
  
  // Fonction pour gérer l'exécution d'une commande
  const handleCommand = async (cmd: string) => {
    // Ajouter la commande au log
    addInputLog(cmd);
    
    // Analyser la commande
    const parts = cmd.trim().split(' ');
    const mainCommand = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    // Gérer les commandes internes
    switch (mainCommand) {
      case 'help':
        setMascotState('greeting');
        setMascotMessage('Je peux vous aider !');
        setTimeout(() => {
          setMascotState('idle');
          setMascotMessage('');
        }, 3000);
        
        addOutputLog("📋 Commandes disponibles:");
        Object.entries(predefinedCommands).forEach(([command, description]) => {
          addOutputLog(`  • ${command} - ${description}`);
        });
        break;
        
      case 'clear':
        setLogs([]);
        addSystemLog("Console effacée");
        break;
        
      case 'echo':
        if (args) {
          addOutputLog(args);
        } else {
          addErrorLog("Usage: echo <message>");
        }
        break;
        
      case 'status':
        setMascotState('working');
        setMascotMessage('Vérification des services...');
        
        setTimeout(() => {
          addOutputLog("✅ Service IA principal: Actif");
          addOutputLog("✅ Service de traitement NLP: Actif");
          addOutputLog("✅ Service d'analyse d'image: Actif");
          addOutputLog("✅ Service de reconnaissance vocale: Actif");
          
          setMascotState('success');
          setMascotMessage('Tous les services sont actifs !');
          
          setTimeout(() => {
            setMascotState('idle');
            setMascotMessage('');
          }, 2000);
        }, 1500);
        break;
        
      case 'modules':
        setMascotState('thinking');
        setMascotMessage('Recherche des modules...');
        
        setTimeout(() => {
          addOutputLog("📚 Modules IA disponibles:");
          addOutputLog("  • Porte Automatique - Contrôle d'accès par empreinte digitale");
          addOutputLog("  • Analyse de sentiment - Évaluation de texte");
          addOutputLog("  • Résumé automatique - Condensation de texte");
          addOutputLog("  • Reconnaissance visuelle - Analyse d'images");
          addOutputLog("  • IA Conversationnelle - Dialogue naturel");
          
          setMascotState('idle');
          setMascotMessage('');
        }, 1500);
        break;
        
      case 'analyze':
        if (!args) {
          addErrorLog("Usage: analyze <texte>");
          break;
        }
        
        setMascotState('thinking');
        setMascotMessage('Analyse en cours...');
        setIsExecuting(true);
        
        setTimeout(() => {
          const sentiment = Math.random() > 0.5 ? 'positif' : 'négatif';
          const confidence = (Math.random() * 0.5 + 0.5).toFixed(2);
          
          addOutputLog("🔍 Résultat d'analyse:");
          addOutputLog(`  • Texte: "${args}"`);
          addOutputLog(`  • Sentiment: ${sentiment}`);
          addOutputLog(`  • Confiance: ${confidence}`);
          
          setMascotState('success');
          setMascotMessage('Analyse terminée !');
          setIsExecuting(false);
          
          setTimeout(() => {
            setMascotState('idle');
            setMascotMessage('');
          }, 2000);
        }, 2000);
        break;
        
      case 'mascot':
        const validStates = ['idle', 'greeting', 'working', 'thinking', 'success', 'error', 'sleeping', 'excited'];
        const newState = args.toLowerCase();
        
        if (validStates.includes(newState)) {
          setMascotState(newState as MascotState);
          addOutputLog(`Mascotte en état: ${newState}`);
          setMascotMessage(`Je suis maintenant en état: ${newState}`);
          
          if (newState !== 'idle' && newState !== 'sleeping') {
            setTimeout(() => {
              setMascotState('idle');
              setMascotMessage('');
            }, 5000);
          }
        } else {
          addErrorLog(`État invalide. Utilisez l'un des états suivants: ${validStates.join(', ')}`);
        }
        break;
        
      case 'theme':
        if (['light', 'dark', 'system'].includes(args.toLowerCase())) {
          setConsoleTheme(args.toLowerCase() as 'light' | 'dark' | 'system');
          addOutputLog(`Thème changé en: ${args.toLowerCase()}`);
        } else {
          addErrorLog("Usage: theme <light|dark|system>");
        }
        break;
        
      case 'internet':
        if (!args) {
          addErrorLog("Usage: internet <query>");
          break;
        }
        
        setMascotState('thinking');
        setMascotMessage('Recherche Internet Intelligence...');
        setIsExecuting(true);
        
        setTimeout(() => {
          addOutputLog("🌐 Accès Internet Intelligence");
          addOutputLog(`Requête: "${args}"`);
          addOutputLog("Connexion aux bases de données externes...");
          
          setTimeout(() => {
            addOutputLog("Résultats trouvés: 3 sources");
            
            // Simuler des résultats de recherche
            const results = [
              {
                source: "Base de données principale",
                confidence: 0.89,
                data: "Accès autorisé aux données d'exploitation de niveau 1"
              },
              {
                source: "Serveur externe",
                confidence: 0.76,
                data: "Synchronisation terminée avec le serveur central"
              },
              {
                source: "API tierce",
                confidence: 0.92,
                data: "Nouvelle mise à jour disponible pour le module réseau"
              }
            ];
            
            results.forEach((result, index) => {
              setTimeout(() => {
                addOutputLog(`Source ${index + 1}: ${result.source}`);
                addOutputLog(`  • Confiance: ${result.confidence}`);
                addOutputLog(`  • Données: ${result.data}`);
                addOutputLog("");
                
                if (index === results.length - 1) {
                  addOutputLog("Fin de la recherche Internet Intelligence.");
                  setMascotState('success');
                  setMascotMessage('Recherche terminée !');
                  setIsExecuting(false);
                  
                  setTimeout(() => {
                    setMascotState('idle');
                    setMascotMessage('');
                  }, 2000);
                }
              }, index * 1000);
            });
          }, 1500);
        }, 2000);
        break;
        
      case 'connect':
        if (!args) {
          addErrorLog("Usage: connect <service>");
          break;
        }
        
        setMascotState('working');
        setMascotMessage('Tentative de connexion...');
        setIsExecuting(true);
        
        setTimeout(() => {
          const services = ["database", "api", "cloud", "proxy", "vpn"];
          const serviceRequested = args.toLowerCase();
          
          if (services.includes(serviceRequested)) {
            addOutputLog(`🔌 Connexion au service: ${serviceRequested}`);
            addOutputLog("Authentification en cours...");
            
            setTimeout(() => {
              addOutputLog("Authentification réussie !");
              addOutputLog(`Connecté au service: ${serviceRequested}`);
              addOutputLog("Session active: ID-" + Math.floor(Math.random() * 10000));
              
              setMascotState('success');
              setMascotMessage('Connexion établie !');
            }, 1500);
          } else {
            addErrorLog(`Service inconnu: ${serviceRequested}`);
            addErrorLog(`Services disponibles: ${services.join(", ")}`);
            
            setMascotState('error');
            setMascotMessage('Service non trouvé');
          }
          
          setTimeout(() => {
            setIsExecuting(false);
            setMascotState('idle');
            setMascotMessage('');
          }, 3000);
        }, 2000);
        break;
        
      case 'fetch':
        if (!args) {
          addErrorLog("Usage: fetch <source> <params>");
          break;
        }
        
        const fetchParts = args.split(' ');
        const source = fetchParts[0];
        const params = fetchParts.slice(1).join(' ');
        
        if (!source) {
          addErrorLog("Source requise. Usage: fetch <source> <params>");
          break;
        }
        
        setMascotState('working');
        setMascotMessage('Récupération des données...');
        setIsExecuting(true);
        
        setTimeout(() => {
          addOutputLog(`📥 Récupération depuis: ${source}`);
          if (params) {
            addOutputLog(`Paramètres: ${params}`);
          }
          
          setTimeout(() => {
            // Générer des données fictives basées sur la source
            let data;
            switch (source.toLowerCase()) {
              case 'users':
                data = {
                  total: 128,
                  active: 98,
                  admins: 5,
                  lastActive: "il y a 2 minutes"
                };
                break;
              case 'sensors':
                data = {
                  online: 24,
                  offline: 3,
                  alerts: 2,
                  battery: "78% en moyenne"
                };
                break;
              case 'logs':
                data = {
                  today: 1432,
                  errors: 7,
                  warnings: 23,
                  critical: 1
                };
                break;
              default:
                data = {
                  status: "ok",
                  timestamp: new Date().toISOString(),
                  source: source
                };
            }
            
            addOutputLog("Données récupérées:");
            addOutputLog(JSON.stringify(data, null, 2));
            
            setMascotState('success');
            setMascotMessage('Données récupérées !');
            
            setTimeout(() => {
              setIsExecuting(false);
              setMascotState('idle');
              setMascotMessage('');
            }, 2000);
          }, 1500);
        }, 1000);
        break;
        
      case 'clone':
        if (!args) {
          addErrorLog("Usage: clone <nom>");
          break;
        }
        
        setMascotState('working');
        setMascotMessage('Clonage de la console...');
        setIsExecuting(true);
        
        setTimeout(() => {
          addOutputLog(`🖥️ Démarrage du clonage de la console: "${args}"`);
          addOutputLog("Préparation de l'environnement d'exécution parallèle...");
          
          setTimeout(() => {
            addOutputLog("Allocation des ressources système pour le clone...");
            
            setTimeout(() => {
              const sessionId = Math.floor(Math.random() * 90000) + 10000;
              addOutputLog(`Terminal IA_clone_terminal créé avec succès !`);
              addOutputLog(`ID de session: ${sessionId}`);
              addOutputLog(`Nom du clone: ${args}`);
              addOutputLog(`État: Actif et en attente de commandes`);
              addOutputLog("");
              addOutputLog("Le terminal cloné peut désormais exécuter des opérations en parallèle.");
              addOutputLog("Utilisez la commande 'connect terminal_clone ${args}' pour y accéder directement.");
              
              setMascotState('success');
              setMascotMessage('Clone créé avec succès !');
              
              // Ajoutez un bouton rapide pour le terminal cloné
              const newCommand = { label: `Clone: ${args}`, command: `connect terminal_clone ${args}` };
              if (!quickCommands.some(cmd => cmd.label.includes(args))) {
                // Ne pas ajouter de quickCommands ici car c'est un état React et ça provoquerait un rendu en boucle
                // Nous indiquons simplement à l'utilisateur comment accéder au clone
              }
              
              setTimeout(() => {
                setIsExecuting(false);
                setMascotState('idle');
                setMascotMessage('');
              }, 2000);
            }, 1500);
          }, 1200);
        }, 1000);
        break;
        
      default:
        // Essayer d'exécuter la commande via le handler externe
        if (onExecute) {
          try {
            setIsExecuting(true);
            setMascotState('working');
            setMascotMessage('Exécution en cours...');
            
            const result = await onExecute(cmd);
            
            if (result) {
              if (typeof result === 'string') {
                addOutputLog(result);
              } else {
                addOutputLog(JSON.stringify(result, null, 2));
              }
              setMascotState('success');
              setMascotMessage('Exécution réussie !');
            } else {
              addOutputLog("Commande exécutée");
              setMascotState('idle');
            }
          } catch (error: any) {
            addErrorLog(`Erreur: ${error?.message || "Une erreur est survenue"}`);
            setMascotState('error');
            setMascotMessage('Oups ! Une erreur est survenue.');
          } finally {
            setIsExecuting(false);
            setTimeout(() => {
              setMascotState('idle');
              setMascotMessage('');
            }, 2000);
          }
        } else {
          addErrorLog(`Commande non reconnue: ${mainCommand}`);
          setMascotState('error');
          setMascotMessage('Commande inconnue');
          
          setTimeout(() => {
            setMascotState('idle');
            setMascotMessage('');
          }, 2000);
        }
    }
  };
  
  // Formatage du timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Obtenir la couleur en fonction du type de log
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'input':
        return 'text-blue-500 dark:text-blue-400';
      case 'output':
        return 'text-foreground';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      case 'system':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-foreground';
    }
  };
  
  // Obtenir le préfixe en fonction du type de log
  const getLogPrefix = (type: LogEntry['type']) => {
    switch (type) {
      case 'input':
        return '> ';
      case 'output':
        return '';
      case 'error':
        return '❌ ';
      case 'system':
        return '🔧 ';
      default:
        return '';
    }
  };
  
  // Commandes rapides
  const quickCommands = [
    { label: 'Status', command: 'status' },
    { label: 'Modules', command: 'modules' },
    { label: 'Internet', command: 'internet search' },
    { label: 'Clone', command: 'clone IA_terminal' },
    { label: 'Help', command: 'help' },
    { label: 'Clear', command: 'clear' }
  ];
  
  return (
    <Card 
      className={cn(
        "w-full max-w-4xl mx-auto overflow-hidden border-2",
        consoleTheme === 'dark' ? 'bg-gray-900 text-white border-blue-500' : 
        consoleTheme === 'light' ? 'bg-white text-gray-900 border-blue-300' : '',
        className
      )}
    >
      <CardHeader className="px-4 py-2 border-b flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center">
            <span className="material-icons mr-2">terminal</span>
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        
        {showMascot && (
          <div className="flex-shrink-0">
            <MascotAnimation 
              state={mascotState} 
              size="sm"
              message={mascotMessage}
              className="mr-2"
            />
          </div>
        )}
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="console" className="flex-1">Console</TabsTrigger>
          <TabsTrigger value="help" className="flex-1">Aide</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">Paramètres</TabsTrigger>
        </TabsList>
        
        <TabsContent value="console" className="mt-0">
          <CardContent 
            className={cn(
              "h-80 overflow-y-auto p-3 font-mono text-sm",
              consoleTheme === 'dark' ? 'bg-gray-900 text-gray-200' : 
              consoleTheme === 'light' ? 'bg-white text-gray-800' : ''
            )}
          >
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "whitespace-pre-wrap mb-1",
                    getLogColor(log.type)
                  )}
                >
                  <span className="text-gray-500 mr-2">[{formatTimestamp(log.timestamp)}]</span>
                  <span>{getLogPrefix(log.type)}</span>
                  {log.content}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={consoleEndRef} />
          </CardContent>
          
          <div className="p-3 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <span className="text-primary font-bold">$</span>
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Entrez une commande..."
                disabled={isExecuting}
                className={cn(
                  "flex-1 font-mono",
                  consoleTheme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 
                  consoleTheme === 'light' ? 'bg-white text-gray-900 border-gray-300' : ''
                )}
              />
              <Button type="submit" disabled={isExecuting || !command.trim()}>
                {isExecuting ? (
                  <span className="material-icons animate-spin">sync</span>
                ) : (
                  <span className="material-icons">send</span>
                )}
              </Button>
            </form>
          </div>
          
          <CardFooter className="border-t p-2 flex-wrap gap-2">
            {quickCommands.map((cmd) => (
              <Button
                key={cmd.command}
                variant="outline"
                size="sm"
                onClick={() => handleCommand(cmd.command)}
                disabled={isExecuting}
                className="text-xs"
              >
                {cmd.label}
              </Button>
            ))}
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="help" className="mt-0">
          <CardContent className="p-4">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Commandes disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(predefinedCommands).map(([cmd, desc]) => (
                    <div key={cmd} className="flex gap-2 p-2 border rounded-md">
                      <Badge variant="outline" className="font-mono">
                        {cmd}
                      </Badge>
                      <span className="text-sm">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Utilisation</h3>
                <p>
                  Entrez une commande dans la zone de texte et appuyez sur Entrée pour l'exécuter.
                  Utilisez les boutons de commandes rapides pour exécuter des commandes fréquentes.
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-md flex items-start">
                <span className="material-icons text-blue-500 mr-2 mt-1">info</span>
                <div>
                  <h4 className="font-semibold">Conseils</h4>
                  <p className="text-sm mt-1">
                    Essayez la commande <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">status</code> pour vérifier l'état des services IA,
                    ou <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">analyze Ce texte est un exemple.</code> pour tester l'analyse de sentiment.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <CardContent className="p-4">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Paramètres d'affichage</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant={consoleTheme === 'light' ? 'default' : 'outline'}
                    onClick={() => setConsoleTheme('light')}
                    className="justify-start"
                  >
                    <span className="material-icons mr-2">light_mode</span>
                    Thème clair
                  </Button>
                  
                  <Button
                    variant={consoleTheme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setConsoleTheme('dark')}
                    className="justify-start"
                  >
                    <span className="material-icons mr-2">dark_mode</span>
                    Thème sombre
                  </Button>
                  
                  <Button
                    variant={consoleTheme === 'system' ? 'default' : 'outline'}
                    onClick={() => setConsoleTheme('system')}
                    className="justify-start"
                  >
                    <span className="material-icons mr-2">computer</span>
                    Système
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setLogs([])}>
                  <span className="material-icons mr-2">delete</span>
                  Effacer l'historique
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}