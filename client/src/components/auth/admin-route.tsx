import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { isAdminAuthenticated, refreshAdminSession } from '@/lib/auth-service';
import { MascotLoader } from '@/components/mascot/mascot-loader';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Composant de protection de route pour les pages nécessitant une authentification administrateur
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = async () => {
      const authenticated = isAdminAuthenticated();
      
      if (authenticated) {
        // Rafraîchir la session si l'authentification est valide
        refreshAdminSession();
        setIsAuthenticated(true);
      } else {
        // Rediriger vers la page de connexion si non authentifié
        setIsAuthenticated(false);
        setTimeout(() => {
          navigate('/login-admin');
        }, 1000);
      }
    };
    
    checkAuth();
    
    // Vérifier régulièrement l'authentification
    const interval = setInterval(() => {
      if (!isAdminAuthenticated() && isAuthenticated) {
        setIsAuthenticated(false);
        navigate('/login-admin');
      }
    }, 60000); // Vérifier toutes les minutes
    
    return () => clearInterval(interval);
  }, [navigate, isAuthenticated]);

  // Afficher un loader pendant la vérification
  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 z-50">
        <MascotLoader 
          phase="loading" 
          text="Vérification des privilèges administrateur..." 
          size="md" 
          overlay={true}
        />
      </div>
    );
  }
  
  // Afficher un message d'erreur si non authentifié
  if (isAuthenticated === false) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 z-50">
        <MascotLoader 
          phase="error" 
          text="Authentification requise. Redirection vers la page de connexion..." 
          size="md" 
          overlay={true}
        />
      </div>
    );
  }
  
  // Rendre les enfants si authentifié
  return <>{children}</>;
}