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
}

// Interface pour les événements de porte
interface EvenementPorte {
  timestamp: string;
  type: 'acces' | 'refus' | 'erreur' | 'systeme';
  utilisateur?: string;
  message: string;
  empreinte?: string;
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
  private serviceRunning: boolean = false;

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
      }

      // Vérifier l'état du service
      await this.verifierStatut();
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation du service de porte automatique:', error);
    }
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
      const isRunning = !stderr.includes('n\'est pas en cours d\'exécution') && 
                        stdout.includes('en cours d\'exécution');
      
      this.serviceRunning = isRunning;
      
      return { 
        running: isRunning,
        info: isRunning ? stdout : stderr
      };
    } catch (error: any) {
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
          niveauAcces
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
          loggingNiveau: 'info'
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
}

// Singleton pour le service
export const porteAutomatiqueService = new PorteAutomatiqueService();