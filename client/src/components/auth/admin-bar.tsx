import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { logoutAdmin, getSessionTimeRemaining } from '@/lib/auth-service';

/**
 * Barre d'administration affichant les informations de session et options de déconnexion
 */
export function AdminBar() {
  const [, navigate] = useLocation();
  const [timeRemaining, setTimeRemaining] = useState(getSessionTimeRemaining());
  
  // Mettre à jour le temps restant de session
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getSessionTimeRemaining());
    }, 60000); // Mettre à jour chaque minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Gérer la déconnexion
  const handleLogout = () => {
    logoutAdmin();
    navigate('/login-admin');
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-700">Admin</Badge>
          <span className="text-xs text-gray-400">
            Session active: {timeRemaining} minutes restantes
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-400">
            NetSecure Pro • Admin
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-xs"
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}