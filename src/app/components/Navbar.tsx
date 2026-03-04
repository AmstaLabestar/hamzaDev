import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { memo, useMemo, useState } from 'react';
import { ThemeCycleButton } from './ui/ThemeCycleButton';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useActiveSection } from '@/app/hooks';
import { translations } from '@/app/lib/translations';
import { cn } from './ui/utils';

function NavbarImpl() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const text = translations[language];

  const navLinks = useMemo(
    () => [
      { name: text.navbar.home, href: '#home', sectionId: 'home' },
      { name: text.navbar.about, href: '#about', sectionId: 'about' },
      { name: text.navbar.experiences, href: '#experiences', sectionId: 'experiences' },
      { name: text.navbar.projects, href: '#projects', sectionId: 'projects' },
      { name: text.navbar.contact, href: '#contact', sectionId: 'contact' },
    ],
    [text],
  );
  const trackedSectionIds = useMemo(() => navLinks.map((link) => link.sectionId), [navLinks]);
  const activeSection = useActiveSection({
    sectionIds: trackedSectionIds,
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/60 backdrop-blur-xl theme-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Labestar
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                aria-current={activeSection === link.sectionId ? 'page' : undefined}
                className={cn(
                  'relative text-sm font-medium transition-colors',
                  activeSection === link.sectionId
                    ? 'text-primary glow-text'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.name}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-0.5 rounded-full bg-primary transition-all duration-300',
                    activeSection === link.sectionId ? 'w-full opacity-100' : 'w-0 opacity-0',
                  )}
                />
              </a>
            ))}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hidden md:flex"
              aria-label={text.navbar.switchLanguage}
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </Button>

            <ThemeCycleButton
              variant="ghost"
              size="icon"
              className="hidden md:flex glow-hover"
            />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/70 bg-background/80 backdrop-blur-xl theme-glass">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                aria-current={activeSection === link.sectionId ? 'page' : undefined}
                className={cn(
                  'block rounded-md border-l-2 py-2 pl-3 text-sm font-medium transition-colors',
                  activeSection === link.sectionId
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <ThemeCycleButton
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              labelPrefix={language === 'fr' ? 'Theme' : 'Theme'}
              onThemeChanged={() => setMobileMenuOpen(false)}
              showLabel
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
              aria-label={text.navbar.switchLanguage}
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export const Navbar = memo(NavbarImpl);
