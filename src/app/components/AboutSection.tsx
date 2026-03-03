import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Code2, Database, Globe, Sparkles } from 'lucide-react';
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

export function AboutSection() {
  const { language } = useLanguage();
  const text = translations[language];
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hasProfile, setHasProfile] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState(FALLBACK_AVATAR_URL);

  useEffect(() => {
    void loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [publishedProfile, publishedSkills] = await Promise.all([
        publicContentService.getPublishedProfile(),
        publicContentService.listPublishedSkills(24),
      ]);

      if (publishedProfile) {
        setFullName(publishedProfile.full_name);
        setProfessionalTitle(publishedProfile.professional_title);
        setBio(publishedProfile.bio);
        setHasProfile(true);

        if (publishedProfile.avatar_path) {
          try {
            const normalizedAvatarPath = normalizeAvatarPath(publishedProfile.avatar_path);
            if (normalizedAvatarPath.startsWith('http://') || normalizedAvatarPath.startsWith('https://')) {
              setAvatarUrl(normalizedAvatarPath);
            } else {
              const signedUrl = await storageService.getSignedUrl(normalizedAvatarPath, 86400);
              setAvatarUrl(signedUrl);
            }
          } catch (error) {
            console.error('Failed to load published avatar signed URL:', error);
            setAvatarUrl(FALLBACK_AVATAR_URL);
          }
        } else {
          setAvatarUrl(FALLBACK_AVATAR_URL);
        }
      }

      setSkills(publishedSkills);
    } catch (error) {
      console.error('Failed to load About section content:', error);
    }
  };

  const resolvedName = hasProfile ? fullName : text.about.defaultName;
  const resolvedTitle = hasProfile ? professionalTitle : text.about.defaultTitle;
  const resolvedBio = hasProfile ? bio : text.about.defaultBio;

  const techStack = [
    { icon: Code2, name: text.about.techFrontend, color: 'text-blue-500' },
    { icon: Database, name: text.about.techBackend, color: 'text-green-500' },
    { icon: Globe, name: text.about.techFullStack, color: 'text-purple-500' },
    { icon: Sparkles, name: text.about.techUiUx, color: 'text-pink-500' },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{text.about.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {text.about.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="relative w-64 h-64 mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl opacity-30" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/30">
                <img
                  src={avatarUrl}
                  alt={resolvedName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarUrl(FALLBACK_AVATAR_URL)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold">{resolvedTitle}</h3>
              <p className="text-muted-foreground leading-relaxed">{resolvedBio}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">{text.about.profileLabel}</p>
              <p className="text-2xl font-semibold">{resolvedName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <tech.icon className={`h-8 w-8 ${tech.color} mb-3`} />
                  <h4 className="font-semibold">{tech.name}</h4>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">{text.about.skillsTitle}</h4>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      viewport={{ once: true }}
                    >
                      <Badge variant="secondary" className="text-sm py-1.5 px-3">
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{text.about.noSkills}</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
