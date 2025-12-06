import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessibilityState } from '../types';

const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<AccessibilityState['fontSize']>('normal');

  const toggleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  // Apply classes to body for global styling effects
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-base', 'text-lg', 'text-xl');

    if (fontSize === 'large') root.classList.add('text-lg');
    if (fontSize === 'xlarge') root.classList.add('text-xl');
    else root.classList.add('text-base');

    document.body.classList.add('bg-gray-50', 'text-gray-900');
  }, [fontSize]);

  return (
    <AccessibilityContext.Provider value={{ fontSize, toggleFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};