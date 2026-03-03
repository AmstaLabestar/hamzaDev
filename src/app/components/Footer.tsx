import { useEffect, useState } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { publicContentService } from '@/features/public/services/public-content.service';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';

type SocialLink = {
  icon: typeof Github;
  href: string;
  label: string;
};

export function Footer() {
  const { language } = useLanguage();
  const text = translations[language];
  const currentYear = new Date().getFullYear();
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState<string | null>(null);

  useEffect(() => {
    void loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const profile = await publicContentService.getPublishedProfile();
      if (!profile) return;

      setLinkedinUrl(profile.linkedin_url);
      setGithubUrl(profile.github_url);
      setContactEmail(profile.email);
    } catch (error) {
      console.error('Failed to load footer social links:', error);
    }
  };

  const socials: SocialLink[] = [
    githubUrl ? { icon: Github, href: githubUrl, label: 'GitHub' } : null,
    linkedinUrl ? { icon: Linkedin, href: linkedinUrl, label: 'LinkedIn' } : null,
    contactEmail ? { icon: Mail, href: `mailto:${contactEmail}`, label: 'Email' } : null,
  ].filter((item): item is SocialLink => item !== null);

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} DevPortfolio. {text.footer.rightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
