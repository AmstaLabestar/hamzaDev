import { motion } from 'motion/react';
import { cn } from '../ui/utils';

export interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileBottomNavProps {
  items: MobileNavItem[];
  activeItemId: string;
}

export function MobileBottomNav({ items, activeItemId }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile section navigation"
      className="fixed inset-x-3 bottom-3 z-[80] rounded-2xl border border-border/70 theme-glass px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_14px_36px_-20px_var(--glow-strong)]"
    >
      <ul className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const isActive = activeItemId === item.id;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  'relative flex min-h-14 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <motion.span
                  animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-1"
                >
                  <item.icon className="h-4 w-4" />
                </motion.span>
                <span className="truncate">{item.label}</span>
                {isActive ? (
                  <motion.span
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-x-4 -top-0.5 h-0.5 rounded-full bg-primary"
                  />
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
