import React from 'react';
import { CodeBlock } from '@/components/ui/code-block';

export default function ErrorHandling() {
  return (
    <section id="error-handling" className="mb-12">
      <h2 className="text-2xl font-medium text-gray-900 mb-4">Gestion des erreurs</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-4">L'API implémente une gestion centralisée des erreurs qui garantit des réponses d'erreur cohérentes pour toutes les routes.</p>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Format de réponse d'erreur</h3>
        <CodeBlock language="json">
{`{
  "success": false,
  "error": "Message d'erreur détaillé",
  "stack": "Stack trace (uniquement en développement)"
}`}
        </CodeBlock>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Types d'erreurs courants</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code HTTP</th>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type d'erreur</th>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">400</td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">Bad Request</td>
                <td className="px-6 py-4 border-b border-gray-200">Erreur de validation ou requête mal formatée</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">401</td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">Unauthorized</td>
                <td className="px-6 py-4 border-b border-gray-200">Authentification requise</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">403</td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">Forbidden</td>
                <td className="px-6 py-4 border-b border-gray-200">Authentifié mais sans les permissions nécessaires</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">404</td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">Not Found</td>
                <td className="px-6 py-4 border-b border-gray-200">Ressource non trouvée</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">500</td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">Server Error</td>
                <td className="px-6 py-4 border-b border-gray-200">Erreur interne du serveur</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Implémentation du gestionnaire d'erreurs</h3>
        <CodeBlock language="typescript">
{`// error-handler.ts
import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};`}
        </CodeBlock>
      </div>
    </section>
  );
}
