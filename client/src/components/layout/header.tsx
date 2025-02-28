import React from 'react';
import { useTheme } from '@/lib/context';

export function Header() {
  const { toggleTheme, toggleSidebar } = useTheme();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <button 
          className="lg:hidden text-gray-500"
          onClick={toggleSidebar}
        >
          <span className="material-icons">menu</span>
        </button>
        <div className="flex items-center space-x-4">
          <button 
            className="flex items-center text-sm text-gray-700 hover:text-primary"
            onClick={toggleTheme}
          >
            <span className="material-icons mr-1">dark_mode</span>
            Mode sombre
          </button>
          <a href="#" className="flex items-center text-sm text-gray-700 hover:text-primary">
            <span className="material-icons mr-1">help</span>
            Aide
          </a>
          <a href="#" className="flex items-center text-sm text-gray-700 hover:text-primary">
            <span className="material-icons mr-1">code</span>
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
