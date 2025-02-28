import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, Check, X, Brain, Sparkles } from "lucide-react";

// Types d'états de l'assistant
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
  pulseColor = "bg-blue-500",
  onComplete
}: AssistantAnimationProps) {
  const [showMessage, setShowMessage] = useState(false);

  // Gestion de la taille
  const dimensions = {
    sm: { container: "h-10 w-10", icon: 16 },
    md: { container: "h-16 w-16", icon: 24 },
    lg: { container: "h-24 w-24", icon: 32 }
  };

  // Animation automatique pour les états de succès/erreur
  useEffect(() => {
    if (state === "success" || state === "error") {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        if (onComplete) onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    if (message) {
      setShowMessage(true);
    }
  }, [state, message, onComplete]);

  // Obtenir l'icône en fonction de l'état
  const getIcon = () => {
    switch (state) {
      case "idle":
        return <Bot className="text-gray-600 dark:text-gray-300" />;
      case "listening":
        return <Bot className="text-blue-500" />;
      case "thinking":
        return <Brain className="text-purple-500" />;
      case "speaking":
        return <Bot className="text-green-500" />;
      case "success":
        return <Check className="text-green-500" />;
      case "error":
        return <X className="text-red-500" />;
      default:
        return <Bot className="text-gray-600 dark:text-gray-300" />;
    }
  };

  // Animation de pulse
  const renderPulse = () => {
    if (state === "idle" || state === "success" || state === "error") return null;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 0.5, 0], 
            scale: [0.8, 1.2, 0.8] 
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute rounded-full ${pulseColor} opacity-50`}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  };

  // Animation de particules pour l'état de succès
  const renderParticles = () => {
    if (state !== "success") return null;
    
    return (
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0 
            }}
            animate={{ 
              x: Math.cos(i * Math.PI / 4) * 40, 
              y: Math.sin(i * Math.PI / 4) * 40,
              opacity: [0, 1, 0] 
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut"
            }}
          />
        ))}
        
        <Sparkles 
          className="absolute text-yellow-400"
          style={{ 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)",
            width: dimensions[size].icon * 0.8,
            height: dimensions[size].icon * 0.8
          }} 
        />
      </motion.div>
    );
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className={`relative rounded-full flex items-center justify-center ${dimensions[size].container} bg-white dark:bg-gray-800 shadow-md overflow-hidden`}>
        {renderPulse()}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: dimensions[size].icon, height: dimensions[size].icon }}
          >
            {getIcon()}
          </motion.div>
        </AnimatePresence>
        
        {renderParticles()}
        
        {/* Indicateur d'activité pour l'état "thinking" */}
        {state === "thinking" && (
          <motion.div 
            className="absolute -bottom-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </motion.div>
        )}
      </div>
      
      {/* Message contextuel */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="mt-2 px-3 py-1.5 bg-white dark:bg-gray-800 text-sm rounded-lg shadow-md"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}