import { Link } from 'react-router';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const text = translations[language];

  const navLinks = [
    { name: text.navbar.home, href: '/' },
    { name: text.navbar.about, href: '#about' },
    { name: text.navbar.experiences, href: '#experiences' },
    { name: text.navbar.projects, href: '#projects' },
    { name: text.navbar.contact, href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
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

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

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
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  {text.navbar.lightMode}
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  {text.navbar.darkMode}
                </>
              )}
            </Button>
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
