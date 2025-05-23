/**
 * Service d'intégration pour porte automatique avec empreinte digitale
 * Ce service gère l'interface avec le script bash IA_api_porte_automatique.sh
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Interface pour le système d'empreintes
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

// Interface pour les événements de porte
interface EvenementPorte {
  id?: number;
  timestamp: string;
  type: 'acces' | 'refus' | 'erreur' | 'systeme';
  utilisateur?: string;
  message: string;
  empreinte?: string;
  camera?: string; // URL ou chemin vers la capture photo si disponible
}

// Interface pour les notifications
interface Notification {
  id: number;
  type: 'sms' | 'email' | 'app';
  destinataire: string; // numéro ou email
  message: string;
  timestamp: string;
  statut: 'envoyé' | 'échec' | 'en attente';
}

// Interface pour les groupes d'accès
interface GroupeAcces {
  id: number;
  nom: string;
  description: string;
  niveauAcces: string;
  zones: string[];
  membres: number[]; // IDs des empreintes
}

// Interface pour la configuration
interface PorteConfig {
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

// Chemin des fichiers
const SCRIPT_PATH = './IA_api_porte_automatique.sh';
const EMPREINTE_FILE = './empreintes.db';
const LOG_FILE = './ia_porte_logs.txt';
const CONFIG_FILE = './ia_config.json';

export class PorteAutomatiqueService {
  private config: PorteConfig | null = null;
  private empreintes: Empreinte[] = [];
  private evenements: EvenementPorte[] = [];
  private notifications: Notification[] = [];
  private groupes: GroupeAcces[] = [];
  private serviceRunning: boolean = false;
  private dernieresCapturesVideo: Map<string, string> = new Map(); // timestamp -> chemin
  private alerteActive: boolean = false;
  private nbTentativesEchouees: number = 0;
  private videoStreamActive: boolean = false;

  constructor() {
    this.initService();
  }

  /**
   * Initialiser le service
   */
  private async initService() {
    try {
      // Vérifier si le fichier de configuration existe
      if (fs.existsSync(CONFIG_FILE)) {
        const configContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
        this.config = JSON.parse(configContent);
      } else {
        // Configuration par défaut
        this.config = {
          port: 8085,
          timeoutConnection: 30,
          maxTentatives: 3,
          delaiVerrouillage: 300,
          modeSecurite: 'eleve',
          notifications: true,
          loggingNiveau: 'info',
          activerVideo: true,
          alerteMultiEchecs: true,
          seuilAlerte: 3,
          notificationSMS: true,
          notificationEmail: true,
          emailAdmin: 'admin@exemple.com',
          numeroSMS: '+33601020304',
          planificationActive: true
        };
      }

      // Vérifier l'état du service
      await this.verifierStatut();
      
      // Charger les empreintes
      await this.chargerEmpreintes();
      
      // Initialiser les groupes d'accès
      this.initialiserGroupes();
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation du service de porte automatique:', error);
    }
  }
  
  /**
   * Initialiser les groupes d'accès
   */
  private initialiserGroupes() {
    this.groupes = [
      {
        id: 1,
        nom: 'Administrateurs',
        description: 'Accès complet à toutes les zones',
        niveauAcces: 'administrateur',
        zones: ['toutes'],
        membres: []
      },
      {
        id: 2,
        nom: 'Utilisateurs standards',
        description: 'Accès aux zones communes',
        niveauAcces: 'utilisateur',
        zones: ['entrée', 'open-space', 'cafétéria'],
        membres: []
      },
      {
        id: 3,
        nom: 'Invités',
        description: 'Accès limité et temporaire',
        niveauAcces: 'invité',
        zones: ['entrée', 'salle de réunion'],
        membres: []
      }
    ];
    
    // Associer les empreintes aux groupes
    this.empreintes.forEach(emp => {
      if (emp.niveauAcces === 'administrateur') {
        this.groupes[0].membres.push(emp.id);
        emp.groupeId = 1;
      } else if (emp.niveauAcces === 'utilisateur') {
        this.groupes[1].membres.push(emp.id);
        emp.groupeId = 2;
      } else if (emp.niveauAcces === 'invité') {
        this.groupes[2].membres.push(emp.id);
        emp.groupeId = 3;
      }
    });
  }

  /**
   * Démarrer le service de porte automatique
   */
  public async demarrerService(): Promise<{ success: boolean; message: string }> {
    try {
      if (this.serviceRunning) {
        return { success: false, message: 'Le service est déjà en cours d\'exécution' };
      }

      const { stdout, stderr } = await execAsync(`${SCRIPT_PATH} start`);
      
      if (stderr && stderr.trim() !== '') {
        console.error('Erreur lors du démarrage du service:', stderr);
        return { success: false, message: `Erreur: ${stderr}` };
      }
      
      // Mettre à jour l'état
      this.serviceRunning = true;
      
      // Charger les empreintes
      await this.chargerEmpreintes();
      
      // Charger les logs récents
      await this.chargerLogs();
      
      return { success: true, message: stdout || 'Service démarré avec succès' };
    } catch (error: any) {
      console.error('Erreur lors du démarrage du service:', error);
      return { success: false, message: `Erreur: ${error.message}` };
    }
  }

  /**
   * Arrêter le service de porte automatique
   */
  public async arreterService(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.serviceRunning) {
        return { success: false, message: 'Le service n\'est pas en cours d\'exécution' };
      }

      const { stdout, stderr } = await execAsync(`${SCRIPT_PATH} stop`);
      
      if (stderr && stderr.trim() !== '') {
        console.error('Erreur lors de l\'arrêt du service:', stderr);
        return { success: false, message: `Erreur: ${stderr}` };
      }
      
      // Mettre à jour l'état
      this.serviceRunning = false;
      
      return { success: true, message: stdout || 'Service arrêté avec succès' };
    } catch (error: any) {
      console.error('Erreur lors de l\'arrêt du service:', error);
      return { success: false, message: `Erreur: ${error.message}` };
    }
  }

  /**
   * Vérifier l'état du service
   */
  public async verifierStatut(): Promise<{ running: boolean; info?: string }> {
    try {
      const { stdout, stderr } = await execAsync(`${SCRIPT_PATH} status`);
      
      // Vérifier si le service est en cours d'exécution
      const isRunning = stdout.includes('en cours d\'exécution');
      
      this.serviceRunning = isRunning;
      
      return { 
        running: isRunning,
        info: isRunning ? stdout : stdout || stderr
      };
    } catch (error: any) {
      // Si le script existe mais retourne un code d'erreur 1, c'est normal
      // cela signifie juste que le service n'est pas en cours d'exécution
      if (error.code === 1 && error.stdout && error.stdout.includes('n\'est pas en cours d\'exécution')) {
        this.serviceRunning = false;
        return { running: false, info: error.stdout };
      }
      
      console.error('Erreur lors de la vérification du statut:', error);
      this.serviceRunning = false;
      return { running: false, info: `Erreur: ${error.message}` };
    }
  }

  /**
   * Tester la connexion à l'API
   */
  public async testerConnexion(): Promise<{ success: boolean; message: string }> {
    try {
      const { stdout, stderr } = await execAsync(`${SCRIPT_PATH} test`);
      
      const success = stdout.includes('Test réussi') && !stdout.includes('Échec du test');
      
      return { 
        success, 
        message: success ? 'Connexion à l\'API réussie' : 'Échec de la connexion à l\'API'
      };
    } catch (error: any) {
      // Si le service n'est pas démarré, le script retournera un code d'erreur
      if (error.code === 1 && error.stdout && error.stdout.includes('Le service n\'est pas en cours d\'exécution')) {
        return { 
          success: false, 
          message: 'Le service n\'est pas démarré. Veuillez démarrer le service avant de tester la connexion.'
        };
      }
      
      console.error('Erreur lors du test de connexion:', error);
      return { success: false, message: `Erreur: ${error.message}` };
    }
  }

  /**
   * Charger les empreintes depuis le fichier
   */
  public async chargerEmpreintes(): Promise<Empreinte[]> {
    try {
      if (!fs.existsSync(EMPREINTE_FILE)) {
        this.empreintes = [];
        return [];
      }
      
      const content = fs.readFileSync(EMPREINTE_FILE, 'utf-8');
      const lines = content.split('\n').filter(line => !line.startsWith('#') && line.trim() !== '');
      
      this.empreintes = lines.map(line => {
        const [id, nom, hash, niveauAcces] = line.split(';');
        return {
          id: parseInt(id),
          nom,
          hash,
          niveauAcces,
          dateCreation: new Date().toISOString(),
          actif: true
        };
      });
      
      return this.empreintes;
    } catch (error: any) {
      console.error('Erreur lors du chargement des empreintes:', error);
      return [];
    }
  }

  /**
   * Obtenir les empreintes enregistrées
   */
  public getEmpreintes(): Empreinte[] {
    return this.empreintes;
  }

  /**
   * Ajouter une nouvelle empreinte
   */
  public async ajouterEmpreinte(nom: string, empreinte: string, niveauAcces: string): Promise<boolean> {
    try {
      if (!fs.existsSync(EMPREINTE_FILE)) {
        // Créer le fichier s'il n'existe pas
        fs.writeFileSync(EMPREINTE_FILE, '# Fichier d\'empreintes - Format: ID;NOM;HASH;NIVEAU_ACCES\n');
      }
      
      // Charger les empreintes existantes
      await this.chargerEmpreintes();
      
      // Obtenir le prochain ID
      const nextId = this.empreintes.length > 0 
        ? Math.max(...this.empreintes.map(e => e.id)) + 1 
        : 1;
      
      // Ajouter la nouvelle empreinte
      const newLine = `${nextId};${nom};${empreinte};${niveauAcces}`;
      fs.appendFileSync(EMPREINTE_FILE, newLine + '\n');
      
      // Recharger les empreintes
      await this.chargerEmpreintes();
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout d\'une empreinte:', error);
      return false;
    }
  }

  /**
   * Supprimer une empreinte
   */
  public async supprimerEmpreinte(id: number): Promise<boolean> {
    try {
      if (!fs.existsSync(EMPREINTE_FILE)) {
        return false;
      }
      
      // Charger les empreintes
      await this.chargerEmpreintes();
      
      // Filtrer l'empreinte à supprimer
      const filteredEmpreintes = this.empreintes.filter(e => e.id !== id);
      
      if (filteredEmpreintes.length === this.empreintes.length) {
        // Aucune empreinte n'a été supprimée
        return false;
      }
      
      // Mettre à jour le fichier
      const header = '# Fichier d\'empreintes - Format: ID;NOM;HASH;NIVEAU_ACCES\n';
      const content = filteredEmpreintes.map(e => `${e.id};${e.nom};${e.hash};${e.niveauAcces}`).join('\n');
      
      fs.writeFileSync(EMPREINTE_FILE, header + content + '\n');
      
      // Mettre à jour la liste en mémoire
      this.empreintes = filteredEmpreintes;
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la suppression d\'une empreinte:', error);
      return false;
    }
  }

  /**
   * Charger les logs récents
   */
  public async chargerLogs(nombreLignes: number = 50): Promise<EvenementPorte[]> {
    try {
      if (!fs.existsSync(LOG_FILE)) {
        this.evenements = [];
        return [];
      }
      
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      // Prendre les N dernières lignes
      const recentLines = lines.slice(-nombreLignes);
      
      this.evenements = recentLines.map(line => {
        // Format: "2023-03-01 12:34:56 - [INFO] Message"
        const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - \[(\w+)\] (.+)$/);
        
        if (!match) {
          return {
            timestamp: new Date().toISOString(),
            type: 'systeme',
            message: line
          };
        }
        
        const [, timestamp, level, message] = match;
        
        // Déterminer le type d'événement
        let type: 'acces' | 'refus' | 'erreur' | 'systeme' = 'systeme';
        let utilisateur: string | undefined;
        let empreinte: string | undefined;
        
        if (message.includes('Empreinte valide')) {
          type = 'acces';
          const userMatch = message.match(/utilisateur: ([^(]+)/);
          if (userMatch) {
            utilisateur = userMatch[1].trim();
          }
        } else if (message.includes('invalide')) {
          type = 'refus';
          const empMatch = message.match(/invalide: ([a-f0-9]+)/);
          if (empMatch) {
            empreinte = empMatch[1];
          }
        } else if (level === 'ERROR') {
          type = 'erreur';
        }
        
        return {
          timestamp,
          type,
          utilisateur,
          empreinte,
          message
        };
      });
      
      return this.evenements;
    } catch (error: any) {
      console.error('Erreur lors du chargement des logs:', error);
      return [];
    }
  }

  /**
   * Obtenir les événements récents
   */
  public getEvenements(): EvenementPorte[] {
    return this.evenements;
  }

  /**
   * Obtenir la configuration
   */
  public getConfig(): PorteConfig | null {
    return this.config;
  }

  /**
   * Mettre à jour la configuration
   */
  public async mettreAJourConfig(newConfig: Partial<PorteConfig>): Promise<boolean> {
    try {
      if (this.config === null) {
        // Créer une configuration par défaut
        this.config = {
          port: 8085,
          timeoutConnection: 30,
          maxTentatives: 3,
          delaiVerrouillage: 300,
          modeSecurite: 'eleve',
          notifications: true,
          loggingNiveau: 'info',
          activerVideo: true,
          alerteMultiEchecs: true,
          seuilAlerte: 3,
          notificationSMS: true,
          notificationEmail: true,
          emailAdmin: 'admin@exemple.com',
          numeroSMS: '+33601020304',
          planificationActive: true
        };
      }
      
      // Mettre à jour la configuration
      this.config = { ...this.config, ...newConfig };
      
      // Écrire dans le fichier
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 4));
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
      return false;
    }
  }

  /**
   * Vérifier si le service est en cours d'exécution
   */
  public isRunning(): boolean {
    return this.serviceRunning;
  }
  
  /**
   * Tester une empreinte digitale
   * @param empreinte Hash de l'empreinte à tester
   */
  public async testerEmpreinte(empreinte: string): Promise<{
    autorise: boolean;
    message: string;
    utilisateur?: string;
    niveauAcces?: string;
    horaireAutorise?: boolean;
  }> {
    try {
      // Vérifier si l'empreinte existe
      const empreinteObj = this.empreintes.find(e => e.hash === empreinte);
      
      // Capture vidéo si configurée
      let captureId: string | undefined = undefined;
      if (this.config?.activerVideo) {
        captureId = await this.capturerVideo();
      }
      
      if (!empreinteObj) {
        // Empreinte non reconnue
        this.nbTentativesEchouees++;
        
        // Vérifier si le seuil d'alerte est atteint
        if (this.config?.alerteMultiEchecs && 
            this.nbTentativesEchouees >= (this.config?.seuilAlerte || 3)) {
          this.declencherAlerte('Multiples tentatives d\'accès échouées', captureId);
        }
        
        // Ajouter un événement
        const evenement: EvenementPorte = {
          id: this.genererIdEvenement(),
          timestamp: new Date().toISOString(),
          type: 'refus',
          message: 'Empreinte non reconnue',
          empreinte: empreinte,
          camera: captureId
        };
        this.evenements.unshift(evenement);
        
        return {
          autorise: false,
          message: 'Empreinte non reconnue',
          horaireAutorise: false
        };
      }
      
      // Vérifier si l'empreinte est active
      if (!empreinteObj.actif) {
        // Ajouter un événement
        const evenement: EvenementPorte = {
          id: this.genererIdEvenement(),
          timestamp: new Date().toISOString(),
          type: 'refus',
          utilisateur: empreinteObj.nom,
          message: 'Empreinte désactivée',
          empreinte: empreinte,
          camera: captureId
        };
        this.evenements.unshift(evenement);
        
        return {
          autorise: false,
          message: 'Empreinte désactivée',
          utilisateur: empreinteObj.nom,
          niveauAcces: empreinteObj.niveauAcces,
          horaireAutorise: false
        };
      }
      
      // Vérifier les horaires d'accès si la planification est active
      if (this.config?.planificationActive && empreinteObj.horaireAcces) {
        const maintenant = new Date();
        const heureActuelle = maintenant.getHours() * 60 + maintenant.getMinutes();
        const jourActuel = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][maintenant.getDay()];
        
        const [heureDebut, minuteDebut] = empreinteObj.horaireAcces.debut.split(':').map(Number);
        const [heureFin, minuteFin] = empreinteObj.horaireAcces.fin.split(':').map(Number);
        
        const debutMinutes = heureDebut * 60 + minuteDebut;
        const finMinutes = heureFin * 60 + minuteFin;
        
        const horaireAutorise = heureActuelle >= debutMinutes && 
                               heureActuelle <= finMinutes && 
                               empreinteObj.horaireAcces.jours.includes(jourActuel);
        
        if (!horaireAutorise) {
          // Ajouter un événement
          const evenement: EvenementPorte = {
            id: this.genererIdEvenement(),
            timestamp: new Date().toISOString(),
            type: 'refus',
            utilisateur: empreinteObj.nom,
            message: 'Accès refusé - horaire non autorisé',
            empreinte: empreinte,
            camera: captureId
          };
          this.evenements.unshift(evenement);
          
          // Envoyer une notification
          if (this.config?.notifications) {
            this.envoyerNotification({
              type: 'email',
              destinataire: this.config.emailAdmin || 'admin@exemple.com',
              message: `Tentative d'accès en dehors des heures autorisées par ${empreinteObj.nom}`
            });
          }
          
          return {
            autorise: false,
            message: 'Accès refusé - horaire non autorisé',
            utilisateur: empreinteObj.nom,
            niveauAcces: empreinteObj.niveauAcces,
            horaireAutorise: false
          };
        }
      }
      
      // Accès autorisé
      this.nbTentativesEchouees = 0; // Réinitialiser le compteur d'échecs
      
      // Ajouter un événement
      const evenement: EvenementPorte = {
        id: this.genererIdEvenement(),
        timestamp: new Date().toISOString(),
        type: 'acces',
        utilisateur: empreinteObj.nom,
        message: 'Accès autorisé',
        empreinte: empreinte,
        camera: captureId
      };
      this.evenements.unshift(evenement);
      
      return {
        autorise: true,
        message: 'Accès autorisé',
        utilisateur: empreinteObj.nom,
        niveauAcces: empreinteObj.niveauAcces,
        horaireAutorise: true
      };
    } catch (error: any) {
      console.error('Erreur lors du test d\'empreinte:', error);
      
      // Ajouter un événement
      const evenement: EvenementPorte = {
        id: this.genererIdEvenement(),
        timestamp: new Date().toISOString(),
        type: 'erreur',
        message: `Erreur lors du test d'empreinte: ${error.message}`,
        empreinte: empreinte
      };
      this.evenements.unshift(evenement);
      
      return {
        autorise: false,
        message: `Erreur: ${error.message}`,
        horaireAutorise: false
      };
    }
  }

  /**
   * Exporter les logs au format CSV
   */
  public async exporterLogsCSV(): Promise<string> {
    try {
      const headers = ['ID', 'Date', 'Type', 'Utilisateur', 'Message', 'Empreinte', 'Capture'];
      const rows = this.evenements.map(evt => [
        evt.id || 0,
        new Date(evt.timestamp).toLocaleString('fr-FR'),
        evt.type,
        evt.utilisateur || '',
        evt.message,
        evt.empreinte || '',
        evt.camera || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');
      
      const fileName = `logs_porte_${new Date().toISOString().replace(/:/g, '-')}.csv`;
      const filePath = `./${fileName}`;
      
      fs.writeFileSync(filePath, csvContent, 'utf8');
      
      return filePath;
    } catch (error: any) {
      console.error('Erreur lors de l\'export CSV:', error);
      throw new Error('Échec de l\'export CSV');
    }
  }

  /**
   * Créer un groupe d'accès
   */
  public async creerGroupe(
    nom: string,
    description: string,
    niveauAcces: string,
    zones: string[]
  ): Promise<GroupeAcces> {
    try {
      const id = Math.max(0, ...this.groupes.map(g => g.id)) + 1;
      const nouveauGroupe: GroupeAcces = {
        id,
        nom,
        description,
        niveauAcces,
        zones,
        membres: []
      };
      
      this.groupes.push(nouveauGroupe);
      
      // Ajouter un événement
      const evenement: EvenementPorte = {
        id: this.genererIdEvenement(),
        timestamp: new Date().toISOString(),
        type: 'systeme',
        message: `Nouveau groupe d'accès créé: ${nom}`
      };
      this.evenements.unshift(evenement);
      
      return nouveauGroupe;
    } catch (error: any) {
      console.error('Erreur lors de la création du groupe:', error);
      throw new Error('Échec de création du groupe');
    }
  }

  /**
   * Obtenir tous les groupes d'accès
   */
  public getGroupes(): GroupeAcces[] {
    return this.groupes;
  }

  /**
   * Ajouter un utilisateur à un groupe
   */
  public async ajouterUtilisateurAuGroupe(
    groupeId: number, 
    utilisateurId: number
  ): Promise<boolean> {
    try {
      const groupe = this.groupes.find(g => g.id === groupeId);
      const utilisateur = this.empreintes.find(e => e.id === utilisateurId);
      
      if (!groupe || !utilisateur) {
        return false;
      }
      
      if (!groupe.membres.includes(utilisateurId)) {
        groupe.membres.push(utilisateurId);
        utilisateur.groupeId = groupeId;
      }
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au groupe:', error);
      return false;
    }
  }

  /**
   * Retirer un utilisateur d'un groupe
   */
  public async retirerUtilisateurDuGroupe(
    groupeId: number, 
    utilisateurId: number
  ): Promise<boolean> {
    try {
      const groupe = this.groupes.find(g => g.id === groupeId);
      const utilisateur = this.empreintes.find(e => e.id === utilisateurId);
      
      if (!groupe || !utilisateur) {
        return false;
      }
      
      const index = groupe.membres.indexOf(utilisateurId);
      if (index !== -1) {
        groupe.membres.splice(index, 1);
        if (utilisateur.groupeId === groupeId) {
          utilisateur.groupeId = undefined;
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors du retrait du groupe:', error);
      return false;
    }
  }

  /**
   * Générer un identifiant unique pour les événements
   */
  private genererIdEvenement(): number {
    return Math.max(0, ...this.evenements.map(e => e.id || 0)) + 1;
  }

  /**
   * Déclencher une alerte de sécurité
   */
  private declencherAlerte(raison: string, captureId?: string): void {
    if (this.alerteActive) {
      return; // Alerte déjà active
    }
    
    this.alerteActive = true;
    
    // Ajouter un événement
    const evenement: EvenementPorte = {
      id: this.genererIdEvenement(),
      timestamp: new Date().toISOString(),
      type: 'systeme',
      message: `ALERTE DE SÉCURITÉ: ${raison}`,
      camera: captureId
    };
    this.evenements.unshift(evenement);
    
    // Envoyer des notifications d'alerte
    if (this.config?.notifications) {
      // Email
      if (this.config.notificationEmail) {
        this.envoyerNotification({
          type: 'email',
          destinataire: this.config.emailAdmin || 'admin@exemple.com',
          message: `ALERTE DE SÉCURITÉ: ${raison}`
        });
      }
      
      // SMS
      if (this.config.notificationSMS) {
        this.envoyerNotification({
          type: 'sms',
          destinataire: this.config.numeroSMS || '+33601020304',
          message: `ALERTE SECURITE: ${raison}`
        });
      }
    }
    
    // Réinitialiser l'alerte après un délai
    setTimeout(() => {
      this.alerteActive = false;
      this.nbTentativesEchouees = 0;
    }, 300000); // 5 minutes
  }

  /**
   * Envoyer une notification
   */
  private envoyerNotification(notifParams: {
    type: 'sms' | 'email' | 'app';
    destinataire: string;
    message: string;
  }): void {
    try {
      const id = Math.max(0, ...this.notifications.map(n => n.id), 0) + 1;
      const notification: Notification = {
        id,
        ...notifParams,
        timestamp: new Date().toISOString(),
        statut: 'envoyé'
      };
      
      this.notifications.push(notification);
      
      // Simuler l'envoi (dans un vrai système, on appellerait un service externe)
      console.log(`Notification ${notifParams.type} envoyée à ${notifParams.destinataire}: ${notifParams.message}`);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de notification:', error);
      
      // Enregistrer l'échec
      const id = Math.max(0, ...this.notifications.map(n => n.id), 0) + 1;
      const notification: Notification = {
        id,
        ...notifParams,
        timestamp: new Date().toISOString(),
        statut: 'échec'
      };
      
      this.notifications.push(notification);
    }
  }

  /**
   * Obtenir l'historique des notifications
   */
  public getNotifications(): Notification[] {
    return this.notifications;
  }

  /**
   * Capturer une image vidéo
   * @returns ID de la capture (timestamp)
   */
  private async capturerVideo(): Promise<string> {
    // Dans un système réel, on prendrait réellement une photo
    // Ici on simule une capture
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const captureId = `captures/capture_${timestamp}.jpg`;
    
    // Enregistrer dans l'historique
    this.dernieresCapturesVideo.set(timestamp, captureId);
    
    // Limiter à 20 captures en mémoire
    if (this.dernieresCapturesVideo.size > 20) {
      const oldest = Array.from(this.dernieresCapturesVideo.keys())[0];
      this.dernieresCapturesVideo.delete(oldest);
    }
    
    return captureId;
  }

  /**
   * Obtenir les dernières captures vidéo
   */
  public getCaptures(): Map<string, string> {
    return this.dernieresCapturesVideo;
  }
}

// Singleton pour le service
export const porteAutomatiqueService = new PorteAutomatiqueService();