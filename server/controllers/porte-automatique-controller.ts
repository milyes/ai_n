/**
 * Contrôleur pour la gestion du module porte automatique
 * Gère les requêtes API pour le système de porte automatique avec empreinte digitale
 * Nouvelles fonctionnalités: groupes, horaires, notifications, surveillance vidéo
 */

import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import { porteAutomatiqueService } from '../services/porte-automatique-service';

/**
 * Vérifier le statut du service
 */
export const getServiceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await porteAutomatiqueService.verifierStatut();
    res.json(status);
  } catch (error) {
    next(error);
  }
};

/**
 * Démarrer le service
 */
export const startService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await porteAutomatiqueService.demarrerService();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Arrêter le service
 */
export const stopService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await porteAutomatiqueService.arreterService();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Tester la connexion
 */
export const testService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await porteAutomatiqueService.testerConnexion();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir la liste des empreintes
 */
export const getEmpreintes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Charger les empreintes depuis le fichier
    const empreintes = await porteAutomatiqueService.chargerEmpreintes();
    res.json(empreintes);
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter une empreinte
 */
export const addEmpreinte = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nom, empreinte, niveauAcces } = req.body;
    
    if (!nom || !empreinte || !niveauAcces) {
      return res.status(400).json({
        success: false,
        message: 'Nom, empreinte et niveau d\'accès requis'
      });
    }
    
    const result = await porteAutomatiqueService.ajouterEmpreinte(nom, empreinte, niveauAcces);
    
    if (result) {
      res.json({ success: true, message: 'Empreinte ajoutée avec succès' });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'ajout de l\'empreinte'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une empreinte
 */
export const deleteEmpreinte = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'empreinte invalide'
      });
    }
    
    const result = await porteAutomatiqueService.supprimerEmpreinte(id);
    
    if (result) {
      res.json({ success: true, message: 'Empreinte supprimée avec succès' });
    } else {
      res.status(404).json({
        success: false,
        message: 'Empreinte non trouvée ou erreur lors de la suppression'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les logs
 */
export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nombre = req.query.nombre ? parseInt(req.query.nombre as string) : 50;
    const logs = await porteAutomatiqueService.chargerLogs(nombre);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir la configuration
 */
export const getConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = porteAutomatiqueService.getConfig();
    res.json(config);
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour la configuration
 */
export const updateConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newConfig = req.body;
    
    if (!newConfig) {
      return res.status(400).json({
        success: false,
        message: 'Configuration invalide'
      });
    }
    
    const result = await porteAutomatiqueService.mettreAJourConfig(newConfig);
    
    if (result) {
      res.json({ success: true, message: 'Configuration mise à jour avec succès' });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la configuration'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Tester une empreinte
 */
export const testEmpreinte = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { empreinte } = req.body;
    
    if (!empreinte) {
      return res.status(400).json({
        success: false,
        message: 'Empreinte requise'
      });
    }
    
    const result = await porteAutomatiqueService.testerEmpreinte(empreinte);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Exporter les logs en format CSV
 */
export const exportLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = await porteAutomatiqueService.exporterLogsCSV();
    res.json({ 
      success: true, 
      fileName: path.basename(filePath),
      filePath 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les groupes d'accès
 */
export const getGroupes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groupes = porteAutomatiqueService.getGroupes();
    res.json(groupes);
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouveau groupe d'accès
 */
export const createGroupe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nom, description, niveauAcces, zones } = req.body;
    
    if (!nom || !niveauAcces || !zones) {
      return res.status(400).json({
        success: false,
        message: 'Nom, niveau d\'accès et zones requis'
      });
    }
    
    const groupe = await porteAutomatiqueService.creerGroupe(
      nom, 
      description || '', 
      niveauAcces, 
      Array.isArray(zones) ? zones : [zones]
    );
    
    res.json({ 
      success: true, 
      message: 'Groupe créé avec succès',
      groupe
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter un utilisateur à un groupe
 */
export const addUserToGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupeId, utilisateurId } = req.body;
    
    if (!groupeId || !utilisateurId) {
      return res.status(400).json({
        success: false,
        message: 'ID du groupe et ID de l\'utilisateur requis'
      });
    }
    
    const result = await porteAutomatiqueService.ajouterUtilisateurAuGroupe(
      parseInt(groupeId),
      parseInt(utilisateurId)
    );
    
    if (result) {
      res.json({ 
        success: true, 
        message: 'Utilisateur ajouté au groupe avec succès'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Groupe ou utilisateur introuvable'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Retirer un utilisateur d'un groupe
 */
export const removeUserFromGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupeId, utilisateurId } = req.body;
    
    if (!groupeId || !utilisateurId) {
      return res.status(400).json({
        success: false,
        message: 'ID du groupe et ID de l\'utilisateur requis'
      });
    }
    
    const result = await porteAutomatiqueService.retirerUtilisateurDuGroupe(
      parseInt(groupeId),
      parseInt(utilisateurId)
    );
    
    if (result) {
      res.json({ 
        success: true, 
        message: 'Utilisateur retiré du groupe avec succès'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Groupe ou utilisateur introuvable'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir l'historique des notifications
 */
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = porteAutomatiqueService.getNotifications();
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};