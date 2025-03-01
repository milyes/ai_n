import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssistantAnimation } from './assistant-animation';
import { MascotAnimation } from '@/components/mascot/mascot-animation';
import { useToast } from '@/hooks/use-toast';

interface AutoAssistServiceProps {
  initialActive?: boolean;
  onStatusChange?: (active: boolean) => void;
  showMascot?: boolean;
}

export type AssistanceTask = {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  description: string;
  result?: string;
  timestamp: Date;
};

export type AssistanceProfile = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  automationLevel: number; // 1-5
  triggers: string[];
  actions: string[];
};

/**
 * Service d'assistance IA automatique
 * Fournit des réponses et actions automatisées basées sur l'activité utilisateur
 */
export function AutoAssistService({
  initialActive = false,
  onStatusChange,
  showMascot = true
}: AutoAssistServiceProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [tasks, setTasks] = useState<AssistanceTask[]>([]);
  const [profiles, setProfiles] = useState<AssistanceProfile[]>([]);
  const [automationLevel, setAutomationLevel] = useState(3);
  const [currentTask, setCurrentTask] = useState<AssistanceTask | null>(null);
  const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const { toast } = useToast();
  const taskTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser les profils par défaut
  useEffect(() => {
    setProfiles([
      {
        id: '1',
        name: 'Assistance Navigation',
        description: 'Suggère automatiquement des pages et ressources pertinentes pendant la navigation',
        active: true,
        automationLevel: 3,
        triggers: ['page_view', 'scroll_end', 'user_inactive'],
        actions: ['suggest_content', 'highlight_features', 'show_tips']
      },
      {
        id: '2',
        name: 'Surveillance Réseau',
        description: 'Détecte et alerte sur les anomalies de trafic réseau',
        active: true,
        automationLevel: 4,
        triggers: ['traffic_spike', 'unusual_pattern', 'security_alert'],
        actions: ['send_alert', 'log_event', 'suggest_action']
      },
      {
        id: '3',
        name: 'Optimisation Configuration',
        description: 'Suggère des optimisations pour les modules et configurations système',
        active: false,
        automationLevel: 2,
        triggers: ['performance_drop', 'resource_usage', 'config_change'],
        actions: ['suggest_optimization', 'auto_adjust', 'schedule_maintenance']
      }
    ]);

    // Ajouter des tâches d'exemple
    setTasks([
      {
        id: '101',
        title: 'Analyse des modules inactifs',
        status: 'completed',
        progress: 100,
        description: 'Vérification des modules non utilisés et suggestion d\'optimisation',
        result: 'Modules "Vision IA" et "Prédiction comportementale" non utilisés. Suggestion: désactiver temporairement pour économiser les ressources.',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '102',
        title: 'Surveillance trafic réseau',
        status: 'completed',
        progress: 100,
        description: 'Analyse du trafic réseau pour détecter des anomalies',
        result: 'Aucune anomalie détectée dans le trafic réseau au cours des dernières 24 heures.',
        timestamp: new Date(Date.now() - 7200000)
      }
    ]);
  }, []);

  // Activer/désactiver le service
  const toggleService = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    
    if (newStatus) {
      toast({
        title: "Assistant IA automatique activé",
        description: "L'assistant IA surveille maintenant votre activité pour fournir une assistance proactive",
      });
      simulateNewTask();
    } else {
      toast({
        title: "Assistant IA automatique désactivé",
        description: "L'assistant ne fournira plus d'assistance automatique",
      });
      
      if (taskTimerRef.current) {
        clearTimeout(taskTimerRef.current);
        taskTimerRef.current = null;
      }
    }
  };

  // Simuler une nouvelle tâche d'assistance
  const simulateNewTask = () => {
    if (!isActive) return;
    
    const taskTypes = [
      {
        title: 'Analyse des performances système',
        description: 'Vérification des performances et identification des goulots d\'étranglement',
      },
      {
        title: 'Optimisation de la sécurité',
        description: 'Analyse des configurations de sécurité et suggestion de renforcement',
      },
      {
        title: 'Vérification des mises à jour',
        description: 'Recherche de mises à jour disponibles pour les modules IA',
      },
      {
        title: 'Analyse de données utilisateur',
        description: 'Analyse des schémas d\'utilisation pour améliorer l\'expérience',
      },
      {
        title: 'Maintenance prédictive',
        description: 'Détection proactive des problèmes potentiels avant qu\'ils ne surviennent',
      }
    ];
    
    const randomTaskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    
    const newTask: AssistanceTask = {
      id: Date.now().toString(),
      title: randomTaskType.title,
      status: 'pending',
      progress: 0,
      description: randomTaskType.description,
      timestamp: new Date()
    };
    
    setTasks(prev => [newTask, ...prev]);
    processTask(newTask);
    
    // Programmer la prochaine tâche
    const delay = 30000 + Math.random() * 60000; // Entre 30s et 90s
    taskTimerRef.current = setTimeout(simulateNewTask, delay);
  };

  // Traiter une tâche
  const processTask = (task: AssistanceTask) => {
    setAssistantState('thinking');
    setCurrentTask({...task, status: 'processing'});
    
    // Mise à jour de l'état des tâches
    setTasks(prev => prev.map(t => 
      t.id === task.id ? {...t, status: 'processing'} : t
    ));
    
    // Simuler la progression de la tâche
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        completeTask(task.id);
      }
      
      setCurrentTask(curr => curr ? {...curr, progress} : null);
      setTasks(prev => prev.map(t => 
        t.id === task.id ? {...t, progress} : t
      ));
    }, 500);
  };

  // Compléter une tâche
  const completeTask = (taskId: string) => {
    const resultMessages = [
      "Analyse complétée avec succès. Aucun problème détecté.",
      "Optimisations identifiées et appliquées automatiquement.",
      "Recommandations générées pour améliorer les performances système.",
      "Problème potentiel identifié dans la configuration. Suggestions de correction générées.",
      "Analyse terminée avec succès. Résultats sauvegardés dans les rapports système."
    ];
    
    const result = resultMessages[Math.floor(Math.random() * resultMessages.length)];
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? {...t, status: 'completed', progress: 100, result} : t
    ));
    
    setCurrentTask(null);
    setAssistantState('idle');
    
    toast({
      title: "Tâche d'assistance complétée",
      description: result,
    });
  };

  // Ajouter un nouveau profil
  const addNewProfile = () => {
    if (!newProfileName.trim()) return;
    
    const newProfile: AssistanceProfile = {
      id: Date.now().toString(),
      name: newProfileName,
      description: newProfileDesc || 'Description personnalisée',
      active: true,
      automationLevel,
      triggers: ['custom_trigger'],
      actions: ['custom_action']
    };
    
    setProfiles(prev => [...prev, newProfile]);
    setNewProfileName('');
    setNewProfileDesc('');
    
    toast({
      title: "Nouveau profil d'assistance créé",
      description: `Le profil "${newProfileName}" a été ajouté avec succès`,
    });
  };

  // Toggler un profil
  const toggleProfile = (profileId: string) => {
    setProfiles(prev => prev.map(p => 
      p.id === profileId ? {...p, active: !p.active} : p
    ));
  };

  return (
    <div className="auto-assist-service">
      <Card className="p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Assistant IA Automatique</h3>
            <Badge className={isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}>
              {isActive ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Niveau d'automatisation: {automationLevel}/5</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{isActive ? 'Activé' : 'Désactivé'}</span>
            <Switch checked={isActive} onCheckedChange={toggleService} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 flex flex-col items-center justify-center">
            {showMascot ? (
              <MascotAnimation 
                state={currentTask ? "working" : isActive ? "idle" : "sleeping"}
                size="md"
                message={currentTask?.title}
                loop={true}
              />
            ) : (
              <AssistantAnimation
                state={assistantState}
                size="md"
                message={currentTask?.title}
              />
            )}
            <div className="text-center mt-2">
              <p className="text-sm font-medium">
                {currentTask 
                  ? `Traitement: ${currentTask.title}`
                  : isActive 
                    ? "Assistant en attente"
                    : "Assistant en veille"
                }
              </p>
              {currentTask && (
                <Progress 
                  value={currentTask.progress} 
                  className="h-2 mt-2 w-full" 
                />
              )}
            </div>
          </div>
          
          <div className="col-span-2">
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="tasks">Tâches</TabsTrigger>
                <TabsTrigger value="profiles">Profils d'assistance</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md max-h-[200px] overflow-y-auto">
                  {tasks.length > 0 ? (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div key={task.id} className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{task.title}</span>
                                <Badge className={
                                  task.status === 'completed' 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                                    : task.status === 'processing'
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                      : task.status === 'failed'
                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                }>
                                  {task.status === 'completed' ? 'Complété' : 
                                   task.status === 'processing' ? 'En cours' :
                                   task.status === 'failed' ? 'Échoué' : 'En attente'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{task.description}</p>
                              {task.result && (
                                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{task.result}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {task.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {task.status === 'processing' && (
                            <Progress value={task.progress} className="h-1 mt-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Aucune tâche d'assistance n'a été exécutée
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="profiles">
                <div className="space-y-3">
                  {profiles.map(profile => (
                    <div key={profile.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{profile.name}</h4>
                          <Badge className={profile.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}>
                            {profile.active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{profile.description}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 mr-2">Niveau d'auto: {profile.automationLevel}/5</span>
                          <div className="flex space-x-1">
                            {profile.triggers.map((trigger, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Switch 
                        checked={profile.active} 
                        onCheckedChange={() => toggleProfile(profile.id)} 
                      />
                    </div>
                  ))}
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mt-4">
                    <h4 className="font-medium mb-2">Ajouter un profil</h4>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="profile-name">Nom du profil</Label>
                        <Input 
                          id="profile-name"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          placeholder="Ex: Surveillance CPU"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profile-desc">Description</Label>
                        <Textarea 
                          id="profile-desc"
                          value={newProfileDesc}
                          onChange={(e) => setNewProfileDesc(e.target.value)}
                          placeholder="Décrivez le rôle de ce profil d'assistance"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="auto-level">Niveau d'automatisation (1-5)</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Manuel</span>
                          <input 
                            id="auto-level"
                            type="range" 
                            min="1" 
                            max="5" 
                            value={automationLevel}
                            onChange={(e) => setAutomationLevel(parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm">Automatique</span>
                        </div>
                      </div>
                      <Button 
                        onClick={addNewProfile}
                        disabled={!newProfileName.trim()}
                        className="w-full mt-2"
                      >
                        Créer le profil
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="general-level">Niveau d'automatisation général</Label>
                        <span className="text-sm font-medium">{automationLevel}/5</span>
                      </div>
                      <input 
                        id="general-level"
                        type="range" 
                        min="1" 
                        max="5" 
                        value={automationLevel}
                        onChange={(e) => setAutomationLevel(parseInt(e.target.value))}
                        className="w-full mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Niveau 1: Suggestions manuelles uniquement — Niveau 5: Actions automatiques proactives
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notifications</Label>
                        <p className="text-xs text-gray-500">Afficher les notifications pour les actions automatiques</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Animations</Label>
                        <p className="text-xs text-gray-500">Afficher les animations de l'assistant</p>
                      </div>
                      <Switch defaultChecked={showMascot} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Journalisation détaillée</Label>
                        <p className="text-xs text-gray-500">Enregistrer toutes les actions de l'assistant</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        Réinitialiser les paramètres par défaut
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
}