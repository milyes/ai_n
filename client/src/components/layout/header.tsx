import React from 'react';
import { useTheme } from '@/lib/context';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  const { toggleSidebar } = useTheme();
  
  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between p-4">
        <button 
          className="lg:hidden text-foreground"
          onClick={toggleSidebar}
        >
          <span className="material-icons">menu</span>
        </button>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <a href="#" className="flex items-center text-sm text-foreground hover:text-primary">
            <span className="material-icons mr-1">help</span>
            Aide
          </a>
          <a href="#" className="flex items-center text-sm text-foreground hover:text-primary">
            <span className="material-icons mr-1">code</span>
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
