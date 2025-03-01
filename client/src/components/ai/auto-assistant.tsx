import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssistantAnimation, AssistantState } from '@/components/ai/assistant-animation';
import { useIsMobile } from '@/hooks/use-mobile';

interface AutoAssistantProps {
  initialMessage?: string;
  autoShow?: boolean;
  delay?: number;
  onDismiss?: () => void;
}

export function AutoAssistant({
  initialMessage = "Comment puis-je vous aider aujourd'hui ?",
  autoShow = false,
  delay = 0,
  onDismiss
}: AutoAssistantProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [message, setMessage] = useState(initialMessage);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const isMobile = useIsMobile();

  // Effet pour afficher l'assistant automatiquement après un délai
  useEffect(() => {
    if (autoShow) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setAssistantState("speaking");
        setIsTyping(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, delay]);

  // Effet pour l'animation de typing
  useEffect(() => {
    if (isTyping && currentCharIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedMessage(prev => prev + message[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      }, 30); // Vitesse de frappe
      
      return () => clearTimeout(timer);
    } else if (isTyping && currentCharIndex >= message.length) {
      setIsTyping(false);
      setAssistantState("idle");
    }
  }, [isTyping, currentCharIndex, message]);

  // Réinitialisation lors du changement de message
  useEffect(() => {
    if (message !== initialMessage) {
      setMessage(initialMessage);
      setDisplayedMessage("");
      setCurrentCharIndex(0);
      setIsTyping(true);
      setAssistantState("speaking");
    }
  }, [initialMessage]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDisplayedMessage("");
    setCurrentCharIndex(0);
    
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${
      isMobile 
        ? 'bottom-0 left-0 right-0 m-2' 
        : 'bottom-8 right-8 max-w-sm'
    }`}>
      <Card className="shadow-lg overflow-hidden">
        <div className="flex items-start justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="mr-3">
              <AssistantAnimation state={assistantState} size="sm" />
            </div>
            <h3 className="font-medium">Assistant IA</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={handleDismiss}
          >
            <span className="sr-only">Fermer</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>
        
        <div className="p-4">
          <div className="min-h-[80px] mb-4">
            {displayedMessage}
            {isTyping && <span className="inline-block h-4 w-2 bg-primary animate-pulse ml-1"></span>}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-grow"
              onClick={() => {
                setDisplayedMessage("");
                setCurrentCharIndex(0);
                setMessage("Je peux vous aider avec l'implémentation des fonctionnalités IA, la configuration des API ou l'optimisation des performances.");
                setIsTyping(true);
                setAssistantState("speaking");
              }}
            >
              Que pouvez-vous faire ?
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-grow"
              onClick={() => {
                setDisplayedMessage("");
                setCurrentCharIndex(0);
                setMessage("Activez notre module IA Activex Central pour centraliser la collecte de données et optimiser automatiquement les performances sur toutes vos plateformes.");
                setIsTyping(true);
                setAssistantState("speaking");
              }}
            >
              Module IA Activex
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-grow"
              onClick={handleDismiss}
            >
              Plus tard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}