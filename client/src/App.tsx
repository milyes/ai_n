import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "./lib/context";
import { HelpProvider } from "./lib/help-context";
import Home from "@/pages/home";
import AI from "@/pages/ai";
import Help from "@/pages/help";
import IACentral from "@/pages/ia-central";
import { AutoAssistant } from "@/components/ai/auto-assistant";
import { useState, useEffect } from "react";

// Import pour la page de porte automatique
import PorteAutomatique from "@/pages/porte-automatique";
// Import pour la page de démo de mascotte
import MascotPage from "@/pages/mascot";

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch location={location}>
      <Route path="/" component={Home} />
      <Route path="/ai" component={AI} />
      <Route path="/help" component={Help} />
      <Route path="/ia-central" component={IACentral} />
      <Route path="/porte-automatique" component={PorteAutomatique} />
      <Route path="/mascot" component={MascotPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState("");
  
  // Activer l'assistant après un délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAssistant(true);
      setAssistantMessage("Bonjour ! Je suis votre assistant IA automatique. Comment puis-je vous aider avec la configuration de votre API ou les fonctionnalités d'IA ?");
    }, 5000); // 5 secondes
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleAssistantDismiss = () => {
    setShowAssistant(false);
    
    // Réapparaître après un certain temps avec un autre message
    setTimeout(() => {
      setShowAssistant(true);
      setAssistantMessage("N'hésitez pas à me demander de l'aide sur nos fonctionnalités IA ou la configuration de l'API !");
    }, 120000); // 2 minutes
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HelpProvider>
          <Router />
          <Toaster />
          {showAssistant && (
            <AutoAssistant 
              initialMessage={assistantMessage}
              autoShow={true}
              delay={500}
              onDismiss={handleAssistantDismiss}
            />
          )}
        </HelpProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
