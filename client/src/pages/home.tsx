import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import Intro from '@/pages/intro';
import Installation from '@/pages/installation';
import Endpoints from '@/pages/endpoints';
import Validation from '@/pages/validation';
import ErrorHandling from '@/pages/error-handling';
import { useHelp } from '@/lib/help-context';
import { HelpTooltip, ContextualHelp } from '@/components/ui/help-tooltip';

export default function Home() {
  const { showHelp, isHelpEnabled } = useHelp();
  
  // Add CSS for styling that was in the design HTML
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        font-family: 'Roboto', system-ui, -apple-system, sans-serif;
      }
      .code-block {
        background-color: #f8f9fa;
        border-radius: 4px;
        padding: 16px;
        margin: 16px 0;
        font-family: 'Roboto Mono', monospace;
        font-size: 14px;
        overflow-x: auto;
      }
      .method-get { color: #4caf50; }
      .method-post { color: #2196f3; }
      .method-put { color: #ff9800; }
      .method-delete { color: #f44336; }
      .sidebar-active {
        border-left: 4px solid #3f51b5;
        background-color: rgba(63, 81, 181, 0.1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Afficher une bulle d'aide de bienvenue lorsque la page se charge
  useEffect(() => {
    if (isHelpEnabled) {
      showHelp({
        id: "welcome-help",
        title: "Bienvenue dans la documentation API",
        description: "Cette documentation vous guidera à travers l'utilisation de notre API multi-origine avec des fonctionnalités d'IA avancées.",
        position: "bottom-right",
        showAcknowledge: true,
        autoHide: true,
        autoHideDelay: 10000
      });
    }
  }, [showHelp, isHelpEnabled]);

  // Handle smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchorElement = target.closest('a[href^="#"]');
      
      if (anchorElement) {
        e.preventDefault();
        const targetId = anchorElement.getAttribute('href');
        if (targetId) {
          const targetElement = document.querySelector(targetId);
          if (targetElement instanceof HTMLElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 20,
              behavior: 'smooth'
            });
          }
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <Intro />
          <Installation />
          <Endpoints />
          <Validation />
          <ErrorHandling />
          
          {/* AI Module Section */}
          <section id="ai-module" className="mb-12">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              Module IA
              <HelpTooltip 
                content="Notre module IA permet d'intégrer des fonctionnalités d'intelligence artificielle à votre application."
                type="info"
                className="ml-2"
              />
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="mb-4">
                L'API est équipée de fonctionnalités d'intelligence artificielle pour améliorer l'expérience utilisateur et automatiser certaines tâches. Le système supporte plusieurs 
                <ContextualHelp
                  content={
                    <div className="space-y-2">
                      <p>Les origines IA supportées sont :</p>
                      <ul className="list-disc pl-4">
                        <li>OpenAI</li>
                        <li>xAI (Grok)</li>
                        <li>Mode local (dégradé sans clé API)</li>
                      </ul>
                    </div>
                  }
                  type="help"
                  interactive={true}
                >
                  <span className="font-medium text-primary">origines d'IA</span>
                </ContextualHelp> qui peuvent être configurées selon vos besoins.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Fonctionnalités d'IA disponibles</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Analyse de sentiment de texte
                  <HelpTooltip 
                    content="Déterminez le ton émotionnel d'un texte avec une note de 1 à 5 et un niveau de confiance."
                    type="help"
                    className="ml-2"
                  />
                </li>
                <li>
                  Génération de résumés automatiques
                  <HelpTooltip 
                    content="Créez des versions condensées de textes longs tout en préservant les informations essentielles."
                    type="help"
                    className="ml-2"
                  />
                </li>
                <li>
                  Recommandations de produits personnalisées
                  <HelpTooltip 
                    content="Obtenez des suggestions de produits basées sur les préférences et l'historique des utilisateurs."
                    type="help"
                    className="ml-2"
                  />
                </li>
              </ul>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">
                Configuration de la clé API
                <HelpTooltip 
                  content={
                    <div>
                      <p>Une clé API valide est nécessaire pour utiliser les fonctionnalités d'IA avancées.</p>
                      <p className="mt-2">Sans clé API, le système utilisera automatiquement le mode local avec des fonctionnalités réduites.</p>
                    </div>
                  }
                  type="warning"
                  className="ml-2"
                  interactive={true}
                />
              </h3>
              <pre className="code-block bg-gray-100 text-sm"># Variables d'environnement
OPENAI_API_KEY=votre_clé_api_openai
XAI_API_KEY=votre_clé_api_xai
AI_ORIGIN=auto|openai|xai|local</pre>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Exemples d'utilisation</h3>
              <p>Pour accéder à toutes les fonctionnalités d'IA et voir des exemples interactifs, visitez la <Link href="/ai" className="text-primary hover:underline">page du module IA</Link>.</p>
              
              <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="flex items-center text-blue-700">
                  <span className="material-icons mr-2 text-blue-500">info</span>
                  Vous pouvez également consulter notre nouvelle 
                  <Link href="/help" className="mx-1 text-primary hover:underline font-medium">page d'aide contextuelle</Link>
                  pour découvrir comment utiliser toutes les fonctionnalités d'assistance intégrées.
                </p>
              </div>
            </div>
          </section>
          
          {/* Testing Section */}
          <section id="testing" className="mb-12">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Tests</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="mb-4">L'API est livrée avec une suite de tests complets pour garantir que tous les points de terminaison fonctionnent correctement.</p>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Exécution des tests</h3>
              <pre className="code-block bg-gray-100 text-sm">npm test</pre>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Structure des tests</h3>
              <p>Les tests sont organisés par ressource et vérifient toutes les opérations CRUD :</p>
              <pre className="code-block bg-gray-100 text-sm">{`// users.test.js
describe('User API', () => {
  it('should get all users', async () => {
    // Test implementation
  });
  
  it('should get a user by ID', async () => {
    // Test implementation
  });
  
  it('should create a new user', async () => {
    // Test implementation
  });
  
  // More tests...
});`}</pre>
            </div>
          </section>
          
          {/* Configuration Section */}
          <section id="configuration" className="mb-12">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Configuration</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="mb-4">L'API peut être configurée de plusieurs façons pour s'adapter à différents environnements.</p>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Variables d'environnement</h3>
              <pre className="code-block bg-gray-100 text-sm"># .env
PORT=3000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/api-database
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5000</pre>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Configuration CORS</h3>
              <pre className="code-block bg-gray-100 text-sm">{`// corsOptions.js
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 heures
};`}</pre>
            </div>
          </section>
          
          {/* Deployment Section */}
          <section id="deployment" className="mb-12">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Déploiement</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="mb-4">Instructions pour déployer l'API dans différents environnements.</p>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Préparation pour la production</h3>
              <pre className="code-block bg-gray-100 text-sm">npm run build</pre>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Déploiement sur Heroku</h3>
              <pre className="code-block bg-gray-100 text-sm">heroku create
git push heroku main</pre>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Déploiement avec Docker</h3>
              <pre className="code-block bg-gray-100 text-sm">docker build -t my-api .
docker run -p 3000:3000 my-api</pre>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Checklist de déploiement</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Définir NODE_ENV=production</li>
                <li>Configurer les variables d'environnement sécurisées</li>
                <li>Activer la compression pour les réponses</li>
                <li>Configurer un rate limiting pour prévenir les abus</li>
                <li>Mettre en place un monitoring et des alertes</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
