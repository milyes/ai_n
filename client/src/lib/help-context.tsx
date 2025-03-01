import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FloatingHelpProps, HelpBubblesManager, HelpBubble } from '@/components/ui/floating-help';

interface HelpContextType {
  showHelp: (helpProps: Omit<FloatingHelpProps, 'id'> & { id?: string }) => string;
  dismissHelp: (id: string) => void;
  dismissAllHelp: () => void;
  isHelpEnabled: boolean;
  toggleHelpEnabled: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export interface HelpProviderProps {
  children: ReactNode;
  initialEnabled?: boolean;
}

export function HelpProvider({ children, initialEnabled = true }: HelpProviderProps) {
  const [helpBubbles, setHelpBubbles] = useState<HelpBubble[]>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    // Vérifier si l'utilisateur a désactivé les bulles d'aide
    const stored = localStorage.getItem('help-bubbles-enabled');
    return stored !== null ? stored === 'true' : initialEnabled;
  });

  const showHelp = useCallback((helpProps: Omit<FloatingHelpProps, 'id'> & { id?: string }) => {
    const id = helpProps.id || `help-${Date.now()}`;
    const bubbleKey = `${id}-${Date.now()}`;
    
    // Ne pas afficher l'aide si elle est désactivée
    if (!isEnabled) return id;
    
    // Vérifier si cette aide a déjà été fermée définitivement
    const isDismissed = localStorage.getItem(`floating-help-${id}-dismissed`) === 'true';
    if (isDismissed) return id;
    
    setHelpBubbles(prev => [
      ...prev,
      { ...helpProps, id, bubbleKey }
    ]);
    
    return id;
  }, [isEnabled]);

  const dismissHelp = useCallback((id: string) => {
    setHelpBubbles(prev => prev.filter(bubble => bubble.id !== id));
  }, []);

  const dismissAllHelp = useCallback(() => {
    setHelpBubbles([]);
  }, []);

  const toggleHelpEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('help-bubbles-enabled', newValue.toString());
      if (!newValue) {
        // Si désactivé, masquer toutes les bulles
        setHelpBubbles([]);
      }
      return newValue;
    });
  }, []);

  const handleBubbleDismiss = useCallback((key: string) => {
    setHelpBubbles(prev => prev.filter(bubble => bubble.bubbleKey !== key));
  }, []);

  return (
    <HelpContext.Provider
      value={{
        showHelp,
        dismissHelp,
        dismissAllHelp,
        isHelpEnabled: isEnabled,
        toggleHelpEnabled,
      }}
    >
      {children}
      <HelpBubblesManager
        bubbles={helpBubbles}
        onBubbleDismiss={handleBubbleDismiss}
      />
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}