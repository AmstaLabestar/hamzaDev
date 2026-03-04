import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes';

export type AppTheme = 'light' | 'dark' | 'neon';

const APP_THEMES: AppTheme[] = ['light', 'dark', 'neon'];
const APP_THEME_STORAGE_KEY = 'labestar-ui-theme';

interface ThemeContextValue {
  theme: AppTheme;
  themes: AppTheme[];
  isNeon: boolean;
  setAppTheme: (theme: AppTheme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isAppTheme(value: string | null | undefined): value is AppTheme {
  return value === 'light' || value === 'dark' || value === 'neon';
}

function ThemeContextStateProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme();
  const [appTheme, setAppThemeState] = useState<AppTheme>('light');

  const setAppTheme = useCallback(
    (nextTheme: AppTheme) => {
      window.localStorage.setItem(APP_THEME_STORAGE_KEY, nextTheme);
      setTheme(nextTheme);
      setAppThemeState(nextTheme);
    },
    [setTheme],
  );

  const cycleTheme = useCallback(() => {
    const currentIndex = APP_THEMES.indexOf(appTheme);
    const nextTheme = APP_THEMES[(currentIndex + 1) % APP_THEMES.length];
    setAppTheme(nextTheme);
  }, [appTheme, setAppTheme]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(APP_THEME_STORAGE_KEY);

    if (isAppTheme(storedTheme)) {
      setTheme(storedTheme);
      setAppThemeState(storedTheme);
      return;
    }

    if (isAppTheme(theme)) {
      setAppThemeState(theme);
      window.localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
    }
  }, [setTheme]);

  useEffect(() => {
    if (!isAppTheme(theme)) {
      return;
    }

    setAppThemeState(theme);
    window.localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const root = document.documentElement;
    root.classList.add('theme-transitioning');

    const timeoutId = window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
      root.classList.remove('theme-transitioning');
    };
  }, [appTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: appTheme,
      themes: APP_THEMES,
      isNeon: appTheme === 'neon',
      setAppTheme,
      cycleTheme,
    }),
    [appTheme, setAppTheme, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={APP_THEMES}
      storageKey={APP_THEME_STORAGE_KEY}
    >
      <ThemeContextStateProvider>{children}</ThemeContextStateProvider>
    </NextThemeProvider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}
