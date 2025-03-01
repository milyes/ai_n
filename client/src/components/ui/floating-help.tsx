import React, { useState, useEffect } from "react";
import { X, Lightbulb, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface FloatingHelpProps {
  id: string;
  title: string;
  description: React.ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showDismiss?: boolean;
  showAcknowledge?: boolean;
  onDismiss?: () => void;
  onAcknowledge?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Composant d'aide flottante qui affiche une bulle d'aide à une position spécifique sur l'écran
 */
export function FloatingHelp({
  id,
  title,
  description,
  position = "bottom-right",
  showDismiss = true,
  showAcknowledge = false,
  onDismiss,
  onAcknowledge,
  autoHide = false,
  autoHideDelay = 8000,
  className,
  children,
}: FloatingHelpProps) {
  const [visible, setVisible] = useState(true);
  const localStorageKey = `floating-help-${id}-dismissed`;

  // Vérifier si l'aide a déjà été fermée
  useEffect(() => {
    if (window.localStorage.getItem(localStorageKey) === "true") {
      setVisible(false);
    }
  }, [localStorageKey]);

  // Masquer automatiquement après un délai si autoHide est activé
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (autoHide && visible) {
      timeoutId = setTimeout(() => {
        setVisible(false);
      }, autoHideDelay);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [autoHide, autoHideDelay, visible]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
    // Stocker l'état dans localStorage pour ne pas réafficher cette aide
    window.localStorage.setItem(localStorageKey, "true");
  };

  const handleAcknowledge = () => {
    setVisible(false);
    if (onAcknowledge) onAcknowledge();
    // Stocker l'état dans localStorage pour ne pas réafficher cette aide
    window.localStorage.setItem(localStorageKey, "true");
  };

  if (!visible) return null;

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <div
      className={cn(
        "fixed z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500",
        positionClasses[position],
        className
      )}
    >
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {showDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            )}
          </div>
          {typeof description === "string" ? (
            <CardDescription>{description}</CardDescription>
          ) : (
            description
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {showAcknowledge && (
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={handleAcknowledge}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Compris
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

/**
 * Composant pour gérer un ensemble de bulles d'aide
 */
export interface HelpBubble extends FloatingHelpProps {
  bubbleKey: string;
}

export interface HelpBubblesManagerProps {
  bubbles: HelpBubble[];
  onBubbleDismiss?: (key: string) => void;
}

export function HelpBubblesManager({
  bubbles,
  onBubbleDismiss,
}: HelpBubblesManagerProps) {
  return (
    <>
      {bubbles.map((bubble) => {
        const { bubbleKey, ...bubbleProps } = bubble;
        return (
          <FloatingHelp
            key={bubbleKey}
            {...bubbleProps}
            onDismiss={() => onBubbleDismiss && onBubbleDismiss(bubbleKey)}
          />
        );
      })}
    </>
  );
}