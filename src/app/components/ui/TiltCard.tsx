import { useTiltEffect } from '@/app/hooks/useTiltEffect';
import { cn } from './utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  disabled?: boolean;
}

export function TiltCard({ children, className, maxTilt = 7, disabled = false }: TiltCardProps) {
  const { handleMouseMove, handleMouseLeave } = useTiltEffect({
    maxTilt,
    disabled,
  });

  return (
    <div
      className={cn('tilt-surface relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="tilt-content h-full">{children}</div>
    </div>
  );
}
