// Enhanced Keyboard Shortcuts with Visual Feedback

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

export interface KeyboardShortcutManager {
  register: (shortcut: KeyboardShortcut) => void;
  unregister: (key: string) => void;
  handleKeyDown: (e: KeyboardEvent) => boolean;
  getShortcuts: () => KeyboardShortcut[];
  showHelp: () => void;
}

/**
 * Create a keyboard shortcut manager
 */
export const createKeyboardShortcutManager = (): KeyboardShortcutManager => {
  const shortcuts: Map<string, KeyboardShortcut> = new Map();
  
  const getKeyString = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.alt) parts.push('alt');
    if (shortcut.meta) parts.push('meta');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  };
  
  const register = (shortcut: KeyboardShortcut) => {
    const key = getKeyString(shortcut);
    shortcuts.set(key, shortcut);
  };
  
  const unregister = (key: string) => {
    shortcuts.delete(key.toLowerCase());
  };
  
  const handleKeyDown = (e: KeyboardEvent): boolean => {
    const parts: string[] = [];
    if (e.ctrlKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    if (e.metaKey) parts.push('meta');
    parts.push(e.key.toLowerCase());
    
    const key = parts.join('+');
    const shortcut = shortcuts.get(key);
    
    if (shortcut) {
      e.preventDefault();
      e.stopPropagation();
      
      // Visual feedback
      showShortcutFeedback(shortcut);
      
      // Execute action
      shortcut.action();
      return true;
    }
    
    return false;
  };
  
  const getShortcuts = (): KeyboardShortcut[] => {
    return Array.from(shortcuts.values());
  };
  
  const showHelp = () => {
    // This would show a help modal with all shortcuts
    console.log('Keyboard Shortcuts:', getShortcuts());
  };
  
  return {
    register,
    unregister,
    handleKeyDown,
    getShortcuts,
    showHelp,
  };
};

/**
 * Show visual feedback for keyboard shortcut
 */
const showShortcutFeedback = (shortcut: KeyboardShortcut) => {
  // Create a temporary toast/notification
  const feedback = document.createElement('div');
  feedback.className = 'fixed top-20 right-4 z-50 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse';
  feedback.textContent = shortcut.description;
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 300);
  }, 1000);
};

/**
 * Default PDF editor shortcuts
 */
export const defaultShortcuts: KeyboardShortcut[] = [
  {
    key: 't',
    action: () => {},
    description: 'Add Text',
    category: 'Tools',
  },
  {
    key: 'e',
    action: () => {},
    description: 'Edit Text',
    category: 'Tools',
  },
  {
    key: 'h',
    action: () => {},
    description: 'Highlight',
    category: 'Tools',
  },
  {
    key: 'd',
    action: () => {},
    description: 'Draw',
    category: 'Tools',
  },
  {
    key: 'ArrowLeft',
    action: () => {},
    description: 'Previous Page',
    category: 'Navigation',
  },
  {
    key: 'ArrowRight',
    action: () => {},
    description: 'Next Page',
    category: 'Navigation',
  },
  {
    key: 'Home',
    action: () => {},
    description: 'First Page',
    category: 'Navigation',
  },
  {
    key: 'End',
    action: () => {},
    description: 'Last Page',
    category: 'Navigation',
  },
  {
    key: 'f',
    ctrl: true,
    action: () => {},
    description: 'Find',
    category: 'Search',
  },
  {
    key: 's',
    ctrl: true,
    action: () => {},
    description: 'Save',
    category: 'File',
  },
  {
    key: 'z',
    ctrl: true,
    action: () => {},
    description: 'Undo',
    category: 'Edit',
  },
  {
    key: 'y',
    ctrl: true,
    action: () => {},
    description: 'Redo',
    category: 'Edit',
  },
  {
    key: 'a',
    ctrl: true,
    action: () => {},
    description: 'Select All',
    category: 'Edit',
  },
  {
    key: 'Delete',
    action: () => {},
    description: 'Delete Selected',
    category: 'Edit',
  },
  {
    key: 'Escape',
    action: () => {},
    description: 'Cancel/Deselect',
    category: 'General',
  },
  {
    key: '?',
    action: () => {},
    description: 'Show Help',
    category: 'General',
  },
];

