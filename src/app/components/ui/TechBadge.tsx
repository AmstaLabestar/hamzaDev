import { memo, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { usePrefersReducedMotion, useTiltEffect } from '@/app/hooks';
import type { TechStackItem } from '@/app/utils/tech-stack';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { cn } from './utils';

interface TechBadgeProps {
  tech: TechStackItem;
  className?: string;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<TechBadgeProps['size']>, string> = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

const iconSizeClasses: Record<NonNullable<TechBadgeProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

function TechBadgeImpl({ tech, className, delay = 0, size = 'md' }: TechBadgeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);
  const { handleMouseMove, handleMouseLeave } = useTiltEffect({
    maxTilt: 5,
    disabled: prefersReducedMotion,
  });

  const iconSrc = useMemo(
    () => `https://cdn.simpleicons.org/${tech.simpleIconSlug}/${tech.brandColor.replace('#', '')}`,
    [tech.brandColor, tech.simpleIconSlug],
  );

  const fallbackLabel = useMemo(() => {
    const short = tech.label === 'Tailwind CSS' ? 'TW' : tech.label;
    return short
      .split(' ')
      .map((segment) => segment[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  }, [tech.label]);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.92 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.28, delay }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.06, y: -1 }}
      className={cn('inline-flex', className)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            role="img"
            aria-label={tech.label}
            className={cn(
              'tilt-surface glow-hover relative inline-flex items-center justify-center rounded-xl border border-border/70 bg-card/75 theme-glass text-foreground shadow-[0_14px_34px_-24px_var(--glow-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
              sizeClasses[size],
            )}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <span className="tilt-content">
              {imageFailed ? (
                <span className="text-[10px] font-semibold tracking-wide">{fallbackLabel}</span>
              ) : (
                <img
                  src={iconSrc}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className={cn('select-none object-contain', iconSizeClasses[size])}
                  onError={() => setImageFailed(true)}
                />
              )}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8} className="border border-border/70 bg-card/95 text-card-foreground shadow-[0_14px_36px_-24px_var(--glow-strong)]">
          {tech.label}
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}

export const TechBadge = memo(TechBadgeImpl);
