import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/context';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { MascotAnimation, MascotState } from '@/components/mascot/mascot-animation';
import { useIsMobile } from '@/hooks/use-mobile';

// Types pour la fonctionnalité
interface Empreinte {
  id: number;
  nom: string;
  hash: string;
  niveauAcces: string;
  dateCreation?: string;
  groupeId?: number;
  horaireAcces?: {
    debut: string;
    fin: string;
    jours: string[];
  };
  actif: boolean;
}

interface EvenementPorte {
  id?: number;
  timestamp: string;
  type: 'acces' | 'refus' | 'erreur' | 'systeme';
  utilisateur?: string;
  message: string;
  empreinte?: string;
  camera?: string;
}

interface Notification {
  id: number;
  type: 'sms' | 'email' | 'app';
  destinataire: string;
  message: string;
  timestamp: string;
  statut: 'envoyé' | 'échec' | 'en attente';
}

interface GroupeAcces {
  id: number;
  nom: string;
  description: string;
  niveauAcces: string;
  zones: string[];
  membres: number[];
}

interface ServiceStatus {
  running: boolean;
  info?: string;
}

interface Config {
  port: number;
  timeoutConnection: number;
  maxTentatives: number;
  delaiVerrouillage: number;
  modeSecurite: 'faible' | 'moyen' | 'eleve';
  notifications: boolean;
  loggingNiveau: 'debug' | 'info' | 'warning' | 'error';
  activerVideo?: boolean;
  alerteMultiEchecs?: boolean;
  seuilAlerte?: number;
  notificationSMS?: boolean;
  notificationEmail?: boolean;
  emailAdmin?: string;
  numeroSMS?: string;
  planificationActive?: boolean;
}

export default function PorteAutomatique() {
  const { mode } = useTheme();
  const isMobile = useIsMobile();
  
  // États
  const [status, setStatus] = useState<ServiceStatus>({ running: false });
  const [empreintes, setEmpreintes] = useState<Empreinte[]>([]);
  const [evenements, setEvenements] = useState<EvenementPorte[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [groupes, setGroupes] = useState<GroupeAcces[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [testEtat, setTestEtat] = useState<MascotState>('idle');
  const [testMessage, setTestMessage] = useState('');
  
  // Nouvelle empreinte
  const [newUser, setNewUser] = useState('');
  const [newEmpreinte, setNewEmpreinte] = useState('');
  const [newAccess, setNewAccess] = useState('utilisateur');
  const [newHoraireAcces, setNewHoraireAcces] = useState<boolean>(false);
  const [newHeureDebut, setNewHeureDebut] = useState('08:00');
  const [newHeureFin, setNewHeureFin] = useState('18:00');
  const [newJours, setNewJours] = useState<string[]>(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']);
  
  // Pour les groupes
  const [newGroupe, setNewGroupe] = useState<string>('');
  const [newGroupeDescription, setNewGroupeDescription] = useState<string>('');
  const [newGroupeNiveauAcces, setNewGroupeNiveauAcces] = useState<string>('utilisateur');
  const [newGroupeZones, setNewGroupeZones] = useState<string[]>(['entrée']);
  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  
  // Pour la simulation interactive
  const [empreinteSaisie, setEmpreinteSaisie] = useState('');
  const [simulationActive, setSimulationActive] = useState(false);
  
  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Vérifier le statut du service
        const statusRes = await apiRequest('/api/porte-automatique/status');
        setStatus(statusRes);
        
        if (statusRes.running) {
          // Charger les empreintes
          const empRes = await apiRequest('/api/porte-automatique/empreintes');
          setEmpreintes(empRes || []);
          
          // Charger les événements
          const eventsRes = await apiRequest('/api/porte-automatique/logs');
          setEvenements(eventsRes || []);
          
          // Charger la configuration
          const configRes = await apiRequest('/api/porte-automatique/config');
          setConfig(configRes);
          
          // Charger les groupes d'accès
          const groupesRes = await apiRequest('/api/porte-automatique/groupes');
          setGroupes(groupesRes || []);
          
          // Charger les notifications
          const notifRes = await apiRequest('/api/porte-automatique/notifications');
          setNotifications(notifRes || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données du système',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Actualiser les données toutes les 10 secondes si le service est en cours d'exécution
    const interval = setInterval(() => {
      if (status.running) {
        fetchData();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [status.running]);
  
  // Démarrer le service
  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/porte-automatique/start', { method: 'POST' });
      if (res.success) {
        toast({
          title: 'Succès',
          description: 'Service démarré avec succès',
          variant: 'default'
        });
        
        // Mettre à jour le statut
        const statusRes = await apiRequest('/api/porte-automatique/status');
        setStatus(statusRes);
      } else {
        toast({
          title: 'Erreur',
          description: res.message || 'Impossible de démarrer le service',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du service:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de démarrer le service',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Arrêter le service
  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/porte-automatique/stop', { method: 'POST' });
      if (res.success) {
        toast({
          title: 'Succès',
          description: 'Service arrêté avec succès',
          variant: 'default'
        });
        
        // Mettre à jour le statut
        const statusRes = await apiRequest('/api/porte-automatique/status');
        setStatus(statusRes);
      } else {
        toast({
          title: 'Erreur',
          description: res.message || 'Impossible d\'arrêter le service',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du service:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'arrêter le service',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Tester la connexion
  const handleTest = async () => {
    setTestEtat('thinking');
    setTestMessage('Test de la connexion en cours...');
    
    try {
      const res = await apiRequest('/api/porte-automatique/test', { method: 'POST' });
      if (res.success) {
        setTestEtat('success');
        setTestMessage('Connexion établie avec succès !');
        
        setTimeout(() => {
          setTestEtat('idle');
          setTestMessage('');
        }, 3000);
      } else {
        setTestEtat('error');
        setTestMessage('Échec de la connexion : ' + (res.message || 'Erreur inconnue'));
        
        setTimeout(() => {
          setTestEtat('idle');
          setTestMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      setTestEtat('error');
      setTestMessage('Erreur de communication avec le serveur');
      
      setTimeout(() => {
        setTestEtat('idle');
        setTestMessage('');
      }, 5000);
    }
  };
  
  // Ajouter une empreinte
  const handleAddEmpreinte = async () => {
    if (!newUser || !newEmpreinte) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un nom et une empreinte',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const res = await apiRequest('/api/porte-automatique/empreintes', {
        method: 'POST',
        body: JSON.stringify({
          nom: newUser,
          empreinte: newEmpreinte,
          niveauAcces: newAccess
        })
      });
      
      if (res.success) {
        toast({
          title: 'Succès',
          description: 'Empreinte ajoutée avec succès',
          variant: 'default'
        });
        
        // Réinitialiser les champs
        setNewUser('');
        setNewEmpreinte('');
        setNewAccess('utilisateur');
        
        // Recharger les empreintes
        const empRes = await apiRequest('/api/porte-automatique/empreintes');
        setEmpreintes(empRes || []);
      } else {
        toast({
          title: 'Erreur',
          description: res.message || 'Impossible d\'ajouter l\'empreinte',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'une empreinte:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'empreinte',
        variant: 'destructive'
      });
    }
  };
  
  // Supprimer une empreinte
  const handleDeleteEmpreinte = async (id: number) => {
    try {
      const res = await apiRequest(`/api/porte-automatique/empreintes/${id}`, {
        method: 'DELETE'
      });
      
      if (res.success) {
        toast({
          title: 'Succès',
          description: 'Empreinte supprimée avec succès',
          variant: 'default'
        });
        
        // Recharger les empreintes
        const empRes = await apiRequest('/api/porte-automatique/empreintes');
        setEmpreintes(empRes || []);
      } else {
        toast({
          title: 'Erreur',
          description: res.message || 'Impossible de supprimer l\'empreinte',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression d\'une empreinte:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'empreinte',
        variant: 'destructive'
      });
    }
  };
  
  // Mettre à jour la configuration
  const handleUpdateConfig = async (newConfig: Partial<Config>) => {
    if (!config) return;
    
    try {
      const res = await apiRequest('/api/porte-automatique/config', {
        method: 'PUT',
        body: JSON.stringify(newConfig)
      });
      
      if (res.success) {
        toast({
          title: 'Succès',
          description: 'Configuration mise à jour avec succès',
          variant: 'default'
        });
        
        // Mettre à jour la configuration locale
        setConfig({ ...config, ...newConfig });
      } else {
        toast({
          title: 'Erreur',
          description: res.message || 'Impossible de mettre à jour la configuration',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la configuration',
        variant: 'destructive'
      });
    }
  };
  
  // Gérer la simulation d'empreinte
  const handleEmpreinteSimulation = async () => {
    if (!empreinteSaisie) {
      toast({
        title: 'Attention',
        description: 'Veuillez saisir une empreinte pour la simulation',
        variant: 'destructive'
      });
      return;
    }
    
    setTestEtat('working');
    setTestMessage('Analyse de l\'empreinte en cours...');
    setSimulationActive(true);
    
    // Simuler un délai pour l'analyse
    setTimeout(async () => {
      setTestEtat('thinking');
      setTestMessage('Vérification de l\'empreinte dans la base de données...');
      
      // Vérifier si l'empreinte existe
      const empreinteExiste = empreintes.some(e => e.hash === empreinteSaisie);
      
      setTimeout(() => {
        if (empreinteExiste) {
          setTestEtat('success');
          setTestMessage('Empreinte reconnue ! Accès autorisé.');
          
          // Simuler un nouvel événement
          const nouvelEvenement: EvenementPorte = {
            timestamp: new Date().toISOString(),
            type: 'acces',
            utilisateur: empreintes.find(e => e.hash === empreinteSaisie)?.nom,
            message: `Empreinte valide pour l'utilisateur: ${empreintes.find(e => e.hash === empreinteSaisie)?.nom}`
          };
          
          setEvenements(prev => [nouvelEvenement, ...prev]);
        } else {
          setTestEtat('error');
          setTestMessage('Empreinte non reconnue ! Accès refusé.');
          
          // Simuler un nouvel événement
          const nouvelEvenement: EvenementPorte = {
            timestamp: new Date().toISOString(),
            type: 'refus',
            empreinte: empreinteSaisie,
            message: `Tentative d'accès avec empreinte invalide: ${empreinteSaisie}`
          };
          
          setEvenements(prev => [nouvelEvenement, ...prev]);
        }
        
        // Réinitialiser après un moment
        setTimeout(() => {
          setTestEtat('idle');
          setTestMessage('');
          setSimulationActive(false);
          setEmpreinteSaisie('');
        }, 3000);
      }, 2000);
    }, 2000);
  };
  
  // Générer une empreinte aléatoire
  const generateRandomFingerprint = () => {
    const characters = 'abcdef0123456789';
    let result = '';
    const length = 64; // Une empreinte SHA-256 fait 64 caractères
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };
  
  // Fonction pour obtenir la couleur en fonction du type d'événement
  const getEventTypeColor = (type: EvenementPorte['type']) => {
    switch (type) {
      case 'acces':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'refus':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'erreur':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };
  
  // Fonction pour formater le type d'événement
  const formatEventType = (type: EvenementPorte['type']) => {
    switch (type) {
      case 'acces':
        return 'Accès autorisé';
      case 'refus':
        return 'Accès refusé';
      case 'erreur':
        return 'Erreur système';
      default:
        return 'Info système';
    }
  };
  
  // Rendre le composant principal
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">
        Module IA - Porte Automatique
        <Badge 
          variant={status.running ? 'default' : 'destructive'}
          className="ml-4"
        >
          {status.running ? 'Service actif' : 'Service inactif'}
        </Badge>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Carte de contrôle */}
        <Card>
          <CardHeader>
            <CardTitle>Contrôle du service</CardTitle>
            <CardDescription>Démarrer, arrêter ou tester le service</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">État du service</h3>
                <p className="text-sm text-muted-foreground">
                  {status.running ? 'Le service est en cours d\'exécution' : 'Le service est arrêté'}
                </p>
              </div>
              <Badge 
                variant={status.running ? 'default' : 'destructive'}
                className="h-6"
              >
                {status.running ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Mode</h3>
                <p className="text-sm text-muted-foreground">
                  {config?.modeSecurite === 'eleve' ? 'Sécurité élevée' : 
                   config?.modeSecurite === 'moyen' ? 'Sécurité moyenne' : 'Sécurité faible'}
                </p>
              </div>
              <Badge 
                variant={
                  config?.modeSecurite === 'eleve' ? 'default' : 
                  config?.modeSecurite === 'moyen' ? 'secondary' : 'outline'
                }
                className="h-6"
              >
                {config?.modeSecurite === 'eleve' ? 'Élevé' : 
                 config?.modeSecurite === 'moyen' ? 'Moyen' : 'Faible'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Empreintes enregistrées</h3>
                <p className="text-sm text-muted-foreground">
                  {empreintes.length} empreinte(s) dans la base de données
                </p>
              </div>
              <Badge 
                variant="outline"
                className="h-6"
              >
                {empreintes.length}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="flex flex-wrap gap-2 w-full">
              <Button 
                onClick={handleStart} 
                disabled={status.running || loading}
                className="flex-1"
              >
                Démarrer
              </Button>
              <Button 
                onClick={handleStop} 
                disabled={!status.running || loading}
                variant="destructive"
                className="flex-1"
              >
                Arrêter
              </Button>
            </div>
            <Button 
              onClick={handleTest} 
              disabled={!status.running || loading || testEtat !== 'idle'}
              variant="secondary"
              className="w-full"
            >
              Tester la connexion
            </Button>
          </CardFooter>
        </Card>
        
        {/* Carte de simulation */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Test d'empreinte interactif</CardTitle>
            <CardDescription>Simulez une lecture d'empreinte digitale pour tester le système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              <MascotAnimation
                state={testEtat}
                size="lg"
                message={testMessage}
                name="NetBot"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 items-end">
              <div className="space-y-2">
                <Label htmlFor="fingerprint">Empreinte à tester</Label>
                <Input
                  id="fingerprint"
                  placeholder="Entrez une empreinte (hash SHA-256)"
                  value={empreinteSaisie}
                  onChange={(e) => setEmpreinteSaisie(e.target.value)}
                  disabled={simulationActive || !status.running}
                />
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => setEmpreinteSaisie(generateRandomFingerprint())}
                  variant="outline"
                  disabled={simulationActive || !status.running}
                  className="w-full mb-2"
                >
                  Générer une empreinte aléatoire
                </Button>
                <Button
                  onClick={handleEmpreinteSimulation}
                  disabled={simulationActive || !status.running || !empreinteSaisie}
                  className="w-full"
                >
                  Simuler la lecture d'empreinte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Onglets pour les différentes sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="dashboard" className="flex-1">Tableau de bord</TabsTrigger>
          <TabsTrigger value="logs" className="flex-1">Journal d'activité</TabsTrigger>
          <TabsTrigger value="empreintes" className="flex-1">Gestion des empreintes</TabsTrigger>
          <TabsTrigger value="config" className="flex-1">Configuration</TabsTrigger>
        </TabsList>
        
        {/* Tableau de bord */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dernières activités</CardTitle>
                <CardDescription>Les 5 derniers événements du système</CardDescription>
              </CardHeader>
              <CardContent>
                {evenements.length > 0 ? (
                  <div className="space-y-4">
                    {evenements.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-start">
                        <Badge
                          className={`${getEventTypeColor(event.type)} mr-2 mt-1`}
                        >
                          {formatEventType(event.type)}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {event.utilisateur ? `Utilisateur: ${event.utilisateur}` : 'Système'}
                          </p>
                          <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                          <p className="text-sm mt-1">{event.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun événement enregistré</p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('logs')}
                  className="w-full"
                >
                  Voir tous les événements
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>État du système</CardTitle>
                <CardDescription>Informations sur le système de porte automatique</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Port de connexion</h3>
                    <p>{config?.port || 'Non configuré'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Niveau de sécurité</h3>
                    <p className="capitalize">{config?.modeSecurite || 'Non configuré'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Délai de verrouillage</h3>
                    <p>{config?.delaiVerrouillage ? `${config.delaiVerrouillage} secondes` : 'Non configuré'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Tentatives maximales</h3>
                    <p>{config?.maxTentatives || 'Non configuré'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    <Switch
                      checked={config?.notifications || false}
                      disabled={true}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('config')}
                  className="w-full"
                >
                  Modifier la configuration
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Journal d'activité */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'activité</CardTitle>
              <CardDescription>Historique des événements du système de porte automatique</CardDescription>
            </CardHeader>
            <CardContent>
              {evenements.length > 0 ? (
                <div className="space-y-4">
                  {evenements.map((event, index) => (
                    <div key={index} className="flex items-start p-3 border rounded-lg">
                      <Badge
                        className={`${getEventTypeColor(event.type)} mr-2 mt-1`}
                      >
                        {formatEventType(event.type)}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium">
                            {event.utilisateur ? `Utilisateur: ${event.utilisateur}` : 'Système'}
                          </p>
                          <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                        </div>
                        <p className="text-sm mt-1">{event.message}</p>
                        {event.empreinte && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Empreinte: {event.empreinte}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun événement enregistré</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Gestion des empreintes */}
        <TabsContent value="empreintes">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Empreintes enregistrées</CardTitle>
                <CardDescription>Liste des empreintes digitales autorisées</CardDescription>
              </CardHeader>
              <CardContent>
                {empreintes.length > 0 ? (
                  <div className="space-y-4">
                    {empreintes.map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center">
                            <span className="material-icons mr-2 text-primary">fingerprint</span>
                            <p className="font-medium">{emp.nom}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">ID: {emp.id}</p>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="mr-2">
                              {emp.niveauAcces}
                            </Badge>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {emp.hash}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEmpreinte(emp.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Aucune empreinte enregistrée</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une empreinte</CardTitle>
                <CardDescription>Enregistrer une nouvelle empreinte digitale</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      placeholder="Nom de l'utilisateur"
                      value={newUser}
                      onChange={(e) => setNewUser(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fingerprint-hash">Empreinte (hash)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="fingerprint-hash"
                        placeholder="Hash SHA-256"
                        value={newEmpreinte}
                        onChange={(e) => setNewEmpreinte(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => setNewEmpreinte(generateRandomFingerprint())}
                      >
                        <span className="material-icons">refresh</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="access-level">Niveau d'accès</Label>
                    <select
                      id="access-level"
                      className="w-full p-2 border rounded-md"
                      value={newAccess}
                      onChange={(e) => setNewAccess(e.target.value)}
                    >
                      <option value="utilisateur">Utilisateur</option>
                      <option value="administrateur">Administrateur</option>
                      <option value="invité">Invité</option>
                      <option value="sécurité">Agent de sécurité</option>
                    </select>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleAddEmpreinte}
                  className="w-full"
                  disabled={!newUser || !newEmpreinte || !status.running}
                >
                  Ajouter l'empreinte
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Configuration */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du système</CardTitle>
              <CardDescription>Paramètres de configuration du système de porte automatique</CardDescription>
            </CardHeader>
            <CardContent>
              {config ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="port">Port de connexion</Label>
                      <Input
                        id="port"
                        type="number"
                        value={config.port}
                        onChange={(e) => handleUpdateConfig({ port: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="timeout">Timeout de connexion (secondes)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={config.timeoutConnection}
                        onChange={(e) => handleUpdateConfig({ timeoutConnection: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max-tentatives">Tentatives maximales</Label>
                      <Input
                        id="max-tentatives"
                        type="number"
                        value={config.maxTentatives}
                        onChange={(e) => handleUpdateConfig({ maxTentatives: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="delai-verrouillage">Délai de verrouillage (secondes)</Label>
                      <Input
                        id="delai-verrouillage"
                        type="number"
                        value={config.delaiVerrouillage}
                        onChange={(e) => handleUpdateConfig({ delaiVerrouillage: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mode-securite">Mode de sécurité</Label>
                      <select
                        id="mode-securite"
                        className="w-full p-2 border rounded-md"
                        value={config.modeSecurite}
                        onChange={(e) => handleUpdateConfig({ 
                          modeSecurite: e.target.value as 'faible' | 'moyen' | 'eleve' 
                        })}
                      >
                        <option value="faible">Faible</option>
                        <option value="moyen">Moyen</option>
                        <option value="eleve">Élevé</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="logging-niveau">Niveau de journalisation</Label>
                      <select
                        id="logging-niveau"
                        className="w-full p-2 border rounded-md"
                        value={config.loggingNiveau}
                        onChange={(e) => handleUpdateConfig({ 
                          loggingNiveau: e.target.value as 'debug' | 'info' | 'warning' | 'error' 
                        })}
                      >
                        <option value="debug">Debug</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Activer les notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications en cas d'événements importants
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={config.notifications}
                      onCheckedChange={(checked) => handleUpdateConfig({ notifications: checked })}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Configuration non disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}