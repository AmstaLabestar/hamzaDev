import { BrainCircuit, Briefcase, House, Languages, Mail, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { ThemeCycleButton } from '../ui/ThemeCycleButton';
import { MobileBottomNav, type MobileNavItem } from './MobileBottomNav';
import { MobileContact } from './MobileContact';
import { MobileExperience } from './MobileExperience';
import { MobileHero } from './MobileHero';
import { MobileProjects } from './MobileProjects';
import { MobileSkills } from './MobileSkills';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useActiveSection } from '@/app/hooks';
import { translations } from '@/app/lib/translations';

export function MobileLayout() {
  const { language, toggleLanguage } = useLanguage();
  const text = translations[language];

  const navItems: MobileNavItem[] = [
    { id: 'home', label: text.navbar.home, icon: House },
    { id: 'projects', label: text.navbar.projects, icon: Sparkles },
    { id: 'experiences', label: text.navbar.experiences, icon: Briefcase },
    { id: 'skills', label: language === 'fr' ? 'Skills' : 'Skills', icon: BrainCircuit },
    { id: 'contact', label: text.navbar.contact, icon: Mail },
  ];

  const activeSection = useActiveSection({
    sectionIds: navItems.map((item) => item.id),
    rootMargin: '-42% 0px -50% 0px',
    threshold: [0.16, 0.36, 0.62],
  });

  return (
    <div className="min-h-screen bg-background pb-24 pt-[calc(4.25rem+env(safe-area-inset-top))] theme-page">
      <header className="fixed inset-x-0 top-0 z-[75] border-b border-border/70 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] theme-glass">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80"></p>
            <p className="text-base font-semibold">Labestar</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-10 w-10"
            >
              <Link to="/login" aria-label={language === 'fr' ? 'Connexion admin' : 'Admin login'}>
                <Shield className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleLanguage}
              aria-label={text.navbar.switchLanguage}
              className="h-10 w-10"
            >
              <Languages className="h-4 w-4" />
            </Button>
            <ThemeCycleButton variant="outline" size="icon" className="h-10 w-10" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-1">
        <MobileHero />
        <MobileProjects />
        <MobileExperience />
        <MobileSkills />
        <MobileContact />
      </main>

      <MobileBottomNav items={navItems} activeItemId={activeSection} />
    </div>
  );
}
