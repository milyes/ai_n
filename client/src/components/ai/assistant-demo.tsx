import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssistantAnimation, AssistantState } from '@/components/ai/assistant-animation';

export function AssistantDemo() {
  const [currentState, setCurrentState] = useState<AssistantState>("idle");
  
  const states: { state: AssistantState; label: string; message: string }[] = [
    { state: "idle", label: "Repos", message: "Assistant prêt à aider" },
    { state: "listening", label: "Écoute", message: "J'écoute..." },
    { state: "thinking", label: "Réflexion", message: "Je réfléchis..." },
    { state: "speaking", label: "Parole", message: "Voici ma réponse" },
    { state: "success", label: "Succès", message: "Opération réussie!" },
    { state: "error", label: "Erreur", message: "Une erreur est survenue" }
  ];
  
  return (
    <Card className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">États de l'Assistant IA</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <Tabs defaultValue="interactive" className="mb-4">
            <TabsList className="w-full">
              <TabsTrigger value="interactive" className="flex-1">Interactif</TabsTrigger>
              <TabsTrigger value="all" className="flex-1">Tous les états</TabsTrigger>
            </TabsList>
            
            <TabsContent value="interactive" className="pt-4">
              <div className="flex flex-col items-center gap-6 p-4">
                <div className="flex justify-center p-6 border rounded-lg w-full">
                  <AssistantAnimation 
                    state={currentState} 
                    size="lg" 
                    message={states.find(s => s.state === currentState)?.message}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full">
                  {states.map((stateItem) => (
                    <Button 
                      key={stateItem.state}
                      variant={currentState === stateItem.state ? "default" : "outline"}
                      onClick={() => setCurrentState(stateItem.state)}
                    >
                      {stateItem.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="space-y-6 pt-4">
              {states.map((stateItem) => (
                <div 
                  key={stateItem.state} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <AssistantAnimation state={stateItem.state} />
                    <div>
                      <h3 className="font-medium">{stateItem.label}</h3>
                      <p className="text-sm text-gray-500">{stateItem.message}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentState(stateItem.state)}
                  >
                    Essayer
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-full overflow-auto">
            <h3 className="font-medium mb-3">Utilisation du composant</h3>
            <pre className="text-xs overflow-auto p-2 bg-gray-900 text-gray-100 rounded">
{`import { AssistantAnimation } from '@/components/ai/assistant-animation';

// État statique
<AssistantAnimation 
  state="idle" 
  message="Message à afficher" 
/>

// État dynamique avec changement d'état
const [state, setState] = useState<AssistantState>("idle");

<AssistantAnimation 
  state={state}
  size="md" // 'sm', 'md', or 'lg'
  message="Message dynamique"
  onComplete={() => {
    // Action après la fin de l'animation
    setState("idle");
  }}
/>

// Changement d'état après une action
<Button onClick={() => setState("thinking")}>
  Réfléchir
</Button>`}
            </pre>
          </div>
        </div>
      </div>
    </Card>
  );
}