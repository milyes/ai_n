import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import Intro from '@/pages/intro';
import Installation from '@/pages/installation';
import Endpoints from '@/pages/endpoints';
import Validation from '@/pages/validation';
import ErrorHandling from '@/pages/error-handling';

export default function Home() {
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
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Module IA</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="mb-4">L'API est équipée de fonctionnalités d'intelligence artificielle pour améliorer l'expérience utilisateur et automatiser certaines tâches.</p>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Fonctionnalités d'IA disponibles</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Analyse de sentiment de texte</li>
                <li>Génération de résumés automatiques</li>
                <li>Recommandations de produits personnalisées</li>
              </ul>
              
              <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Exemples d'utilisation</h3>
              <p>Pour accéder à toutes les fonctionnalités d'IA et voir des exemples interactifs, visitez la <Link href="/ai" className="text-primary hover:underline">page du module IA</Link>.</p>
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
