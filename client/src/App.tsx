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
import { AdminRoute } from "@/components/auth/admin-route";
import { AdminBar } from "@/components/auth/admin-bar";
import { isAdminAuthenticated } from "@/lib/auth-service";

// Import pour la page de porte automatique
import PorteAutomatique from "@/pages/porte-automatique";
// Import pour la page de démo de mascotte
import MascotPage from "@/pages/mascot";
// Import pour la console d'innovation IA
import IAConsole from "@/pages/ia-console";
// Import pour l'assistant IA automatique
import AssistantAutomatique from "@/pages/assistant-automatique";
// Import pour la page d'authentification administrateur
import LoginAdmin from "@/pages/login-admin";
// Import pour le terminal IA style Linux
import IATerminal from "@/pages/ia-terminal";

function Router() {
  const [location] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Vérifier si l'utilisateur est un administrateur authentifié
  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
  }, [location]);
  
  return (
    <>
      {isAdmin && <AdminBar />}
      <div className={isAdmin ? "pt-12" : ""}>
        <Switch location={location}>
          {/* Route d'authentification */}
          <Route path="/login-admin" component={LoginAdmin} />
          
          {/* Routes protégées par authentification administrateur */}
          <Route path="/">
            <AdminRoute>
              <Home />
            </AdminRoute>
          </Route>
          <Route path="/ai">
            <AdminRoute>
              <AI />
            </AdminRoute>
          </Route>
          <Route path="/help">
            <AdminRoute>
              <Help />
            </AdminRoute>
          </Route>
          <Route path="/ia-central">
            <AdminRoute>
              <IACentral />
            </AdminRoute>
          </Route>
          <Route path="/porte-automatique">
            <AdminRoute>
              <PorteAutomatique />
            </AdminRoute>
          </Route>
          <Route path="/mascot">
            <AdminRoute>
              <MascotPage />
            </AdminRoute>
          </Route>
          <Route path="/ia-console">
            <AdminRoute>
              <IAConsole />
            </AdminRoute>
          </Route>
          <Route path="/assistant-automatique">
            <AdminRoute>
              <AssistantAutomatique />
            </AdminRoute>
          </Route>
          <Route path="/ia-terminal">
            <AdminRoute>
              <IATerminal />
            </AdminRoute>
          </Route>
          <Route>
            <AdminRoute>
              <NotFound />
            </AdminRoute>
          </Route>
        </Switch>
      </div>
    </>
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
