import { motion } from 'motion/react';
import { cn } from '@/app/components/ui/utils';

interface AdminStatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  iconContainerClassName?: string;
  delay?: number;
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  iconContainerClassName,
  delay = 0,
}: AdminStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl border border-border/70 bg-card/80 p-5 theme-glass glow-hover"
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/50',
            iconContainerClassName,
          )}
        >
          <Icon className={cn('h-5 w-5 text-primary', iconClassName)} />
        </div>
      </div>
      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold leading-tight break-words">{value}</p>
    </motion.div>
  );
}
