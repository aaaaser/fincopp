import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'fincop_theme';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, setTheme, toggleTheme };
}
