import React, { useState, useEffect } from 'react';
import { MascotAnimation, MascotState, MascotSize } from './mascot-animation';
import { cn } from '@/lib/utils';

export type LoadingPhase = 
  | "initial"    // Phase initiale
  | "loading"    // Chargement en cours
  | "processing" // Traitement des données
  | "finalizing" // Finalisation
  | "error"      // Erreur de chargement
  | "success";   // Chargement réussi

interface MascotLoaderProps {
  /**
   * Phase de chargement actuelle
   * @default "loading"
   */
  phase?: LoadingPhase;
  
  /**
   * Texte à afficher pendant le chargement
   * Si undefined, un texte par défaut correspondant à la phase sera affiché
   */
  text?: string;
  
  /**
   * Taille de la mascotte
   * @default "md"
   */
  size?: MascotSize;
  
  /**
   * Classe CSS supplémentaire
   */
  className?: string;
  
  /**
   * Classe CSS supplémentaire pour le conteneur
   */
  containerClassName?: string;
  
  /**
   * Fonction appelée à la fin de l'animation
   */
  onAnimationComplete?: () => void;
  
  /**
   * Si true, l'animation sera en boucle
   * @default true
   */
  loop?: boolean;
  
  /**
   * Si true, affiche un fond semi-transparent
   * @default false
   */
  overlay?: boolean;
  
  /**
   * Si true, affiche des messages aléatoires et amusants
   * @default true
   */
  funMessages?: boolean;
}

/**
 * Composant d'affichage de chargement avec mascotte
 * Fournit une expérience de chargement ludique et interactive
 */
export function MascotLoader({
  phase = "loading",
  text,
  size = "md",
  className,
  containerClassName,
  onAnimationComplete,
  loop = true,
  overlay = false,
  funMessages = true
}: MascotLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState<string>(text || "");
  const [messageIndex, setMessageIndex] = useState(0);
  
  // Mapper la phase de chargement à un état de mascotte
  const getMascotState = (phase: LoadingPhase): MascotState => {
    switch (phase) {
      case "initial": return "greeting";
      case "loading": return "working";
      case "processing": return "thinking";
      case "finalizing": return "excited";
      case "error": return "error";
      case "success": return "success";
      default: return "working";
    }
  };
  
  // Messages amusants par phase
  const funMessagesByPhase: Record<LoadingPhase, string[]> = {
    initial: [
      "Bonjour ! Je me prépare à travailler...",
      "Je m'échauffe pour le travail !",
      "Initialisation du système...",
      "Démarrage des systèmes...",
      "Bienvenue ! Je suis prêt à vous aider."
    ],
    loading: [
      "Chargement en cours, patientez svp...",
      "Je travaille aussi vite que possible !",
      "Récupération des données...",
      "Encore quelques secondes...",
      "Je rassemble les informations pour vous."
    ],
    processing: [
      "Hmm, je réfléchis...",
      "Analyse des données en cours...",
      "Je traite les informations...",
      "Calculs en cours...",
      "Je me concentre sur votre requête..."
    ],
    finalizing: [
      "Presque terminé !",
      "Quelques ajustements finaux...",
      "On y est presque !",
      "Finalisation en cours...",
      "Dernières vérifications..."
    ],
    error: [
      "Oups ! Quelque chose s'est mal passé...",
      "Je rencontre un problème...",
      "Erreur détectée. Réessayons ?",
      "Je suis confus, une erreur s'est produite.",
      "Désolé, je n'ai pas pu terminer cette tâche."
    ],
    success: [
      "Mission accomplie !",
      "Voilà, c'est prêt !",
      "Tâche terminée avec succès !",
      "Tout est prêt pour vous !",
      "J'ai terminé ! Que puis-je faire d'autre ?"
    ]
  };
  
  // Textes par défaut par phase
  const defaultTextByPhase: Record<LoadingPhase, string> = {
    initial: "Initialisation...",
    loading: "Chargement en cours...",
    processing: "Traitement des données...",
    finalizing: "Finalisation...",
    error: "Une erreur est survenue",
    success: "Chargement terminé !"
  };
  
  // Effet pour changer les messages amusants
  useEffect(() => {
    if (!text && funMessages && loop) {
      const initialMessage = text || defaultTextByPhase[phase];
      setCurrentMessage(initialMessage);
      
      if (phase !== "error" && phase !== "success") {
        const messages = funMessagesByPhase[phase];
        const interval = setInterval(() => {
          setMessageIndex(prev => {
            const newIndex = (prev + 1) % messages.length;
            setCurrentMessage(messages[newIndex]);
            return newIndex;
          });
        }, 3500);
        
        return () => clearInterval(interval);
      }
    } else if (!text) {
      setCurrentMessage(defaultTextByPhase[phase]);
    } else {
      setCurrentMessage(text);
    }
  }, [phase, text, funMessages, loop]);
  
  return (
    <div className={cn(
      "flex items-center justify-center",
      overlay && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
      containerClassName
    )}>
      <div className={cn(
        "flex flex-col items-center justify-center p-6",
        className
      )}>
        <MascotAnimation 
          state={getMascotState(phase)} 
          size={size}
          message={currentMessage}
          loop={loop}
          onAnimationComplete={onAnimationComplete}
        />
      </div>
    </div>
  );
}