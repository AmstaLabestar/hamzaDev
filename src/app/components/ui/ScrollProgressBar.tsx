import { useEffect, useState } from 'react';

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const maxScrollableHeight = scrollHeight - clientHeight;
      const nextProgress = maxScrollableHeight > 0 ? scrollTop / maxScrollableHeight : 0;

      setProgress(Math.min(1, Math.max(0, nextProgress)));
    };

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[70] h-[3px] w-full bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_24px_var(--glow-strong)] transition-[width] duration-150 ease-out"
        style={{ width: `${(progress * 100).toFixed(2)}%` }}
      />
    </div>
  );
}
