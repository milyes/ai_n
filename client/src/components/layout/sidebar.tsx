import React from 'react';
import { Link } from 'wouter';
import { useTheme } from '@/lib/context';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  children?: {
    id: string;
    label: string;
    href: string;
  }[];
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: 'home',
    href: '/'
  },
  {
    id: 'ai',
    label: 'Module IA',
    icon: 'psychology',
    href: '/ai'
  },
  {
    id: 'ia-central',
    label: 'IA Activex Central',
    icon: 'smart_toy',
    href: '/ia-central'
  },
  {
    id: 'help',
    label: 'Aide Contextuelle',
    icon: 'help_center',
    href: '/help'
  },
  {
    id: 'endpoints',
    label: 'API & Services',
    icon: 'api',
    href: '#endpoints',
    children: [
      { id: 'endpoints-users', label: 'Utilisateurs', href: '/#endpoints-users' },
      { id: 'endpoints-products', label: 'Produits', href: '/#endpoints-products' },
      { id: 'endpoints-orders', label: 'Commandes', href: '/#endpoints-orders' }
    ]
  },
  {
    id: 'health',
    label: 'Santé',
    icon: 'health_and_safety',
    href: '/ia-central#health'
  },
  {
    id: 'security',
    label: 'Cybersécurité',
    icon: 'security',
    href: '/ia-central#security'
  },
  {
    id: 'validation',
    label: 'Validation',
    icon: 'check_circle',
    href: '/#validation'
  },
  {
    id: 'error-handling',
    label: 'Gestion des erreurs',
    icon: 'error',
    href: '/#error-handling'
  },
  {
    id: 'testing',
    label: 'Tests',
    icon: 'science',
    href: '/#testing'
  },
  {
    id: 'configuration',
    label: 'Configuration',
    icon: 'settings',
    href: '/#configuration'
  },
  {
    id: 'deployment',
    label: 'Déploiement',
    icon: 'cloud_upload',
    href: '/#deployment'
  }
];

export function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useTheme();
  const [activeSection, setActiveSection] = React.useState('home');
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({
    endpoints: true
  });

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <aside 
        className={`fixed z-50 lg:relative w-64 h-full bg-white shadow-lg transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-medium text-primary">API Documentation</h1>
          <button className="lg:hidden text-gray-500" onClick={closeSidebar}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <nav className="py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                {item.children ? (
                  <>
                    <div 
                      className="flex items-center justify-between px-6 py-3 text-gray-800 hover:bg-gray-100 cursor-pointer"
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-center">
                        <span className="material-icons mr-3 text-primary">{item.icon}</span>
                        {item.label}
                      </div>
                      <span className="material-icons">
                        {expandedItems[item.id] ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                    {expandedItems[item.id] && (
                      <ul className="ml-12 border-l border-gray-200">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <a 
                              href={child.href}
                              className={`block px-4 py-2 text-gray-700 hover:text-primary ${
                                activeSection === child.id ? 'text-primary font-medium' : ''
                              }`}
                              onClick={() => handleNavClick(child.id)}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  item.href.startsWith('/') ? (
                    <Link
                      href={item.href}
                      className={`flex items-center px-6 py-3 text-gray-800 hover:bg-gray-100 ${
                        activeSection === item.id ? 'sidebar-active' : ''
                      }`}
                      onClick={() => handleNavClick(item.id)}
                    >
                      <span className="material-icons mr-3 text-primary">{item.icon}</span>
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className={`flex items-center px-6 py-3 text-gray-800 hover:bg-gray-100 ${
                        activeSection === item.id ? 'sidebar-active' : ''
                      }`}
                      onClick={() => handleNavClick(item.id)}
                    >
                      <span className="material-icons mr-3 text-primary">{item.icon}</span>
                      {item.label}
                    </a>
                  )
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
