import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessibilityState } from '../types';

const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<AccessibilityState['fontSize']>('normal');
  const [highContrast, setHighContrast] = useState(false);

  const toggleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  // Apply classes to body for global styling effects
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-base', 'text-lg', 'text-xl');
    
    if (fontSize === 'large') root.classList.add('text-lg');
    if (fontSize === 'xlarge') root.classList.add('text-xl');
    else root.classList.add('text-base');

    if (highContrast) {
      document.body.classList.add('bg-black', 'text-yellow-300');
      document.body.classList.remove('bg-gray-50', 'text-gray-900');
    } else {
      document.body.classList.remove('bg-black', 'text-yellow-300');
      document.body.classList.add('bg-gray-50', 'text-gray-900');
    }
  }, [fontSize, highContrast]);

  return (
    <AccessibilityContext.Provider value={{ fontSize, highContrast, toggleFontSize, toggleHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};