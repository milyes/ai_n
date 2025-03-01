import React, { useEffect, useState } from 'react';

export type AssistantState = 
  | "idle"      // Au repos, prêt à aider
  | "listening" // Écoute active
  | "thinking"  // En train de réfléchir/traiter
  | "speaking"  // En train de donner une réponse
  | "success"   // Opération réussie
  | "error";    // Erreur rencontrée

type AssistantAnimationProps = {
  state: AssistantState;
  size?: "sm" | "md" | "lg";
  message?: string;
  pulseColor?: string;
  onComplete?: () => void;
};

export function AssistantAnimation({
  state = "idle",
  size = "md",
  message,
  pulseColor = "primary",
  onComplete
}: AssistantAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Dimensions basées sur la taille
  const dimensions = {
    sm: { size: "24px", strokeWidth: 2 },
    md: { size: "36px", strokeWidth: 2 },
    lg: { size: "48px", strokeWidth: 3 }
  };
  
  const { size: sizeValue, strokeWidth } = dimensions[size];
  
  // Gestion des animations et transitions entre états
  useEffect(() => {
    if (state === "speaking" || state === "thinking" || state === "listening") {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
    
    // Notification de fin d'animation pour les états transitoires
    if (state === "success" || state === "error") {
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [state, onComplete]);
  
  // Rendu en fonction de l'état
  const renderAnimation = () => {
    switch (state) {
      case "idle":
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={sizeValue} 
            height={sizeValue} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        );
        
      case "listening":
        return (
          <div className="relative">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width={sizeValue} 
              height={sizeValue} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={strokeWidth} 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <div className={`absolute inset-0 animate-pulse rounded-full bg-${pulseColor}-500 opacity-20`}></div>
          </div>
        );
        
      case "thinking":
        return (
          <div className="relative">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width={sizeValue} 
              height={sizeValue} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={strokeWidth} 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        );
        
      case "speaking":
        return (
          <div className="relative">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width={sizeValue} 
              height={sizeValue} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={strokeWidth} 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 9.05v2" className="animate-bounce" style={{ animationDelay: "0ms" }} />
              <path d="M12 9.05v2" className="animate-bounce" style={{ animationDelay: "100ms" }} />
              <path d="M16 9.05v2" className="animate-bounce" style={{ animationDelay: "200ms" }} />
            </svg>
          </div>
        );
        
      case "success":
        return (
          <div className="relative">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width={sizeValue} 
              height={sizeValue} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={strokeWidth} 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-green-500"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        );
        
      case "error":
        return (
          <div className="relative">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width={sizeValue} 
              height={sizeValue} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={strokeWidth} 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={`inline-flex items-center justify-center ${isAnimating ? 'animate-bounce-subtle' : ''}`}>
      {renderAnimation()}
      {message && <span className="ml-2">{message}</span>}
    </div>
  );
}