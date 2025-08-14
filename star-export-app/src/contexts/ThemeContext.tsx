import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  backgroundSolid: '#f1f5f9',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  primarySolid: '#6366f1',
  secondary: '#8b5cf6',
  text: {
    primary: '#1e293b',
    secondary: '#475569',
    muted: '#64748b',
    inverse: '#ffffff',
  },
  border: '#e2e8f0',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowLg: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const darkTheme = {
  background: 'linear-gradient(135deg, #1a1b23 0%, #2d1b69 100%)',
  backgroundSolid: '#0f172a',
  surface: '#1e293b',
  surfaceElevated: '#334155',
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  primarySolid: '#6366f1',
  secondary: '#8b5cf6',
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
    inverse: '#1e293b',
  },
  border: '#334155',
  accent: '#06b6d4',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  shadowLg: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};