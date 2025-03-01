import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AssistantAnimation, AssistantState } from '@/components/ai/assistant-animation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface AutoAssistantProps {
  initialMessage?: string;
  autoShow?: boolean;
  delay?: number;
  onDismiss?: () => void;
}

export function AutoAssistant({
  initialMessage = "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
  autoShow = true,
  delay = 2000,
  onDismiss
}: AutoAssistantProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [userInput, setUserInput] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    if (autoShow) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, delay]);

  const handleClose = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleInputShow = () => {
    setIsInputVisible(true);
    setAssistantState("listening");
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    setAssistantState("thinking");
    
    try {
      // Simuler une réponse IA (à remplacer par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let response = "";
      
      // Réponses simples prédéfinies pour la démonstration
      if (userInput.toLowerCase().includes("bonjour") || userInput.toLowerCase().includes("salut")) {
        response = "Bonjour ! Comment puis-je vous assister aujourd'hui ?";
      } else if (userInput.toLowerCase().includes("aide") || userInput.toLowerCase().includes("help")) {
        response = "Je peux vous aider avec la configuration de l'API, l'utilisation des fonctionnalités IA, ou la résolution de problèmes techniques.";
      } else if (userInput.toLowerCase().includes("config") || userInput.toLowerCase().includes("setup")) {
        response = "Pour configurer l'API, vous devez obtenir une clé API et la définir dans vos variables d'environnement. Consultez la section Configuration pour plus de détails.";
      } else if (userInput.toLowerCase().includes("modèle") || userInput.toLowerCase().includes("model")) {
        response = "Nous supportons plusieurs modèles d'IA, notamment OpenAI et xAI (Grok). Vous pouvez également utiliser notre mode local qui fonctionne sans clé API mais avec des capacités réduites.";
      } else {
        response = "Je ne suis pas sûr de comprendre votre demande. Pouvez-vous reformuler ou demander de l'aide sur un sujet spécifique comme 'configuration', 'modèles' ou 'fonctionnalités' ?";
      }
      
      setAssistantState("speaking");
      setMessage(response);
      setUserInput("");
      setIsInputVisible(false);
      
      // Revenir à l'état idle après un temps
      setTimeout(() => {
        setAssistantState("idle");
      }, 3000);
      
    } catch (error) {
      console.error("Erreur lors de la communication avec l'IA:", error);
      setAssistantState("error");
      setMessage("Désolé, une erreur s'est produite. Veuillez réessayer.");
      
      toast({
        title: "Erreur d'assistance",
        description: "Impossible de traiter votre demande pour le moment.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        setAssistantState("idle");
      }, 3000);
    }
  };

  if (!isVisible) return null;

  const containerClass = isMobile 
    ? `fixed bottom-0 ${isMinimized ? 'right-0' : 'right-0 left-0'} z-50`
    : `fixed bottom-4 right-4 z-50 max-w-md ${isMinimized ? 'w-auto' : 'w-full md:w-96'}`;

  return (
    <div className={containerClass}>
      <div className={`bg-white rounded-t-lg shadow-xl transition-all ${isMinimized ? 'p-2' : 'p-4'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {!isMinimized && (
              <>
                <span className="text-lg font-medium text-gray-900 ml-2">
                  Assistant IA
                </span>
                <div className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {assistantState === "idle" ? "Disponible" : 
                   assistantState === "listening" ? "Écoute" : 
                   assistantState === "thinking" ? "Réfléchit" : 
                   assistantState === "speaking" ? "Répond" : 
                   assistantState === "error" ? "Erreur" : "Actif"}
                </div>
              </>
            )}
          </div>
          
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900"
              onClick={handleMinimize}
            >
              {isMinimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </Button>
            
            {!isMinimized && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900"
                onClick={handleClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            )}
          </div>
        </div>
        
        {/* Content */}
        {!isMinimized && (
          <div className="mb-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 mt-1">
                <AssistantAnimation 
                  state={assistantState} 
                  size="sm"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg rounded-tl-none text-gray-800">
                {message}
              </div>
            </div>
            
            {isInputVisible ? (
              <form onSubmit={handleInputSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Button type="submit" disabled={assistantState === "thinking"}>
                  Envoyer
                </Button>
              </form>
            ) : (
              <div className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleInputShow}
                  className="flex-1"
                >
                  Poser une question
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setMessage("Voici les fonctionnalités principales :\n• Analyse de sentiment\n• Génération de résumés\n• Recommandations personnalisées");
                    setAssistantState("speaking");
                    setTimeout(() => setAssistantState("idle"), 3000);
                  }}
                  className="flex-1"
                >
                  Voir les fonctionnalités
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}