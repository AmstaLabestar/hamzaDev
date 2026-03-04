import { Moon, Sparkles, Sun } from 'lucide-react';
import { useAppTheme, type AppTheme } from '@/app/context/ThemeContext';
import { Button } from './button';

function ThemeIcon({ theme }: { theme: AppTheme }) {
  if (theme === 'light') {
    return <Sun className="h-4 w-4" />;
  }

  if (theme === 'dark') {
    return <Moon className="h-4 w-4" />;
  }

  return <Sparkles className="h-4 w-4" />;
}

interface ThemeCycleButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  showLabel?: boolean;
  labelPrefix?: string;
  onThemeChanged?: () => void;
}

const THEME_LABELS: Record<AppTheme, string> = {
  light: 'Light',
  dark: 'Dark',
  neon: 'Neon',
};

export function ThemeCycleButton({
  showLabel = false,
  labelPrefix = 'Theme',
  onThemeChanged,
  ...buttonProps
}: ThemeCycleButtonProps) {
  const { theme, cycleTheme, themes } = useAppTheme();
  const currentIndex = themes.indexOf(theme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  const handleClick = () => {
    cycleTheme();
    onThemeChanged?.();
  };

  return (
    <Button
      aria-label={`Switch theme. Current ${theme}. Next ${nextTheme}.`}
      title={`Current theme: ${THEME_LABELS[theme]}`}
      onClick={handleClick}
      {...buttonProps}
    >
      <ThemeIcon theme={theme} />
      {showLabel ? `${labelPrefix}: ${THEME_LABELS[theme]}` : null}
    </Button>
  );
}
