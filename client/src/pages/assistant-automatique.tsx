import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutoAssistService } from '@/components/ai/auto-assistant-service';
import { MascotAnimation } from '@/components/mascot/mascot-animation';
import { useToast } from '@/hooks/use-toast';

/**
 * Page du service d'Assistant IA Automatique
 * Présente un système d'assistance IA proactive qui automatise les tâches répétitives
 * et fournit des recommandations basées sur l'analyse du comportement utilisateur
 */
export default function AssistantAutomatique() {
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = (status: boolean) => {
    setIsActive(status);
    if (status) {
      toast({
        title: "Assistant activé",
        description: "L'assistant IA automatique est maintenant actif",
        variant: "default",
      });
    } else {
      toast({
        title: "Assistant désactivé",
        description: "L'assistant IA automatique a été désactivé",
        variant: "default",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Assistant IA Automatique
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Service d'intelligence artificielle proactive qui anticipe vos besoins et automatise les tâches répétitives pour maximiser votre productivité.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}>
            {isActive ? "Actif" : "Inactif"}
          </Badge>
          <MascotAnimation
            state={isActive ? "working" : "sleeping"}
            size="sm"
            loop={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-300">
              <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Proactivité Intelligente</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            L'assistant anticipe vos besoins et suggère des actions avant même que vous ne les demandiez.
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border border-purple-100 dark:border-purple-900">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-300">
              <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5" />
              <path d="M14 2v6h6" />
              <path d="M3 15h6" />
              <path d="M9 18H3" />
              <path d="M3 21h6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Automatisation des Tâches</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatisez les tâches répétitives et libérez du temps pour vous concentrer sur l'essentiel.
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-950/40 dark:to-green-950/40 border border-teal-100 dark:border-teal-900">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 dark:text-teal-300">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Apprentissage Adaptatif</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            L'assistant apprend de vos habitudes et améliore continuellement ses recommandations.
          </p>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Configuration de l'Assistant</h2>
        <AutoAssistService 
          initialActive={isActive}
          onStatusChange={handleStatusChange}
          showMascot={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Guide de démarrage rapide</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <p><span className="font-medium">Activation:</span> Activez l'assistant en utilisant l'interrupteur dans le panneau de configuration.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <p><span className="font-medium">Profils:</span> Sélectionnez des profils d'assistance qui correspondent à vos besoins spécifiques.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <p><span className="font-medium">Niveau d'automatisation:</span> Ajustez le niveau d'automatisation selon vos préférences.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-bold">4</span>
              </div>
              <p><span className="font-medium">Utilisation:</span> Laissez l'assistant travailler en arrière-plan et consulter les tâches terminées.</p>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Questions fréquentes</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">Comment l'assistant apprend-il mes préférences?</h4>
              <p className="text-gray-600 dark:text-gray-400">L'assistant analyse votre comportement et vos interactions pour identifier des modèles et s'adapter à vos besoins.</p>
            </div>
            <div>
              <h4 className="font-medium">Puis-je personnaliser les actions automatiques?</h4>
              <p className="text-gray-600 dark:text-gray-400">Oui, vous pouvez définir des profils personnalisés avec des déclencheurs et des actions spécifiques.</p>
            </div>
            <div>
              <h4 className="font-medium">Est-ce que mes données sont sécurisées?</h4>
              <p className="text-gray-600 dark:text-gray-400">Toutes les données d'apprentissage sont traitées localement et ne quittent pas votre système pour garantir la confidentialité.</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-800 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Prêt à augmenter votre productivité?</h3>
            <p className="text-indigo-100 dark:text-indigo-200 max-w-lg">
              Activez l'Assistant IA Automatique dès maintenant et laissez la technologie intelligente travailler pour vous.
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-white text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/90"
            onClick={() => {
              setIsActive(true);
              handleStatusChange(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {isActive ? "Configurer l'assistant" : "Activer l'assistant"}
          </Button>
        </div>
      </div>
    </div>
  );
}