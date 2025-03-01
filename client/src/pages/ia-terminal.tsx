/**
 * Page Terminal IA Linux-like
 * Une interface en ligne de commande style Linux pour gérer les fonctions d'IA
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MascotAnimation } from '@/components/mascot/mascot-animation';
import { useToast } from '@/hooks/use-toast';

type TerminalMode = 'default' | 'sudo' | 'ai' | 'network' | 'filesystem';
type TerminalTheme = 'ubuntu' | 'debian' | 'arch' | 'fedora';
type CommandHistoryItem = {
  id: string;
  text: string;
  timestamp: Date;
};

interface CommandOutput {
  id: string;
  type: 'command' | 'output' | 'error' | 'info' | 'success' | 'warning';
  content: React.ReactNode;
  timestamp: Date;
}

export default function IATerminal() {
  const [input, setInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [output, setOutput] = useState<CommandOutput[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string>('/home/admin');
  const [currentUser, setCurrentUser] = useState<string>('admin');
  const [currentMode, setCurrentMode] = useState<TerminalMode>('default');
  const [showMascot, setShowMascot] = useState<boolean>(true);
  const [terminalTheme, setTerminalTheme] = useState<TerminalTheme>('ubuntu');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [sudoPassword, setSudoPassword] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [processRunning, setProcessRunning] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Commandes disponibles
  const baseCommands = [
    'help', 'clear', 'ls', 'cd', 'pwd', 'echo', 'date', 
    'whoami', 'history', 'exit', 'sudo', 'apt', 'cat', 
    'touch', 'mkdir', 'rm', 'man', 'grep'
  ];
  
  const aiCommands = [
    'ai-status', 'ai-sentiment', 'ai-summarize', 'ai-scan',
    'ai-origin', 'ai-predict', 'ai-diagnose', 'ai-train'
  ];
  
  const securityCommands = [
    'access', 'scan-ports', 'enum-users', 'check-auth',
    'test-fingerprint', 'monitor', 'logs', 'audit'
  ];
  
  // Mock Filesystem
  const filesystem = {
    '/home/admin': ['documents', 'config', 'logs', '.bashrc', 'README.md'],
    '/home/admin/documents': ['rapport_ia.txt', 'maintenance.pdf', 'stats.csv'],
    '/home/admin/config': ['ai_config.json', 'services.yml', 'users.conf'],
    '/home/admin/logs': ['system.log', 'access.log', 'error.log'],
    '/etc': ['passwd', 'shadow', 'hosts', 'services', 'network'],
    '/var/log': ['auth.log', 'daemon.log', 'kern.log', 'syslog'],
    '/opt/ai': ['models', 'data', 'config', 'services'],
    '/opt/ai/models': ['sentiment.bin', 'summary.h5', 'recognition.weights'],
    '/opt/ai/config': ['ai_settings.json', 'origins.conf', 'permissions.acl'],
  };
  
  // Contenu des fichiers
  const fileContents = {
    '/home/admin/README.md': `# Terminal IA - Guide d'utilisation
    
Ce terminal simule un environnement Linux avec des commandes IA intégrées.

## Commandes de base
- Les commandes Linux standard: ls, cd, pwd, echo, etc.
- Utilisez \`help\` pour voir toutes les commandes disponibles

## Commandes IA spéciales
- \`ai-status\`: affiche l'état du système IA
- \`ai-sentiment\`: analyse le sentiment d'un texte
- \`ai-summarize\`: résume un texte
- \`ai-origin\`: gère les origines IA (OpenAI, Local, xAI)

## Commandes Sécurité
- \`access\`: gère les autorisations d'accès
- \`test-fingerprint\`: teste une empreinte digitale
- \`logs\`: affiche les journaux d'accès

Contactez votre administrateur pour plus d'informations.`,

    '/home/admin/config/ai_config.json': `{
  "origins": {
    "default": "auto",
    "available": ["openai", "local", "xai"]
  },
  "services": {
    "sentiment": {
      "enabled": true,
      "threshold": 0.75,
      "model": "advanced-sentiment-v2"
    },
    "summarization": {
      "enabled": true,
      "ratio": 0.3,
      "model": "summary-gpt4-v1"
    },
    "recommendations": {
      "enabled": true,
      "categories": ["security", "network", "monitoring"]
    }
  },
  "security": {
    "api_keys_encrypted": true,
    "request_logs": true,
    "rate_limit": 100,
    "ip_whitelist": ["192.168.1.0/24"]
  }
}`,

    '/home/admin/documents/rapport_ia.txt': `RAPPORT D'ÉTAT DU SYSTÈME IA
Date: ${new Date().toLocaleDateString()}

RÉSUMÉ EXÉCUTIF
Le système IA fonctionne à 97% de capacité optimale avec un temps de réponse moyen de 120ms.

MODULES ACTIFS
- Analyse de sentiment: 99.2% précision
- Résumé automatique: 96.5% précision
- Porte automatique: 99.8% fiabilité
- Reconnaissance visuelle: 94.3% précision

INCIDENTS RÉCENTS
2 tentatives d'accès non autorisées détectées et bloquées.
1 alerte de performance sur le module de reconnaissance visuelle.

RECOMMANDATIONS
1. Mettre à jour le module de reconnaissance visuelle
2. Augmenter la capacité de stockage des journaux
3. Entraîner le modèle avec de nouvelles données

Rapport généré automatiquement par le système.`,
  };

  useEffect(() => {
    // Définir le prompt en fonction du mode
    const getPrompt = () => {
      const basePrompt = `${currentUser}@${getHostFromTheme()}:${currentDirectory}$`;
      if (currentMode === 'sudo') return `root@${getHostFromTheme()}:${currentDirectory}#`;
      if (currentMode === 'ai') return `${basePrompt} [AI]`;
      return basePrompt;
    };
    
    setCurrentPrompt(getPrompt());
  }, [currentUser, currentDirectory, currentMode, terminalTheme]);
  
  // Focus sur l'input quand le composant est monté
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Messages de bienvenue
    setOutput([
      {
        id: '1',
        type: 'info',
        content: getWelcomeHeader(),
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'info',
        content: 'Bienvenue au terminal IA. Tapez "help" pour voir la liste des commandes disponibles.',
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'output',
        content: 'Dernière connexion: ' + new Date().toLocaleString(),
        timestamp: new Date()
      }
    ]);
    
    // Événement pour refocaliser l'input quand on clique sur le terminal
    const handleTerminalClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    if (terminalRef.current) {
      terminalRef.current.addEventListener('click', handleTerminalClick);
    }
    
    return () => {
      if (terminalRef.current) {
        terminalRef.current.removeEventListener('click', handleTerminalClick);
      }
    };
  }, [terminalTheme]);
  
  // Fonction pour obtenir le nom d'hôte basé sur le thème
  const getHostFromTheme = (): string => {
    switch (terminalTheme) {
      case 'ubuntu': return 'ubuntu-ia';
      case 'debian': return 'debian-ia';
      case 'arch': return 'archlinux';
      case 'fedora': return 'fedora-ia';
      default: return 'linux-ia';
    }
  };
  
  // Fonction pour le message d'accueil
  const getWelcomeHeader = (): React.ReactNode => {
    const logoStyle = {
      fontFamily: 'monospace',
      whiteSpace: 'pre' as 'pre',
      color: terminalTheme === 'ubuntu' ? '#E95420' : 
             terminalTheme === 'debian' ? '#A80030' :
             terminalTheme === 'arch' ? '#1793D1' : '#294172',
    };
    
    let logo = '';
    if (terminalTheme === 'ubuntu') {
      logo = `
░█░█░█▀▄░█░█░█▀█░▀█▀░█░█░░░█▀█░▀█▀
░█░█░█▀▄░█░█░█░█░░█░░█░█░░░█▀█░░█░
░▀▀▀░▀▀░░▀▀▀░▀▀▀░░▀░░▀▀▀░░░▀░▀░░▀░`;
    } else if (terminalTheme === 'debian') {
      logo = `
░█▀▄░█▀▀░█▀▄░▀█▀░█▀█░█▀█░░░█▀█░▀█▀
░█░█░█▀▀░█▀▄░░█░░█▀█░█░█░░░█▀█░░█░
░▀▀░░▀▀▀░▀▀░░░▀░░▀░▀░▀░▀░░░▀░▀░░▀░`;
    } else if (terminalTheme === 'arch') {
      logo = `
░█▀█░█▀▄░█▀▀░█░█░░░█▀█░▀█▀
░█▀█░█▀▄░█░░░█▀█░░░█▀█░░█░
░▀░▀░▀░▀░▀▀▀░▀░▀░░░▀░▀░░▀░`;
    } else {
      logo = `
░█▀▀░█▀▀░█▀▄░█▀█░█▀▄░█▀█░░░█▀█░▀█▀
░█▀▀░█▀▀░█░█░█░█░█▀▄░█▀█░░░█▀█░░█░
░▀░░░▀▀▀░▀▀░░▀▀▀░▀░▀░▀░▀░░░▀░▀░░▀░`;
    }
    
    return (
      <div>
        <pre style={logoStyle}>{logo}</pre>
        <div className="text-xs mt-1 mb-2">
          <p>Terminal Linux pour l'Intelligence Artificielle - v1.0</p>
          <p>{getHostFromTheme()} {terminalTheme.charAt(0).toUpperCase() + terminalTheme.slice(1)} 5.15.0-1019-ia</p>
        </div>
      </div>
    );
  };
  
  // Gère la soumission des commandes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const commandText = input.trim();
    setInput('');
    
    // Traitement spécial si nous sommes en attente d'un mot de passe sudo
    if (sudoPassword === 'asking') {
      // Ne pas afficher le mot de passe dans l'historique ou l'output
      if (commandText === '1776') {
        setSudoPassword('1776');
        setCurrentMode('sudo');
        addOutput('Mode sudo activé. Utilisez "exit" pour revenir au mode normal.', 'success');
      } else {
        addOutput('sudo: mot de passe incorrect', 'error');
        setSudoPassword(null);
      }
      return;
    }
    
    // Traitement normal des commandes
    const newCommandItem: CommandHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: commandText,
      timestamp: new Date()
    };
    
    setCommandHistory(prev => [...prev, newCommandItem]);
    
    // Ajouter la commande à l'output
    const commandOutput: CommandOutput = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'command',
      content: <span><span className="text-green-400">{currentPrompt}</span> {commandText}</span>,
      timestamp: new Date()
    };
    
    setOutput(prev => [...prev, commandOutput]);
    
    // Exécuter la commande
    await executeCommand(commandText);
  };
  
  // Fonction pour exécuter les commandes
  const executeCommand = async (command: string) => {
    const parts = command.split(' ');
    const mainCommand = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Simuler un délai de traitement
    setProcessRunning(true);
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    setProcessRunning(false);
    
    // Vérifier mode sudo
    if (currentMode === 'sudo' && mainCommand !== 'exit') {
      if (['apt', 'systemctl', 'service', 'chmod', 'chown'].includes(mainCommand)) {
        executeSudoCommand(mainCommand, args);
        return;
      }
    }
    
    // Commandes de base
    switch (mainCommand) {
      case 'help':
        displayHelp();
        break;
      case 'clear':
        clearTerminal();
        break;
      case 'ls':
        listDirectory(args[0]);
        break;
      case 'cd':
        changeDirectory(args[0]);
        break;
      case 'pwd':
        printWorkingDirectory();
        break;
      case 'whoami':
        whoami();
        break;
      case 'echo':
        echo(args.join(' '));
        break;
      case 'date':
        showDate();
        break;
      case 'history':
        showHistory();
        break;
      case 'sudo':
        handleSudo(args);
        break;
      case 'apt':
        handleApt(args);
        break;
      case 'cat':
        catFile(args[0]);
        break;
      case 'grep':
        grepFile(args);
        break;
      case 'exit':
        handleExit();
        break;
      case 'theme':
        changeTheme(args[0] as TerminalTheme);
        break;
        
      // Commandes IA
      case 'ai-status':
        aiStatus();
        break;
      case 'ai-sentiment':
        aiSentiment(args.join(' '));
        break;
      case 'ai-summarize':
        aiSummarize(args.join(' '));
        break;
      case 'ai-scan':
        aiScan(args[0]);
        break;
      case 'ai-origin':
        aiOrigin(args[0]);
        break;
        
      // Commandes sécurité
      case 'access':
        accessControl(args);
        break;
      case 'test-fingerprint':
        testFingerprint(args[0]);
        break;
      case 'logs':
        viewLogs(args[0]);
        break;
        
      default:
        if (aiCommands.includes(mainCommand)) {
          addOutput('Cette commande IA est en cours de développement.', 'info');
        } else if (securityCommands.includes(mainCommand)) {
          addOutput('Cette commande de sécurité est en cours de développement.', 'info');
        } else if (baseCommands.includes(mainCommand)) {
          addOutput('Cette commande est reconnue mais n\'est pas encore implémentée.', 'info');
        } else {
          addOutput(`${mainCommand}: commande introuvable`, 'error');
        }
    }
  };
  
  // Commandes du système
  
  const displayHelp = () => {
    addOutput(
      <div className="space-y-2">
        <div>
          <h3 className="text-yellow-500 font-bold">Commandes Linux classiques :</h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 ml-2">
            {baseCommands.map(cmd => (
              <div key={cmd} className="text-gray-300">{cmd}</div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-blue-400 font-bold">Commandes IA :</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-2">
            {aiCommands.map(cmd => (
              <div key={cmd} className="text-gray-300">{cmd}</div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-green-400 font-bold">Commandes Sécurité :</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-2">
            {securityCommands.map(cmd => (
              <div key={cmd} className="text-gray-300">{cmd}</div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-purple-400 font-bold">Commandes supplémentaires :</h3>
          <div className="ml-2">
            <div><span className="text-gray-300">theme</span> - Changer le thème du terminal (ubuntu, debian, arch, fedora)</div>
          </div>
        </div>
      </div>,
      'info'
    );
  };
  
  const clearTerminal = () => {
    setOutput([]);
  };
  
  const listDirectory = (path?: string) => {
    const targetPath = path 
      ? path.startsWith('/') 
        ? path 
        : `${currentDirectory}/${path}`.replace(/\/+/g, '/')
      : currentDirectory;
      
    const normalizedPath = targetPath.replace(/\/+/g, '/');
    
    if (filesystem[normalizedPath]) {
      // Formater la sortie de ls en colonnes
      const files = filesystem[normalizedPath];
      const directories = files.filter(f => !f.includes('.')).map(d => `<span class="text-blue-400">${d}/</span>`);
      const regularFiles = files.filter(f => f.includes('.')).map(f => {
        if (f.startsWith('.')) {
          return `<span class="text-gray-500">${f}</span>`;
        } else if (f.endsWith('.md') || f.endsWith('.txt')) {
          return `<span class="text-green-300">${f}</span>`;
        } else if (f.endsWith('.json') || f.endsWith('.yml') || f.endsWith('.conf')) {
          return `<span class="text-yellow-300">${f}</span>`;
        } else if (f.endsWith('.log')) {
          return `<span class="text-red-300">${f}</span>`;
        } else {
          return f;
        }
      });
      
      const allItems = [...directories, ...regularFiles];
      
      if (allItems.length === 0) {
        addOutput('Répertoire vide', 'output');
      } else {
        // Créer une grille HTML pour les fichiers
        const html = `<div class="grid grid-cols-4 gap-x-4 gap-y-1">
          ${allItems.map(item => `<div>${item}</div>`).join('')}
        </div>`;
        
        addOutput(<div dangerouslySetInnerHTML={{ __html: html }} />, 'output');
      }
    } else {
      addOutput(`ls: impossible d'accéder à '${normalizedPath}': Aucun fichier ou dossier de ce type`, 'error');
    }
  };
  
  const changeDirectory = (path?: string) => {
    if (!path || path === '~') {
      setCurrentDirectory('/home/admin');
      return;
    }
    
    let newPath;
    if (path.startsWith('/')) {
      newPath = path;
    } else if (path === '..') {
      const parts = currentDirectory.split('/').filter(Boolean);
      parts.pop();
      newPath = parts.length === 0 ? '/' : `/${parts.join('/')}`;
    } else if (path === '.') {
      newPath = currentDirectory;
    } else {
      newPath = `${currentDirectory}/${path}`.replace(/\/+/g, '/');
    }
    
    // Nettoyage du chemin
    newPath = newPath.replace(/\/+/g, '/');
    if (newPath !== '/' && newPath.endsWith('/')) {
      newPath = newPath.slice(0, -1);
    }
    
    // Vérifier si le répertoire existe dans notre filesystem
    const dirParts = newPath.split('/').filter(Boolean);
    let checkPath = '';
    let valid = true;
    
    for (let i = 0; i < dirParts.length; i++) {
      const part = dirParts[i];
      const parentPath = checkPath || '/';
      
      if (filesystem[parentPath] && filesystem[parentPath].includes(part)) {
        // Vérifier si c'est un fichier (contient un point)
        if (part.includes('.')) {
          addOutput(`cd: ${part}: N'est pas un répertoire`, 'error');
          valid = false;
          break;
        }
        
        // Construire le chemin pour la vérification suivante
        checkPath = `${parentPath}${part}/`.replace(/\/+/g, '/');
      } else {
        addOutput(`cd: ${path}: Aucun fichier ou dossier de ce type`, 'error');
        valid = false;
        break;
      }
    }
    
    if (valid) {
      setCurrentDirectory(newPath);
    }
  };
  
  const printWorkingDirectory = () => {
    addOutput(currentDirectory, 'output');
  };
  
  const whoami = () => {
    addOutput(currentUser, 'output');
  };
  
  const echo = (text: string) => {
    // Vérifier pour les variables d'environnement
    const envVarRegex = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
    let processedText = text;
    
    // Liste des variables d'environnement simulées
    const env = {
      USER: currentUser,
      HOME: '/home/admin',
      PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      SHELL: '/bin/bash',
      LANG: 'fr_FR.UTF-8',
      PWD: currentDirectory,
      AI_MODE: currentMode,
      HOSTNAME: getHostFromTheme(),
      TERM: 'xterm-256color'
    };
    
    processedText = processedText.replace(envVarRegex, (match, p1) => {
      return env[p1 as keyof typeof env] || '';
    });
    
    addOutput(processedText, 'output');
  };
  
  const showDate = () => {
    addOutput(new Date().toString(), 'output');
  };
  
  const showHistory = () => {
    if (commandHistory.length === 0) {
      addOutput('Pas d\'historique de commandes', 'info');
      return;
    }
    
    const historyOutput = (
      <div>
        {commandHistory.map((item, index) => (
          <div key={item.id} className="text-gray-300">
            <span className="text-yellow-500 mr-2">{index + 1}</span>
            {item.text}
          </div>
        ))}
      </div>
    );
    
    addOutput(historyOutput, 'output');
  };
  
  const handleSudo = (args: string[]) => {
    if (args.length === 0) {
      addOutput('sudo: une commande est attendue', 'error');
      return;
    }
    
    if (currentMode === 'sudo') {
      addOutput('Vous êtes déjà en mode sudo', 'info');
      return;
    }
    
    if (sudoPassword === '1776') {
      // Mot de passe déjà validé précédemment
      setCurrentMode('sudo');
      addOutput('Mode sudo activé. Utilisez "exit" pour revenir au mode normal.', 'success');
      // Exécuter la commande spécifiée après sudo
      executeCommand(args.join(' '));
    } else {
      // Simuler une demande de mot de passe
      addOutput('Mot de passe :', 'output');
      setSudoPassword('asking');
      
      // Le mot de passe sera collecté dans la prochaine entrée et traité 
      // par la fonction handleSubmit qui détectera le mode "asking"
    }
  };
  
  const handleExit = () => {
    if (currentMode === 'sudo') {
      setCurrentMode('default');
      addOutput('Sortie du mode sudo', 'info');
    } else {
      addOutput('Aucun processus à terminer', 'info');
    }
  };
  
  const handleApt = (args: string[]) => {
    if (args.length === 0) {
      addOutput('apt: aucune opération spécifiée', 'error');
      return;
    }
    
    const subcommand = args[0];
    const packages = args.slice(1);
    
    if (currentMode !== 'sudo' && ['install', 'remove', 'purge', 'upgrade'].includes(subcommand)) {
      addOutput('E: Impossible d\'acquérir le verrou. Êtes-vous root ?', 'error');
      return;
    }
    
    switch (subcommand) {
      case 'update':
        addOutput('Lecture des listes de paquets... Fait', 'output');
        break;
      case 'upgrade':
        addOutput('Calcul de la mise à niveau... Fait', 'output');
        addOutput('0 mis à jour, 0 nouvellement installés, 0 à enlever et 0 non mis à jour.', 'success');
        break;
      case 'install':
        if (packages.length === 0) {
          addOutput('Veuillez spécifier un ou plusieurs paquets à installer', 'error');
        } else {
          addOutput(`Installation de : ${packages.join(', ')}`, 'info');
          addOutput('Lecture des listes de paquets... Fait', 'output');
          addOutput('Construction de l\'arbre des dépendances... Fait', 'output');
          addOutput(`Les paquets supplémentaires suivants seront installés : ${packages.map(() => 'lib' + Math.random().toString(36).substring(7)).join(' ')}`, 'output');
          addOutput('Paquets suggérés : python3-dev build-essential', 'output');
          addOutput(`${packages.length} mis à jour, ${packages.length} nouvellement installés, 0 à enlever et 0 non mis à jour.`, 'success');
        }
        break;
      case 'search':
        if (packages.length === 0) {
          addOutput('Veuillez spécifier un terme de recherche', 'error');
        } else {
          const searchTerm = packages[0];
          if (searchTerm.includes('ai') || searchTerm.includes('ml')) {
            addOutput('python3-tensorflow - Deep Learning library', 'output');
            addOutput('python3-sklearn - Machine Learning library', 'output');
            addOutput('python3-nltk - Natural Language Toolkit', 'output');
          } else {
            addOutput('Aucun paquet trouvé correspondant à votre recherche', 'info');
          }
        }
        break;
      default:
        addOutput(`apt: sous-commande '${subcommand}' non reconnue`, 'error');
    }
  };
  
  const catFile = (path?: string) => {
    if (!path) {
      addOutput('cat: opérande de fichier manquant', 'error');
      return;
    }
    
    const fullPath = path.startsWith('/') 
      ? path 
      : `${currentDirectory}/${path}`.replace(/\/+/g, '/');
    
    // Vérifier si le fichier existe
    const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/')) || '/';
    const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
    
    if (filesystem[parentDir] && filesystem[parentDir].includes(fileName)) {
      if (fileContents[fullPath]) {
        // Mettre en forme selon le type de fichier
        if (fullPath.endsWith('.json')) {
          try {
            const jsonContent = JSON.parse(fileContents[fullPath]);
            addOutput(<pre className="text-yellow-200">{JSON.stringify(jsonContent, null, 2)}</pre>, 'output');
          } catch (e) {
            addOutput(fileContents[fullPath], 'output');
          }
        } else if (fullPath.endsWith('.md')) {
          addOutput(<div className="markdown text-blue-200">{fileContents[fullPath]}</div>, 'output');
        } else {
          addOutput(fileContents[fullPath], 'output');
        }
      } else {
        // Contenu par défaut pour les fichiers qui n'ont pas de contenu spécifique
        addOutput(`Contenu simulé pour le fichier '${fileName}'`, 'output');
      }
    } else {
      addOutput(`cat: ${path}: Aucun fichier ou dossier de ce type`, 'error');
    }
  };
  
  const grepFile = (args: string[]) => {
    if (args.length < 2) {
      addOutput('Usage: grep [OPTION]... PATTERN [FILE]...', 'error');
      return;
    }
    
    const pattern = args[0];
    const filepath = args[1];
    
    const fullPath = filepath.startsWith('/') 
      ? filepath 
      : `${currentDirectory}/${filepath}`.replace(/\/+/g, '/');
    
    // Vérifier si le fichier existe
    const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/')) || '/';
    const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
    
    if (filesystem[parentDir] && filesystem[parentDir].includes(fileName)) {
      if (fileContents[fullPath]) {
        const content = fileContents[fullPath];
        const lines = content.split('\n');
        const matches = lines.filter(line => line.includes(pattern));
        
        if (matches.length > 0) {
          const highlightedMatches = matches.map(line => {
            const highlighted = line.replace(
              new RegExp(pattern, 'g'), 
              `<span class="bg-yellow-500 text-black">${pattern}</span>`
            );
            return `<div>${highlighted}</div>`;
          }).join('');
          
          addOutput(
            <div dangerouslySetInnerHTML={{ __html: highlightedMatches }} />, 
            'output'
          );
        } else {
          addOutput(`Aucune correspondance trouvée pour '${pattern}'`, 'info');
        }
      } else {
        addOutput(`Contenu simulé pour le fichier '${fileName}' - aucune correspondance`, 'info');
      }
    } else {
      addOutput(`grep: ${filepath}: Aucun fichier ou dossier de ce type`, 'error');
    }
  };
  
  const changeTheme = (theme?: TerminalTheme) => {
    if (!theme || !['ubuntu', 'debian', 'arch', 'fedora'].includes(theme)) {
      addOutput('Thèmes disponibles: ubuntu, debian, arch, fedora', 'info');
      return;
    }
    
    setTerminalTheme(theme as TerminalTheme);
    addOutput(`Thème changé pour ${theme}`, 'success');
    
    // Ajouter l'en-tête du nouveau thème
    setOutput(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'info',
        content: getWelcomeHeader(),
        timestamp: new Date()
      }
    ]);
  };
  
  // Commandes IA spécifiques
  
  const aiStatus = () => {
    addOutput(
      <div className="space-y-2">
        <div className="flex items-center">
          <Badge className="bg-green-600 text-white mr-2">ACTIF</Badge>
          <span className="text-green-400 font-bold">Système IA opérationnel</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-blue-400 font-bold">Services</h3>
            <div className="ml-2 space-y-1">
              <div className="flex justify-between">
                <span>Analyse de sentiment</span>
                <Badge variant="outline" className="text-green-400">Actif</Badge>
              </div>
              <div className="flex justify-between">
                <span>Génération de résumé</span>
                <Badge variant="outline" className="text-green-400">Actif</Badge>
              </div>
              <div className="flex justify-between">
                <span>Recommandations</span>
                <Badge variant="outline" className="text-green-400">Actif</Badge>
              </div>
              <div className="flex justify-between">
                <span>Reconnaissance d'image</span>
                <Badge variant="outline" className="text-yellow-400">Partiel</Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-yellow-400 font-bold">Statistiques</h3>
            <div className="ml-2 space-y-1">
              <div className="flex justify-between">
                <span>Temps de réponse</span>
                <span className="text-green-400">124ms</span>
              </div>
              <div className="flex justify-between">
                <span>Précision</span>
                <span className="text-green-400">97.5%</span>
              </div>
              <div className="flex justify-between">
                <span>Requêtes (24h)</span>
                <span className="text-blue-400">543</span>
              </div>
              <div className="flex justify-between">
                <span>Mémoire utilisée</span>
                <span className="text-yellow-400">78%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-purple-400 font-bold">Origine IA actuelle</h3>
          <div className="ml-2">
            <span className="text-white bg-blue-800 px-1 rounded">auto</span>
            <span className="ml-2 text-gray-400">Sélection automatique du meilleur service</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 italic mt-2">
          Utilisez la commande <span className="text-white not-italic">ai-origin [openai|local|xai|auto]</span> pour changer l'origine.
        </div>
      </div>,
      'info'
    );
  };
  
  const aiSentiment = (text: string) => {
    if (!text) {
      addOutput('Usage: ai-sentiment [texte à analyser]', 'error');
      return;
    }
    
    // Simuler un appel à l'API
    addOutput('Analyse du sentiment en cours...', 'info');
    
    setTimeout(() => {
      // Analyser de façon simple la polarité du texte
      const positiveWords = ['bon', 'excellent', 'génial', 'super', 'heureux', 'content', 'satisfait', 'réussi', 'aime', 'positif'];
      const negativeWords = ['mauvais', 'terrible', 'horrible', 'décevant', 'triste', 'fâché', 'insatisfait', 'échoué', 'déteste', 'négatif'];
      
      let positiveScore = 0;
      let negativeScore = 0;
      
      const words = text.toLowerCase().split(/\s+/);
      
      words.forEach(word => {
        if (positiveWords.some(pw => word.includes(pw))) positiveScore++;
        if (negativeWords.some(nw => word.includes(nw))) negativeScore++;
      });
      
      const totalScore = positiveScore - negativeScore;
      let sentiment;
      let color;
      
      if (totalScore > 2) {
        sentiment = 'Très positif';
        color = 'bg-green-600';
      } else if (totalScore > 0) {
        sentiment = 'Positif';
        color = 'bg-green-400';
      } else if (totalScore === 0) {
        sentiment = 'Neutre';
        color = 'bg-blue-400';
      } else if (totalScore > -3) {
        sentiment = 'Négatif';
        color = 'bg-orange-400';
      } else {
        sentiment = 'Très négatif';
        color = 'bg-red-600';
      }
      
      const confidence = Math.min(0.95, Math.max(0.6, 0.75 + (Math.abs(totalScore) * 0.05)));
      
      addOutput(
        <div className="space-y-2">
          <div className="font-bold">Résultat de l'analyse :</div>
          <div className="flex items-center gap-2">
            <Badge className={`${color} text-white`}>{sentiment}</Badge>
            <span className="text-gray-400">Confiance: {(confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="text-sm mt-1">
            <div className="text-gray-400">Texte analysé :</div>
            <div className="text-gray-300 italic">"{text}"</div>
          </div>
        </div>,
        'output'
      );
    }, 1500);
  };
  
  const aiSummarize = (text: string) => {
    if (!text) {
      addOutput('Usage: ai-summarize [texte à résumer]', 'error');
      return;
    }
    
    if (text.length < 50) {
      addOutput('Le texte est trop court pour être résumé. Veuillez fournir un texte plus long.', 'error');
      return;
    }
    
    // Simuler un appel à l'API
    addOutput('Génération du résumé en cours...', 'info');
    
    setTimeout(() => {
      // Créer un résumé simple
      const words = text.split(/\s+/);
      const firstSentence = text.split('.')[0] + '.';
      
      let summary;
      if (words.length > 20) {
        // Prendre les premiers 20% des mots et y ajouter la première phrase
        const extractedWords = words.slice(0, Math.ceil(words.length * 0.2));
        summary = extractedWords.join(' ') + ' [...]';
        
        if (summary.length < 30) {
          summary = firstSentence;
        }
      } else {
        summary = firstSentence;
      }
      
      addOutput(
        <div className="space-y-2">
          <div className="font-bold">Résumé généré :</div>
          <div className="p-2 bg-gray-800 rounded text-gray-200">{summary}</div>
          <div className="text-xs text-gray-500">Résumé à partir de {words.length} mots • Taux de compression: {((1 - summary.length / text.length) * 100).toFixed(0)}%</div>
        </div>,
        'output'
      );
    }, 2000);
  };
  
  const aiScan = (target?: string) => {
    if (!target) {
      addOutput('Usage: ai-scan [réseau|système|vulnérabilités]', 'error');
      return;
    }
    
    const allowedTargets = ['réseau', 'reseau', 'système', 'systeme', 'vulnerabilité', 'vulnerabilite', 'vulnérabilités', 'vulnerabilites'];
    
    if (!allowedTargets.includes(target.toLowerCase())) {
      addOutput(`Cible d'analyse non reconnue: ${target}. Utilisez: réseau, système, ou vulnérabilités.`, 'error');
      return;
    }
    
    // Simuler une analyse
    addOutput(`Analyse ${target} en cours...`, 'info');
    
    setTimeout(() => {
      if (target.toLowerCase().includes('réseau') || target.toLowerCase().includes('reseau')) {
        addOutput(
          <div className="space-y-3">
            <div className="font-bold text-green-400">Analyse réseau terminée</div>
            
            <div>
              <div className="text-yellow-400 font-medium">Appareils détectés : 8</div>
              <div className="ml-2 grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                <div><span className="text-blue-400">192.168.1.1</span> - Routeur principal</div>
                <div><span className="text-blue-400">192.168.1.2</span> - Serveur IA</div>
                <div><span className="text-blue-400">192.168.1.15</span> - Poste Admin</div>
                <div><span className="text-blue-400">192.168.1.27</span> - Scanner biométrique</div>
                <div><span className="text-blue-400">192.168.1.34</span> - Camera #1</div>
                <div><span className="text-blue-400">192.168.1.35</span> - Camera #2</div>
                <div><span className="text-blue-400">192.168.1.40</span> - Système de contrôle</div>
                <div><span className="text-blue-400">192.168.1.50</span> - Tablette sécurité</div>
              </div>
            </div>
            
            <div>
              <div className="text-yellow-400 font-medium">Services actifs : 5</div>
              <div className="ml-2 mt-1">
                <div><span className="text-green-400">●</span> SSH - Port 22 - Sécurisé</div>
                <div><span className="text-green-400">●</span> API IA - Port 5000 - Sécurisé</div>
                <div><span className="text-green-400">●</span> HTTP - Port 80 - Redirection HTTPS</div>
                <div><span className="text-green-400">●</span> HTTPS - Port 443 - Sécurisé</div>
                <div><span className="text-yellow-400">●</span> FTP - Port 21 - Non chiffré</div>
              </div>
            </div>
            
            <div>
              <div className="text-yellow-400 font-medium">Recommandations :</div>
              <div className="ml-2 mt-1">
                <div><span className="text-red-400">!</span> Désactiver le service FTP non sécurisé</div>
                <div><span className="text-yellow-400">!</span> Mettre à jour le firmware du routeur (version actuelle: 3.12.4)</div>
              </div>
            </div>
          </div>,
          'output'
        );
      } else if (target.toLowerCase().includes('système') || target.toLowerCase().includes('systeme')) {
        addOutput(
          <div className="space-y-3">
            <div className="font-bold text-green-400">Analyse système terminée</div>
            
            <div>
              <div className="text-yellow-400 font-medium">Ressources système :</div>
              <div className="ml-2 mt-1">
                <div>CPU: <span className="text-green-400">23%</span> utilisation</div>
                <div>Mémoire: <span className="text-yellow-400">76%</span> utilisée (3.8 GB / 5 GB)</div>
                <div>Disque: <span className="text-green-400">42%</span> utilisé (84 GB / 200 GB)</div>
                <div>Services actifs: <span className="text-blue-400">18</span> services</div>
              </div>
            </div>
            
            <div>
              <div className="text-yellow-400 font-medium">État des modèles IA :</div>
              <div className="ml-2 grid grid-cols-1 gap-y-1 mt-1">
                <div>Analyse de sentiment: <span className="text-green-400">Opérationnel</span> (v2.4.1)</div>
                <div>Résumé automatique: <span className="text-green-400">Opérationnel</span> (v1.8.5)</div>
                <div>Recommandations: <span className="text-green-400">Opérationnel</span> (v3.0.2)</div>
                <div>Analyse d'image: <span className="text-yellow-400">Limité</span> (v0.9.2-beta)</div>
              </div>
            </div>
            
            <div>
              <div className="text-yellow-400 font-medium">Mises à jour requises :</div>
              <div className="ml-2 mt-1">
                <div><span className="text-blue-400">→</span> openai-client: v2.0.4 → v2.1.0</div>
                <div><span className="text-blue-400">→</span> tensorflow: v2.12.0 → v2.13.0</div>
                <div><span className="text-blue-400">→</span> security-scanner: v1.5.2 → v1.6.0</div>
              </div>
            </div>
          </div>,
          'output'
        );
      } else {
        // vulnérabilités
        addOutput(
          <div className="space-y-3">
            <div className="font-bold text-green-400">Analyse de vulnérabilités terminée</div>
            
            <div>
              <div className="text-yellow-400 font-medium">Résumé :</div>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div className="bg-red-900/30 border border-red-800 rounded p-2 text-center">
                  <div className="text-2xl font-bold text-red-400">1</div>
                  <div className="text-xs text-gray-300">Critique</div>
                </div>
                <div className="bg-orange-900/30 border border-orange-800 rounded p-2 text-center">
                  <div className="text-2xl font-bold text-orange-400">2</div>
                  <div className="text-xs text-gray-300">Élevée</div>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-800 rounded p-2 text-center">
                  <div className="text-2xl font-bold text-yellow-400">4</div>
                  <div className="text-xs text-gray-300">Moyenne</div>
                </div>
                <div className="bg-blue-900/30 border border-blue-800 rounded p-2 text-center">
                  <div className="text-2xl font-bold text-blue-400">7</div>
                  <div className="text-xs text-gray-300">Faible</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-red-400 font-medium">Vulnérabilités critiques :</div>
              <div className="ml-2 mt-1 p-2 bg-red-950/30 border border-red-900 rounded">
                <div className="font-bold">CVE-2023-9876 - Service FTP non sécurisé</div>
                <div className="text-sm text-gray-300 mt-1">
                  Le service FTP sur le port 21 utilise une authentification non chiffrée, 
                  exposant potentiellement les identifiants administratifs.
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Solution recommandée : Désactiver le service FTP ou migrer vers SFTP (port 22).
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-orange-400 font-medium">Vulnérabilités élevées :</div>
              <div className="ml-2 mt-1">
                <div>Version PHP obsolète (7.2.24) sur le serveur Web</div>
                <div>Clés API stockées en clair dans config.php</div>
              </div>
            </div>
          </div>,
          'output'
        );
      }
    }, 3000);
  };
  
  const aiOrigin = (origin?: string) => {
    if (!origin) {
      addOutput(
        <div>
          <div>Origine IA actuelle : <span className="text-blue-400 font-bold">auto</span></div>
          <div className="text-sm text-gray-400 mt-1">
            Origines disponibles : <span className="text-gray-300">openai</span>, <span className="text-gray-300">local</span>, <span className="text-gray-300">xai</span>, <span className="text-gray-300">auto</span>
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Utilisez <span className="text-white">ai-origin [origine]</span> pour changer l'origine IA.
          </div>
        </div>,
        'info'
      );
      return;
    }
    
    const allowedOrigins = ['openai', 'local', 'xai', 'auto'];
    
    if (!allowedOrigins.includes(origin.toLowerCase())) {
      addOutput(`Origine IA non reconnue: ${origin}. Valeurs autorisées: openai, local, xai, auto.`, 'error');
      return;
    }
    
    // Simuler un changement d'origine
    addOutput(`Modification de l'origine IA pour: ${origin}`, 'info');
    
    setTimeout(() => {
      addOutput(
        <div>
          <div className="text-green-400 font-bold">Origine IA changée avec succès</div>
          <div className="mt-1">
            Nouvelle origine : <span className="text-blue-400 font-bold">{origin}</span>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {origin === 'auto' ? 
              "Le système va automatiquement sélectionner la meilleure origine pour chaque requête." :
              origin === 'local' ?
              "Utilisation des modèles locaux (performances réduites mais pas de coût API)." :
              origin === 'openai' ?
              "Utilisation des API OpenAI (GPT-4o, meilleure performance)." :
              "Utilisation des API xAI (Grok, bonne performance et grand contexte)."}
          </div>
        </div>,
        'success'
      );
    }, 1000);
  };
  
  // Commandes sudo
  
  const executeSudoCommand = (command: string, args: string[]) => {
    if (command === 'apt') {
      handleApt(args);
    } else if (command === 'systemctl') {
      handleSystemctl(args);
    } else {
      addOutput(`Commande sudo '${command}' non implémentée`, 'info');
    }
  };
  
  const handleSystemctl = (args: string[]) => {
    if (args.length < 2) {
      addOutput('Usage: systemctl [start|stop|restart|status] SERVICE', 'error');
      return;
    }
    
    const action = args[0];
    const service = args[1];
    
    const allowedActions = ['start', 'stop', 'restart', 'status', 'enable', 'disable'];
    
    if (!allowedActions.includes(action)) {
      addOutput(`Action systemctl non reconnue: ${action}`, 'error');
      return;
    }
    
    const services = ['ai-service', 'nginx', 'postgresql', 'ssh', 'fingerprint-auth'];
    
    if (!services.includes(service)) {
      addOutput(`Service '${service}' introuvable`, 'error');
      return;
    }
    
    switch (action) {
      case 'status':
        if (service === 'ai-service') {
          addOutput(
            <div>
              <div>● ai-service.service - Service d'Intelligence Artificielle</div>
              <div className="ml-4">Loaded: loaded (/etc/systemd/system/ai-service.service; enabled; vendor preset: enabled)</div>
              <div className="ml-4">Active: <span className="text-green-400">active (running)</span> depuis Jeu 2023-06-15 09:23:45 CEST; 2 days ago</div>
              <div className="ml-4">Main PID: 1234 (ai-service)</div>
              <div className="ml-4">Tasks: 24</div>
              <div className="ml-4">Memory: 768.5M</div>
              <div className="ml-4">CPU: 12.4%</div>
              <div className="ml-4">CGroup: /system.slice/ai-service.service</div>
              <div className="ml-8">└─1234 /usr/bin/ai-service --config /etc/ai/config.yml</div>
            </div>,
            'output'
          );
        } else {
          addOutput(`● ${service}.service - ${service.charAt(0).toUpperCase() + service.slice(1)} Service\n   Active: active (running)`, 'output');
        }
        break;
      case 'start':
        addOutput(`Démarrage du service ${service}...`, 'info');
        setTimeout(() => {
          addOutput(`Service ${service} démarré avec succès.`, 'success');
        }, 1000);
        break;
      case 'stop':
        addOutput(`Arrêt du service ${service}...`, 'info');
        setTimeout(() => {
          addOutput(`Service ${service} arrêté avec succès.`, 'success');
        }, 1000);
        break;
      case 'restart':
        addOutput(`Redémarrage du service ${service}...`, 'info');
        setTimeout(() => {
          addOutput(`Service ${service} redémarré avec succès.`, 'success');
        }, 2000);
        break;
      default:
        addOutput(`Action ${action} exécutée sur le service ${service}.`, 'output');
    }
  };
  
  // Commandes de sécurité
  
  const accessControl = (args: string[]) => {
    if (args.length === 0) {
      addOutput('Usage: access [list|grant|revoke|check] [options]', 'error');
      return;
    }
    
    const action = args[0];
    
    switch (action) {
      case 'list':
        addOutput(
          <div className="space-y-2">
            <div className="font-bold text-blue-400">Liste des accès configurés :</div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="p-1">ID</th>
                  <th className="p-1">Utilisateur</th>
                  <th className="p-1">Niveau</th>
                  <th className="p-1">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1">001</td>
                  <td className="p-1">admin</td>
                  <td className="p-1">Administrateur</td>
                  <td className="p-1"><span className="text-green-400">●</span> Actif</td>
                </tr>
                <tr>
                  <td className="p-1">002</td>
                  <td className="p-1">technicien</td>
                  <td className="p-1">Maintenance</td>
                  <td className="p-1"><span className="text-green-400">●</span> Actif</td>
                </tr>
                <tr>
                  <td className="p-1">003</td>
                  <td className="p-1">reception</td>
                  <td className="p-1">Basique</td>
                  <td className="p-1"><span className="text-green-400">●</span> Actif</td>
                </tr>
                <tr>
                  <td className="p-1">004</td>
                  <td className="p-1">stagiaire</td>
                  <td className="p-1">Lecture</td>
                  <td className="p-1"><span className="text-yellow-400">●</span> Limité</td>
                </tr>
                <tr>
                  <td className="p-1">005</td>
                  <td className="p-1">ancien_employe</td>
                  <td className="p-1">-</td>
                  <td className="p-1"><span className="text-red-400">●</span> Révoqué</td>
                </tr>
              </tbody>
            </table>
          </div>,
          'output'
        );
        break;
      case 'grant':
        if (args.length < 3) {
          addOutput('Usage: access grant [utilisateur] [niveau]', 'error');
          return;
        }
        
        const grantUser = args[1];
        const grantLevel = args[2];
        
        addOutput(`Attribution du niveau d'accès '${grantLevel}' à l'utilisateur '${grantUser}'...`, 'info');
        setTimeout(() => {
          addOutput(`Accès '${grantLevel}' attribué avec succès à '${grantUser}'.`, 'success');
        }, 1000);
        break;
      case 'revoke':
        if (args.length < 2) {
          addOutput('Usage: access revoke [utilisateur]', 'error');
          return;
        }
        
        const revokeUser = args[1];
        
        addOutput(`Révocation de tous les accès pour l'utilisateur '${revokeUser}'...`, 'info');
        setTimeout(() => {
          addOutput(`Accès révoqués avec succès pour '${revokeUser}'.`, 'success');
        }, 1000);
        break;
      case 'check':
        if (args.length < 2) {
          addOutput('Usage: access check [utilisateur]', 'error');
          return;
        }
        
        const checkUser = args[1];
        
        if (checkUser === 'admin') {
          addOutput(
            <div>
              <div className="font-bold">Informations d'accès pour: <span className="text-blue-400">admin</span></div>
              <div className="ml-2 mt-1">
                <div>Niveau: <span className="text-purple-400">Administrateur</span></div>
                <div>Statut: <span className="text-green-400">Actif</span></div>
                <div>Dernière connexion: {new Date().toLocaleString()}</div>
                <div>Empreinte enregistrée: <span className="text-green-400">Oui</span></div>
                <div className="mt-1">Droits:</div>
                <div className="ml-2">
                  <div>- Gestion des utilisateurs</div>
                  <div>- Configuration système</div>
                  <div>- Accès aux logs</div>
                  <div>- Gestion des modèles IA</div>
                </div>
              </div>
            </div>,
            'output'
          );
        } else if (['technicien', 'reception', 'stagiaire'].includes(checkUser)) {
          const levels = {
            technicien: 'Maintenance',
            reception: 'Basique',
            stagiaire: 'Lecture'
          };
          addOutput(`Utilisateur '${checkUser}' a le niveau d'accès '${levels[checkUser as keyof typeof levels]}'.`, 'output');
        } else {
          addOutput(`Aucun utilisateur trouvé avec le nom '${checkUser}'.`, 'error');
        }
        break;
      default:
        addOutput(`Action '${action}' non reconnue. Utilisez list, grant, revoke ou check.`, 'error');
    }
  };
  
  const testFingerprint = (hash?: string) => {
    if (!hash) {
      addOutput('Usage: test-fingerprint [hash]', 'error');
      return;
    }
    
    addOutput('Analyse de l\'empreinte digitale...', 'info');
    
    setTimeout(() => {
      const fingerprintData = [
        { hash: 'ab12cd34', user: 'admin', access: 'Administrateur', result: 'Autorisé' },
        { hash: 'ef56gh78', user: 'technicien', access: 'Maintenance', result: 'Autorisé' },
        { hash: 'ij90kl12', user: 'reception', access: 'Basique', result: 'Autorisé' },
        { hash: 'mn34op56', user: 'stagiaire', access: 'Lecture', result: 'Limité' },
        { hash: 'qr78st90', user: 'ancien_employe', access: '-', result: 'Refusé' },
      ];
      
      const fingerprint = fingerprintData.find(f => f.hash === hash);
      
      if (fingerprint) {
        const resultColor = 
          fingerprint.result === 'Autorisé' ? 'text-green-400' :
          fingerprint.result === 'Limité' ? 'text-yellow-400' : 'text-red-400';
        
        addOutput(
          <div>
            <div className="font-bold">Résultat de l'analyse d'empreinte:</div>
            <div className="ml-2 mt-1">
              <div>Hash: <span className="text-blue-400">{fingerprint.hash}</span></div>
              <div>Utilisateur: <span className="text-yellow-400">{fingerprint.user}</span></div>
              <div>Niveau d'accès: <span className="text-purple-400">{fingerprint.access}</span></div>
              <div>Résultat: <span className={resultColor}>{fingerprint.result}</span></div>
            </div>
          </div>,
          'output'
        );
      } else {
        addOutput(
          <div>
            <div className="font-bold text-red-400">Empreinte non reconnue</div>
            <div className="mt-1">Aucune correspondance trouvée pour le hash: <span className="text-blue-400">{hash}</span></div>
            <div className="text-sm text-gray-400 mt-1">
              Cette empreinte n'est associée à aucun utilisateur dans le système.
            </div>
          </div>,
          'error'
        );
      }
    }, 1500);
  };
  
  const viewLogs = (type?: string) => {
    if (!type) {
      addOutput(
        <div>
          <div>Usage: logs [type]</div>
          <div className="text-sm text-gray-400 mt-1">
            Types disponibles: accès, système, erreur, tous
          </div>
        </div>,
        'info'
      );
      return;
    }
    
    addOutput(`Chargement des logs de type '${type}'...`, 'info');
    
    setTimeout(() => {
      const formattedLogs = [
        { timestamp: '2023-06-14 08:23:45', type: 'accès', message: 'Utilisateur admin authentifié avec succès', level: 'info' },
        { timestamp: '2023-06-14 08:45:12', type: 'système', message: 'Service AI redémarré', level: 'info' },
        { timestamp: '2023-06-14 09:12:34', type: 'erreur', message: 'Échec de connexion: empreinte non reconnue', level: 'error' },
        { timestamp: '2023-06-14 10:05:22', type: 'accès', message: 'Utilisateur technicien authentifié avec succès', level: 'info' },
        { timestamp: '2023-06-14 11:30:40', type: 'système', message: 'Mise à jour des modèles IA terminée', level: 'info' },
        { timestamp: '2023-06-14 12:15:18', type: 'accès', message: 'Tentative d\'accès non autorisée depuis 192.168.1.105', level: 'warning' },
        { timestamp: '2023-06-14 13:20:55', type: 'erreur', message: 'Exception dans le module d\'analyse: out of memory', level: 'error' },
        { timestamp: '2023-06-14 14:45:30', type: 'système', message: 'Sauvegarde automatique terminée', level: 'info' },
        { timestamp: '2023-06-14 15:10:12', type: 'accès', message: 'Utilisateur reception authentifié avec succès', level: 'info' },
        { timestamp: '2023-06-14 16:30:00', type: 'erreur', message: 'Timeout lors de l\'appel à l\'API OpenAI', level: 'warning' },
      ];
      
      let filteredLogs = formattedLogs;
      
      if (type !== 'tous') {
        filteredLogs = formattedLogs.filter(log => {
          if (type === 'accès' || type === 'acces') return log.type === 'accès';
          if (type === 'système' || type === 'systeme') return log.type === 'système';
          if (type === 'erreur') return log.type === 'erreur';
          return false;
        });
      }
      
      if (filteredLogs.length === 0) {
        addOutput(`Aucun log trouvé pour le type '${type}'.`, 'info');
        return;
      }
      
      addOutput(
        <div>
          <div className="font-bold mb-2">Logs ({filteredLogs.length} entrées)</div>
          <div className="space-y-1">
            {filteredLogs.map((log, index) => (
              <div key={index} className="flex">
                <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                <span className={`mr-2 ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warning' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {log.level === 'error' ? '✗' : log.level === 'warning' ? '⚠' : '✓'}
                </span>
                <span className="text-blue-400 mr-2">[{log.type}]</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>,
        'output'
      );
    }, 1000);
  };
  
  // Fonction utilitaire pour ajouter un output
  const addOutput = (content: React.ReactNode, type: CommandOutput['type'] = 'output') => {
    const newOutput: CommandOutput = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date()
    };
    
    setOutput(prev => [...prev, newOutput]);
    
    // Scroll vers le bas après l'ajout
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };
  
  // Styles pour l'output
  const getOutputStyle = (type: CommandOutput['type']) => {
    switch (type) {
      case 'command':
        return 'text-white';
      case 'output':
        return 'text-gray-300';
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };
  
  // Obtenir la classe de l'arrière-plan du terminal selon le thème
  const getTerminalThemeClass = () => {
    switch (terminalTheme) {
      case 'ubuntu':
        return 'bg-[#2d0922]'; // Ubuntu purple
      case 'debian':
        return 'bg-[#0a0a2a]'; // Debian blue
      case 'arch':
        return 'bg-[#0a1a2a]'; // Arch darker blue
      case 'fedora':
        return 'bg-[#0f1a2b]'; // Fedora dark blue
      default:
        return 'bg-black';
    }
  };
  
  return (
    <div className={`min-h-screen ${getTerminalThemeClass()} text-gray-200 p-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          <div className={`${isFullScreen ? "w-full" : "w-full md:w-3/4"}`}>
            <Card className={`${getTerminalThemeClass()} border-gray-700 h-[80vh] overflow-hidden flex flex-col`}>
              <CardContent className="p-0 flex-grow flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-gray-700 px-3 py-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-400">
                    {currentUser}@{getHostFromTheme()}: {currentDirectory}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400"
                      onClick={() => setIsFullScreen(!isFullScreen)}
                    >
                      <span className="material-icons text-base">
                        {isFullScreen ? 'fullscreen_exit' : 'fullscreen'}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-grow p-3 font-mono text-sm" ref={terminalRef}>
                  {output.map((item) => (
                    <div key={item.id} className={`mb-1 ${getOutputStyle(item.type)}`}>
                      {item.content}
                    </div>
                  ))}
                  
                  {/* Input de commande active */}
                  <form onSubmit={handleSubmit} className="mt-1 flex items-center">
                    <span className="text-green-400 mr-1">{currentPrompt}</span>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className={`flex-grow bg-transparent outline-none ${
                        sudoPassword === 'asking' ? 'text-transparent' : ''
                      }`}
                      placeholder={processRunning ? "Traitement en cours..." : ""}
                      disabled={processRunning}
                      ref={inputRef}
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                    {sudoPassword === 'asking' && (
                      <span className="text-yellow-500 absolute">
                        {'*'.repeat(input.length)}
                      </span>
                    )}
                  </form>
                  
                  {/* Indicateur de traitement */}
                  {processRunning && (
                    <div className="text-blue-400 text-sm animate-pulse mt-1">
                      Traitement en cours...
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-400">
                Terminal IA Linux v1.0 • {terminalTheme.charAt(0).toUpperCase() + terminalTheme.slice(1)} Theme
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Mode sombre</span>
                  <Switch 
                    checked={terminalTheme !== 'light'} 
                    onCheckedChange={(checked) => setTerminalTheme(checked ? 'ubuntu' : 'light')}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Mascotte</span>
                  <Switch 
                    checked={showMascot} 
                    onCheckedChange={setShowMascot}
                  />
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => changeTheme('ubuntu')}
                  >
                    Ubuntu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => changeTheme('debian')}
                  >
                    Debian
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => changeTheme('arch')}
                  >
                    Arch
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => changeTheme('fedora')}
                  >
                    Fedora
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {!isFullScreen && (
            <div className="w-full md:w-1/4 space-y-4">
              {showMascot && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <MascotAnimation
                    state={processRunning ? "working" : currentMode === 'sudo' ? "excited" : "idle"}
                    size="sm"
                    message={
                      processRunning ? "Traitement en cours..." :
                      currentMode === 'sudo' ? "Mode superutilisateur actif!" :
                      "Comment puis-je vous aider?"
                    }
                  />
                </div>
              )}
              
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-3">Aide rapide</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-yellow-400 font-medium">Navigation</div>
                      <div className="ml-2 text-gray-300">
                        <div>cd [dossier] - Changer de répertoire</div>
                        <div>ls - Lister les fichiers</div>
                        <div>pwd - Afficher le répertoire actuel</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-blue-400 font-medium">Commandes IA</div>
                      <div className="ml-2 text-gray-300">
                        <div>ai-status - État du système IA</div>
                        <div>ai-sentiment [texte] - Analyser sentiment</div>
                        <div>ai-origin - Gérer les origines IA</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-green-400 font-medium">Commandes utiles</div>
                      <div className="ml-2 text-gray-300">
                        <div>clear - Effacer l'écran</div>
                        <div>sudo [commande] - Mode superutilisateur</div>
                        <div>help - Afficher l'aide complète</div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={() => {
                          setInput('help');
                          handleSubmit(new Event('submit') as any);
                        }} 
                        variant="outline" 
                        className="w-full">
                        Afficher toutes les commandes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-2">Statut système</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center text-sm">
                        <span>CPU</span>
                        <span className="text-gray-400">23%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-700 rounded-full mt-1">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Mémoire</span>
                        <span className="text-gray-400">76%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-700 rounded-full mt-1">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '76%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Réseau</span>
                        <span className="text-gray-400">12 Mbps</span>
                      </div>
                      <div className="h-2 w-full bg-gray-700 rounded-full mt-1">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    
                    <div className="pt-1">
                      <div className="text-xs text-gray-500">
                        Utilisateur actuel: <span className="text-gray-300">{currentUser}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Mode: <span className={
                          currentMode === 'sudo' ? "text-red-400" : "text-gray-300"
                        }>{currentMode}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Distribution: <span className="text-gray-300">
                          {terminalTheme === 'ubuntu' ? 'Ubuntu 22.04 LTS' :
                          terminalTheme === 'debian' ? 'Debian 12 (Bookworm)' :
                          terminalTheme === 'arch' ? 'Arch Linux' :
                          'Fedora 38'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}