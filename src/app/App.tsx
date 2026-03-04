import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { ResourceHints } from './components/ui/ResourceHints';
import { StartupSplash } from './components/ui/StartupSplash';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppThemeProvider } from './context/ThemeContext';
import { router } from './routes';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const cleanupFns: Array<() => void> = [];
    const timerIds: number[] = [];

    const wait = (durationMs: number) =>
      new Promise<void>((resolve) => {
        const timerId = window.setTimeout(resolve, durationMs);
        timerIds.push(timerId);
      });

    const waitForWindowLoad = () =>
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
          return;
        }

        const handleLoad = () => resolve();
        window.addEventListener('load', handleLoad, { once: true });
        cleanupFns.push(() => window.removeEventListener('load', handleLoad));
      });

    const waitForFonts = async () => {
      if (!('fonts' in document)) {
        return;
      }

      try {
        await document.fonts.ready;
      } catch {
        // Ignore font loading errors and keep boot flow resilient.
      }
    };

    void (async () => {
      const minDurationPromise = wait(1050);
      const resourcesReadyPromise = Promise.all([waitForWindowLoad(), waitForFonts()]);
      const safetyTimeoutPromise = wait(3600);

      await Promise.all([
        minDurationPromise,
        Promise.race([resourcesReadyPromise, safetyTimeoutPromise]),
      ]);

      if (isMounted) {
        setShowSplash(false);
      }
    })();

    return () => {
      isMounted = false;
      cleanupFns.forEach((cleanup) => cleanup());
      timerIds.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <AppThemeProvider>
      <ResourceHints />
      <LanguageProvider>
        <AuthProvider>
          <RouterProvider router={router} fallbackElement={<div className="min-h-screen theme-page bg-background" />} />
          <Toaster position="top-right" />
          <AnimatePresence>{showSplash ? <StartupSplash key="startup-splash" /> : null}</AnimatePresence>
        </AuthProvider>
      </LanguageProvider>
    </AppThemeProvider>
  );
}
