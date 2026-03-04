import { useCallback, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { cn } from './utils';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  disabled?: boolean;
}

export function Magnetic({ children, className, strength = 16, disabled = false }: MagneticProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const frameRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || prefersReducedMotion) {
        return;
      }

      const target = event.currentTarget;
      const targetRect = target.getBoundingClientRect();
      const x = (event.clientX - targetRect.left) / targetRect.width - 0.5;
      const y = (event.clientY - targetRect.top) / targetRect.height - 0.5;
      const moveX = x * strength;
      const moveY = y * strength;

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        target.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
      });
    },
    [disabled, prefersReducedMotion, strength],
  );

  const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    target.style.transform = 'translate3d(0, 0, 0)';
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn('inline-flex will-change-transform transition-transform duration-200 ease-out', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
