import { useCallback, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface UseTiltEffectOptions {
  maxTilt?: number;
  disabled?: boolean;
}

export function useTiltEffect({ maxTilt = 7, disabled = false }: UseTiltEffectOptions = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const frameRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled || prefersReducedMotion) {
        return;
      }

      const target = event.currentTarget;
      const targetRect = target.getBoundingClientRect();
      const x = (event.clientX - targetRect.left) / targetRect.width;
      const y = (event.clientY - targetRect.top) / targetRect.height;
      const rotateX = (0.5 - y) * maxTilt * 2;
      const rotateY = (x - 0.5) * maxTilt * 2;

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        target.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        target.style.setProperty('--pointer-x', `${(x * 100).toFixed(2)}%`);
        target.style.setProperty('--pointer-y', `${(y * 100).toFixed(2)}%`);
      });
    },
    [disabled, maxTilt, prefersReducedMotion],
  );

  const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    target.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    target.style.setProperty('--pointer-x', '50%');
    target.style.setProperty('--pointer-y', '50%');
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return {
    handleMouseMove,
    handleMouseLeave,
  };
}
