import { useState } from "react";
import { AssistantAnimation, AssistantState } from "./assistant-animation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function AssistantDemo() {
  const [currentState, setCurrentState] = useState<AssistantState>("idle");
  const [message, setMessage] = useState<string>("Je suis votre assistant IA.");
  
  const states: { state: AssistantState; label: string; message: string }[] = [
    { state: "idle", label: "Au repos", message: "Je suis votre assistant IA." },
    { state: "listening", label: "Écoute", message: "Je vous écoute..." },
    { state: "thinking", label: "Réflexion", message: "Je réfléchis à votre demande..." },
    { state: "speaking", label: "Réponse", message: "Voici ma réponse à votre question." },
    { state: "success", label: "Succès", message: "Opération réussie !" },
    { state: "error", label: "Erreur", message: "Une erreur est survenue." },
  ];
  
  // Simuler une séquence d'animations
  const runDemo = async () => {
    const sequence: AssistantState[] = ["idle", "listening", "thinking", "speaking", "success"];
    const messages = [
      "Je suis votre assistant IA.",
      "Je vous écoute...",
      "J'analyse votre demande...",
      "D'après mon analyse, voici la réponse à votre question.",
      "Analyse complétée avec succès !"
    ];
    
    for (let i = 0; i < sequence.length; i++) {
      setCurrentState(sequence[i]);
      setMessage(messages[i]);
      // Attendre avant de passer à l'état suivant
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Revenir à l'état initial
    setTimeout(() => {
      setCurrentState("idle");
      setMessage("Je suis votre assistant IA.");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Démo Assistant IA</CardTitle>
        <CardDescription>
          Visualisez les différentes animations de l'assistant IA.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="py-6">
          <AssistantAnimation 
            state={currentState} 
            size="lg" 
            message={message}
          />
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
          {states.map((item) => (
            <Button
              key={item.state}
              variant={currentState === item.state ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => {
                setCurrentState(item.state);
                setMessage(item.message);
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button onClick={runDemo} className="w-full">
          Lancer la démo animée
        </Button>
      </CardFooter>
    </Card>
  );
}