import React from 'react';

export default function Intro() {
  return (
    <section id="introduction" className="mb-12">
      <h2 className="text-2xl font-medium text-gray-900 mb-4">Introduction</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-4">Bienvenue dans la documentation de notre API RESTful Node.js. Cette API fournit des fonctionnalités CRUD (Create, Read, Update, Delete) complètes et est construite avec Express.js.</p>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Caractéristiques principales</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>API RESTful complète avec Express.js</li>
          <li>Points de terminaison CRUD pour gérer les ressources</li>
          <li>Validation des données entrantes</li>
          <li>Gestion robuste des erreurs</li>
          <li>Format de réponse JSON cohérent</li>
          <li>Documentation complète des points de terminaison</li>
          <li>Tests automatisés pour tous les points de terminaison</li>
        </ul>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Commencer</h3>
        <p>Pour commencer à utiliser l'API, suivez les instructions d'installation ci-dessous et consultez la documentation des points de terminaison.</p>
      </div>
    </section>
  );
}
