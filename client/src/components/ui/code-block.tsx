import React from 'react';

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
}

export function CodeBlock({ children, language = 'json' }: CodeBlockProps) {
  return (
    <pre className="font-mono text-sm bg-gray-100 p-4 rounded-md overflow-x-auto my-4">
      <code className={`language-${language}`}>{children}</code>
    </pre>
  );
}
