import { cn } from '@/app/components/ui/utils';

interface AdminSurfaceProps extends React.ComponentProps<'div'> {
  padded?: boolean;
}

export function AdminSurface({ className, children, padded = true, ...props }: AdminSurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-card/80 theme-glass shadow-[0_20px_48px_-34px_var(--glow-strong)]',
        padded ? 'p-5 sm:p-6' : '',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
