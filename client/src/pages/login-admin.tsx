import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { MascotAnimation } from '@/components/mascot/mascot-animation';

/**
 * Page d'authentification administrateur
 * Contrôle l'accès au système avec des identifiants sécurisés
 */
export default function LoginAdmin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mascotState, setMascotState] = useState<'idle' | 'thinking' | 'success' | 'error'>('idle');
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Identifiants administrateur hardcodés
  // En production, ils seraient stockés de manière sécurisée et hachés
  const ADMIN_USERNAME = 'mx76';
  const ADMIN_PASSWORD = '1776';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMascotState('thinking');

    // Simuler une vérification d'authentification avec délai
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Login réussi
        setMascotState('success');
        toast({
          title: "Authentification réussie",
          description: "Bienvenue, administrateur. Accès total accordé.",
          variant: "default",
        });
        
        // Stockage de l'état d'authentification dans le localStorage
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_timestamp', Date.now().toString());
        
        console.log('Authentification réussie, données stockées dans localStorage');
        
        // Redirection vers la page principale
        setTimeout(() => {
          navigate('/ia-central');
        }, 1000);
      } else {
        // Échec d'authentification
        setMascotState('error');
        setError('Identifiants incorrects. Veuillez réessayer.');
        toast({
          title: "Échec d'authentification",
          description: "Les identifiants fournis sont incorrects.",
          variant: "destructive",
        });
        
        // Remise à l'état initial
        setTimeout(() => {
          setMascotState('idle');
        }, 2000);
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6">
            <MascotAnimation 
              state={mascotState} 
              size="lg" 
              message={
                mascotState === 'thinking' ? "Vérification des identifiants..." :
                mascotState === 'success' ? "Accès accordé !" :
                mascotState === 'error' ? "Accès refusé !" : 
                "Authentification administrateur"
              }
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NetSecure Pro</h1>
          <p className="text-gray-400 text-center">Plateforme d'administration sécurisée</p>
        </div>
        
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Authentification Administrateur</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Identifiant</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez votre identifiant"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  required
                  autoComplete="off"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              
              {error && (
                <div className="px-3 py-2 rounded bg-red-900/40 border border-red-800 text-red-200 text-sm">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Authentification en cours...' : 'Accéder au système'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Accès restreint aux administrateurs autorisés
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Ce système est surveillé et tous les accès sont enregistrés
            </p>
          </div>
        </Card>
        
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-green-400 text-xs">Système sécurisé</p>
          </div>
          <p className="text-gray-500 text-xs">
            NetSecure Pro &copy; {new Date().getFullYear()} • Version 3.7.6
          </p>
        </div>
      </div>
    </div>
  );
}