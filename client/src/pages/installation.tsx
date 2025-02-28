import React from 'react';
import { CodeBlock } from '@/components/ui/code-block';

export default function Installation() {
  return (
    <section id="installation" className="mb-12">
      <h2 className="text-2xl font-medium text-gray-900 mb-4">Installation</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Prérequis</h3>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Node.js (v14 ou plus récent)</li>
          <li>npm ou yarn</li>
        </ul>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Cloner le dépôt</h3>
        <CodeBlock language="bash">
{`git clone https://github.com/username/api-project.git
cd api-project`}
        </CodeBlock>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Installer les dépendances</h3>
        <CodeBlock language="bash">npm install</CodeBlock>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Configuration</h3>
        <p className="mb-3">Créez un fichier <code>.env</code> à la racine du projet :</p>
        <CodeBlock language="env">
{`PORT=3000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/api-database`}
        </CodeBlock>

        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Ajout de packages dans replit.nix</h3>
        <p className="mb-3">Pour ajouter des packages dans replit.nix, suivez ces étapes :</p>
        <CodeBlock language="nix">
{`{
  description = "Node.js API";
  
  # Ajouter les dépendances requises
  deps = [
    pkgs.nodejs
    pkgs.nodePackages.npm
    pkgs.yarn
    # Ajoutez vos packages supplémentaires ici
    pkgs.mongodb
  ];
}`}
        </CodeBlock>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Lancer le serveur</h3>
        <CodeBlock language="bash">npm start</CodeBlock>
        <p>Le serveur démarrera sur <a href="http://localhost:3000" className="text-primary hover:underline">http://localhost:3000</a></p>
      </div>
    </section>
  );
}
