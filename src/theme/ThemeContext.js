import React, { createContext, useContext, useState, useMemo } from 'react';
import { lightColors, darkColors } from './colors';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const theme = useMemo(() => ({
    colors: isDark ? darkColors : lightColors,
    isDark,
    toggleTheme: () => setIsDark(prev => !prev),
  }), [isDark]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
