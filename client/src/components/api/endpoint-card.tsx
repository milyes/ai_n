import React, { useState } from 'react';

interface TabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function Tab({ label, active, onClick }: TabProps) {
  return (
    <button
      className={`px-4 py-2 ${
        active ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface EndpointCardProps {
  method: HttpMethod;
  path: string;
  statusCode: string;
  statusText: string;
  description: string;
  responseExample: string;
  requestExample?: string;
  parameters?: React.ReactNode;
}

export function EndpointCard({
  method,
  path,
  statusCode,
  statusText,
  description,
  responseExample,
  requestExample,
  parameters
}: EndpointCardProps) {
  const [activeTab, setActiveTab] = useState<'response' | 'request' | 'params' | 'test'>(
    'response'
  );

  const getMethodColor = (method: HttpMethod) => {
    switch (method) {
      case 'GET':
        return 'method-get';
      case 'POST':
        return 'method-post';
      case 'PUT':
        return 'method-put';
      case 'DELETE':
        return 'method-delete';
      default:
        return '';
    }
  };

  const getStatusColor = (code: string) => {
    const numCode = parseInt(code);
    if (numCode >= 200 && numCode < 300) return 'bg-success bg-opacity-20 text-success';
    if (numCode >= 400 && numCode < 500) return 'bg-warning bg-opacity-20 text-warning';
    if (numCode >= 500) return 'bg-error bg-opacity-20 text-error';
    return 'bg-info bg-opacity-20 text-info';
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="border-b px-6 py-4">
        <div className="flex items-center">
          <span className={`text-sm font-medium uppercase ${getMethodColor(method)}`}>
            {method}
          </span>
          <code className="ml-3 font-mono">{path}</code>
          <span
            className={`ml-auto px-2 py-1 ${getStatusColor(
              statusCode
            )} text-xs rounded-full`}
          >
            {statusCode} {statusText}
          </span>
        </div>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>

      <div className="p-6 border-b">
        <div className="flex mb-4">
          <Tab
            label="Exemple de réponse"
            active={activeTab === 'response'}
            onClick={() => setActiveTab('response')}
          />
          {requestExample && (
            <Tab
              label="Corps de la requête"
              active={activeTab === 'request'}
              onClick={() => setActiveTab('request')}
            />
          )}
          {parameters && (
            <Tab
              label="Paramètres"
              active={activeTab === 'params'}
              onClick={() => setActiveTab('params')}
            />
          )}
          <Tab
            label="Tester"
            active={activeTab === 'test'}
            onClick={() => setActiveTab('test')}
          />
        </div>

        {activeTab === 'response' && (
          <pre className="code-block bg-gray-100 text-sm">{responseExample}</pre>
        )}
        {activeTab === 'request' && requestExample && (
          <pre className="code-block bg-gray-100 text-sm">{requestExample}</pre>
        )}
        {activeTab === 'params' && parameters && <div>{parameters}</div>}
        {activeTab === 'test' && (
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-gray-600">Fonctionnalité de test interactive à venir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
