import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Github, Linkedin, Mail, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';
import { publicContentService } from '@/features/public/services/public-content.service';
import { storageService } from '@/services/storage.service';
import { usePrefersReducedMotion, useTypingEffect } from '@/app/hooks';
import { FALLBACK_AVATAR_URL, normalizeStoragePath } from './mobile-utils';

export function MobileHero() {
  const { language } = useLanguage();
  const text = translations[language];
  const prefersReducedMotion = usePrefersReducedMotion();
  const { typedText } = useTypingEffect({
    phrases: [
      'I build scalable systems.',
      'I design futuristic interfaces.',
      'I architect robust backends.',
      'I solve real-world problems.',
    ],
    typeSpeed: 46,
    deleteSpeed: 30,
  });

  const [name, setName] = useState(text.hero.defaultName);
  const [title, setTitle] = useState(text.hero.defaultTitle);
  const [bio, setBio] = useState(text.hero.defaultBio);
  const [avatarUrl, setAvatarUrl] = useState(FALLBACK_AVATAR_URL);
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState<string | null>(null);

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await publicContentService.getPublishedProfile();
      if (!profile) return;

      setName(profile.full_name);
      setTitle(profile.professional_title);
      setBio(profile.bio);
      setLinkedinUrl(profile.linkedin_url);
      setGithubUrl(profile.github_url);
      setContactEmail(profile.email);

      if (profile.avatar_path) {
        const normalized = normalizeStoragePath(profile.avatar_path);
        if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
          setAvatarUrl(normalized);
        } else {
          const signedUrl = await storageService.getSignedUrl(normalized, 86400);
          setAvatarUrl(signedUrl);
        }
      }
    } catch (error) {
      console.error('Failed to load mobile hero profile:', error);
    }
  };

  return (
    <section id="home" className="scroll-mt-24 px-4 pb-8 pt-5">
      <div className="space-y-5">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
          className="glass-card neon-border rounded-3xl p-5"
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-primary/35 bg-muted">
              <img
                src={avatarUrl}
                alt={name}
                width={64}
                height={64}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
                onError={() => setAvatarUrl(FALLBACK_AVATAR_URL)}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-primary/80">{text.hero.greeting}</p>
              <h1 className="truncate text-2xl font-semibold">{name}</h1>
              <p className="truncate text-sm text-muted-foreground">{title}</p>
            </div>
          </div>

          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{bio}</p>

          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/35 bg-background/40 px-3 py-1.5 text-xs font-mono text-primary">
            <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{typedText}</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button size="lg" className="h-12 justify-between text-base glow-hover" asChild>
              <a href="#projects">
                {text.hero.viewWork}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-12 text-base glow-hover" asChild>
              <a href="#contact">{text.contact.send}</a>
            </Button>
          </div>
        </motion.div>

        {linkedinUrl || githubUrl || contactEmail ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : 0.08 }}
            className="flex gap-3"
          >
            {linkedinUrl ? (
              <Button variant="outline" className="h-11 flex-1 justify-center" asChild>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
            {githubUrl ? (
              <Button variant="outline" className="h-11 flex-1 justify-center" asChild>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
            {contactEmail ? (
              <Button variant="outline" className="h-11 flex-1 justify-center" asChild>
                <a href={`mailto:${contactEmail}`} aria-label="Email">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
