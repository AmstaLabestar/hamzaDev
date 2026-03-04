import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Download, Github, Linkedin, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Magnetic } from './ui/Magnetic';
import { TiltCard } from './ui/TiltCard';
import { usePrefersReducedMotion, useTypingEffect } from '@/app/hooks';
import { publicContentService } from '@/features/public/services/public-content.service';
import { storageService } from '@/services/storage.service';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';

const FALLBACK_AVATAR_URL = '/images/profile.jpeg';

function normalizeAvatarPath(path: string): string {
  const trimmedPath = path.trim();
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }

  const withoutLeadingSlash = trimmedPath.replace(/^\/+/, '');
  if (withoutLeadingSlash.startsWith('admin-private/')) {
    return withoutLeadingSlash.replace(/^admin-private\//, '');
  }

  return withoutLeadingSlash;
}

export function HeroSection() {
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
  });
  const [displayName, setDisplayName] = useState('');
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayBio, setDisplayBio] = useState('');
  const [hasProfile, setHasProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(FALLBACK_AVATAR_URL);
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState<string | null>(null);

  useEffect(() => {
    void loadHeroContent();
  }, []);

  const loadHeroContent = async () => {
    try {
      const profile = await publicContentService.getPublishedProfile();
      if (!profile) {
        return;
      }

      setDisplayName(profile.full_name);
      setDisplayTitle(profile.professional_title);
      setDisplayBio(profile.bio);
      setHasProfile(true);
      setLinkedinUrl(profile.linkedin_url);
      setGithubUrl(profile.github_url);
      setContactEmail(profile.email);

      if (profile.avatar_path) {
        const normalizedPath = normalizeAvatarPath(profile.avatar_path);
        if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
          setAvatarUrl(normalizedPath);
        } else {
          const signedUrl = await storageService.getSignedUrl(normalizedPath, 86400);
          setAvatarUrl(signedUrl);
        }
      }
    } catch (error) {
      console.error('Failed to load hero content:', error);
    }
  };

  const resolvedName = hasProfile ? displayName : text.hero.defaultName;
  const resolvedTitle = hasProfile ? displayTitle : text.hero.defaultTitle;
  const resolvedBio = hasProfile ? displayBio : text.hero.defaultBio;

  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
                className="text-primary font-semibold"
              >
                {text.hero.greeting} {resolvedName}
              </motion.p>
              <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              >
                {resolvedTitle}{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {text.hero.roleSuffix}
                </span>
              </motion.h1>
              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.3 }}
                className="text-lg text-muted-foreground max-w-xl"
              >
                {resolvedBio}
              </motion.p>
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.35 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-background/50 px-4 py-2 text-sm font-mono text-primary glow-hover"
              >
                <span aria-live="polite">{typedText}</span>
                {!prefersReducedMotion ? <span className="typing-cursor" aria-hidden /> : null}
              </motion.div>
            </div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.4 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-4">
                <Magnetic>
                  <Button size="lg" className="gap-2 glow-hover" asChild>
                    <a href="#projects">
                      {text.hero.viewWork}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </Magnetic>
                <Magnetic strength={12}>
                  <Button size="lg" variant="outline" className="gap-2 glow-hover">
                    <Download className="h-4 w-4" />
                    {text.hero.downloadCv}
                  </Button>
                </Magnetic>
              </div>

              <div className="flex items-center gap-3">
                {linkedinUrl && (
                  <Button size="icon" variant="outline" asChild>
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}

                {githubUrl && (
                  <Button size="icon" variant="outline" asChild>
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}

                {contactEmail && (
                  <Button size="icon" variant="outline" asChild>
                    <a href={`mailto:${contactEmail}`} aria-label="Email">
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.2 }}
            className="relative max-w-sm mx-auto w-full lg:max-w-none"
          >
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl" />

              <TiltCard className="relative glass-card neon-border rounded-3xl p-8 glow-primary">
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/30 bg-muted anim-float-slow anim-glow-pulse">
                      <img
                        src={avatarUrl}
                        alt={resolvedName}
                        width={112}
                        height={112}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarUrl(FALLBACK_AVATAR_URL)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex gap-2">
                      <span className="text-accent">{text.hero.codeConst}</span>
                      <span className="text-foreground">{text.hero.codeDeveloper}</span>
                      <span className="text-muted-foreground">=</span>
                      <span className="text-primary">{'{'}</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      <div className="text-muted-foreground">
                        <span className="text-accent">{text.hero.codeName}:</span> "{resolvedName}",
                      </div>
                      <div className="text-muted-foreground">
                        <span className="text-accent">{text.hero.codeTitle}:</span> "{resolvedTitle}",
                      </div>
                      <div className="text-muted-foreground">
                        <span className="text-accent">{text.hero.codePassion}:</span> "{text.hero.codePassionValue}",
                      </div>
                    </div>
                    <div className="text-primary">{'}'}</div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
