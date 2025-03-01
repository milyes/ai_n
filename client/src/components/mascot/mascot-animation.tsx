import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/context';

export type MascotState = 
  | "idle"      // Au repos
  | "greeting"  // Accueil/Salutation
  | "working"   // Travail en cours
  | "thinking"  // Réflexion
  | "success"   // Opération réussie
  | "error"     // Erreur
  | "sleeping"  // En veille
  | "excited";  // Excité/Enthousiaste

export type MascotSize = "xs" | "sm" | "md" | "lg" | "xl";

type MascotAnimationProps = {
  state: MascotState;
  size?: MascotSize;
  message?: string;
  name?: string;
  className?: string;
  loop?: boolean;
  onAnimationComplete?: () => void;
  clickable?: boolean;
  onClick?: () => void;
  pulseColor?: string;
};

/**
 * Composant d'animation de mascotte
 * Fournit une mascotte animée pour différents états d'application
 */
export function MascotAnimation({
  state = "idle",
  size = "md",
  message,
  name = "NetBot",
  className,
  loop = false,
  onAnimationComplete,
  clickable = false,
  onClick,
  pulseColor = "rgba(99, 102, 241, 0.4)"
}: MascotAnimationProps) {
  const { mode } = useTheme();
  const [bobbing, setBobbing] = useState(true);
  const [waving, setWaving] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Effet pour faire cligner la mascotte aléatoirement
  useEffect(() => {
    if (state !== "sleeping") {
      const blinkInterval = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }, Math.random() * 4000 + 2000);
      
      return () => clearInterval(blinkInterval);
    }
  }, [state]);
  
  // Effet pour faire saluer la mascotte si elle est en mode "greeting"
  useEffect(() => {
    if (state === "greeting") {
      setWaving(true);
      const timeout = setTimeout(() => {
        setWaving(false);
        if (!loop && onAnimationComplete) {
          onAnimationComplete();
        }
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [state, loop, onAnimationComplete]);
  
  // Calculer la taille en fonction de la prop size
  const getSizeClass = () => {
    switch (size) {
      case "xs": return "w-8 h-8";
      case "sm": return "w-12 h-12";
      case "md": return "w-16 h-16";
      case "lg": return "w-24 h-24";
      case "xl": return "w-32 h-32";
      default: return "w-16 h-16";
    }
  };
  
  // Déterminer les classes CSS basées sur l'état
  const getStateClasses = () => {
    switch (state) {
      case "idle":
        return "text-blue-500 dark:text-blue-400";
      case "greeting":
        return "text-green-500 dark:text-green-400";
      case "working":
        return "text-indigo-500 dark:text-indigo-400";
      case "thinking":
        return "text-purple-500 dark:text-purple-400";
      case "success":
        return "text-emerald-500 dark:text-emerald-400";
      case "error":
        return "text-red-500 dark:text-red-400";
      case "sleeping":
        return "text-gray-400 dark:text-gray-500";
      case "excited":
        return "text-amber-500 dark:text-amber-400";
      default:
        return "text-blue-500 dark:text-blue-400";
    }
  };
  
  // Fonction pour générer l'animation de base de la mascotte
  const getBaseAnimation = () => {
    if (state === "sleeping") {
      return {
        y: [0, -2, 0],
        rotate: [0, -5, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };
    }
    
    if (!bobbing) return {};
    
    return {
      y: [0, -3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    };
  };
  
  // Fonction pour obtenir l'animation en fonction de l'état
  const getStateAnimation = () => {
    switch (state) {
      case "working":
        return {
          rotate: [0, -5, 0, 5, 0],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case "thinking":
        return {
          scale: [1, 1.05, 1],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case "excited":
        return {
          rotate: [0, -10, 0, 10, 0],
          y: [0, -5, 0, -5, 0],
          transition: {
            duration: 0.7,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case "error":
        return {
          x: [0, -3, 3, -3, 0],
          transition: {
            duration: 0.4,
            repeat: 3,
            ease: "easeInOut"
          }
        };
      case "success":
        return {
          scale: [1, 1.2, 1],
          rotate: [0, 10, 0],
          transition: {
            duration: 0.6,
            ease: "easeOut"
          }
        };
      default:
        return getBaseAnimation();
    }
  };
  
  // Composant SVG de la mascotte NetBot
  const MascotSVG = () => (
    <svg 
      viewBox="0 0 120 120" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("fill-current", getStateClasses())}
    >
      {/* Tête du robot */}
      <rect x="30" y="20" width="60" height="60" rx="10" />
      
      {/* Antennes */}
      <rect x="50" y="10" width="5" height="10" rx="2" />
      <rect x="65" y="10" width="5" height="10" rx="2" />
      <circle cx="52.5" cy="5" r="3" />
      <circle cx="67.5" cy="5" r="3" />
      
      {/* Yeux */}
      <g className={isBlinking ? "opacity-10" : "opacity-100"}>
        <rect 
          x="40" 
          y="35" 
          width="15" 
          height={state === "excited" || state === "greeting" ? "15" : "12"} 
          rx="3" 
          className="fill-white dark:fill-gray-800" 
        />
        <rect 
          x="65" 
          y="35" 
          width="15" 
          height={state === "excited" || state === "greeting" ? "15" : "12"}  
          rx="3" 
          className="fill-white dark:fill-gray-800" 
        />
        
        {/* Pupilles */}
        <circle 
          cx={state === "thinking" ? "48" : "47.5"} 
          cy={state === "excited" ? "46" : "41"} 
          r="4" 
          className="fill-black dark:fill-gray-200" 
        />
        <circle 
          cx={state === "thinking" ? "77" : "72.5"} 
          cy={state === "excited" ? "46" : "41"} 
          r="4" 
          className="fill-black dark:fill-gray-200" 
        />
      </g>
      
      {/* Bouche */}
      {state === "sleeping" ? (
        // Bouche ZZZ pour sleeping
        <g className="fill-white dark:fill-gray-800">
          <text x="50" y="65" fontSize="14" className="fill-white dark:fill-gray-800">zzz</text>
        </g>
      ) : state === "excited" || state === "success" ? (
        // Bouche souriante pour excited et success
        <path d="M45,60 Q60,70 75,60" stroke="white" strokeWidth="3" fill="none" className="stroke-white dark:stroke-gray-800" />
      ) : state === "error" ? (
        // Bouche triste pour error
        <path d="M45,65 Q60,55 75,65" stroke="white" strokeWidth="3" fill="none" className="stroke-white dark:stroke-gray-800" />
      ) : (
        // Bouche normale pour les autres états
        <rect x="45" y="60" width="30" height="6" rx="3" className="fill-white dark:fill-gray-800" />
      )}
      
      {/* Corps */}
      <rect x="40" y="80" width="40" height="25" rx="5" />
      
      {/* Bras */}
      {waving ? (
        <g>
          {/* Bras gauche (fixe) */}
          <rect x="25" y="85" width="15" height="6" rx="3" />
          
          {/* Bras droit (qui salue) */}
          <motion.g
            animate={{
              rotate: [0, 20, 0, 20, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              originX: 0.2,
              originY: 0.5
            }}
          >
            <rect x="80" y="85" width="15" height="6" rx="3" />
          </motion.g>
        </g>
      ) : (
        <g>
          {/* Bras normaux */}
          <rect x="25" y="85" width="15" height="6" rx="3" />
          <rect x="80" y="85" width="15" height="6" rx="3" />
        </g>
      )}
      
      {/* Jambes */}
      <rect x="45" y="105" width="8" height="12" rx="2" />
      <rect x="67" y="105" width="8" height="12" rx="2" />
      
      {/* Pieds */}
      <rect x="42" y="115" width="14" height="5" rx="2" />
      <rect x="64" y="115" width="14" height="5" rx="2" />
    </svg>
  );
  
  // Calculer les dimensions du conteneur en fonction de la taille
  const getContainerSize = () => {
    switch (size) {
      case "xs": return "w-10 h-10";
      case "sm": return "w-16 h-16";
      case "md": return "w-20 h-20";
      case "lg": return "w-32 h-32";
      case "xl": return "w-40 h-40";
      default: return "w-20 h-20";
    }
  };
  
  // Calculer les classes pour le message
  const getMessageClass = () => {
    switch (size) {
      case "xs": return "text-xs mt-1";
      case "sm": return "text-sm mt-1";
      case "md": return "text-sm mt-2";
      case "lg": return "text-base mt-2";
      case "xl": return "text-lg mt-3";
      default: return "text-sm mt-2";
    }
  };
  
  // Générer l'effet de pulse pour certains états
  const renderPulseEffect = () => {
    if (state === "working" || state === "thinking") {
      return (
        <div 
          className="absolute inset-0 rounded-full animate-ping-slow opacity-40"
          style={{ backgroundColor: pulseColor }}
        />
      );
    }
    return null;
  };
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div 
        className={cn(
          "relative flex items-center justify-center", 
          getContainerSize(),
          clickable && "cursor-pointer hover:scale-105 transition-transform"
        )}
        onClick={clickable ? onClick : undefined}
      >
        {/* Effet de pulse */}
        {renderPulseEffect()}
        
        {/* Mascotte */}
        <motion.div 
          className={cn(getSizeClass())}
          animate={getStateAnimation()}
          onAnimationComplete={() => {
            if (!loop && onAnimationComplete && state !== "idle") {
              onAnimationComplete();
            }
          }}
        >
          <MascotSVG />
        </motion.div>
      </div>
      
      {/* Message */}
      {message && (
        <AnimatePresence>
          <motion.div 
            key={message}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "text-center font-medium",
              getMessageClass(),
              state === "error" ? "text-red-500 dark:text-red-400" :
              state === "success" ? "text-green-500 dark:text-green-400" :
              "text-foreground"
            )}
          >
            {message}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}