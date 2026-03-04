import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { TechBadge } from '../ui/TechBadge';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';
import { publicContentService } from '@/features/public/services/public-content.service';
import { CORE_TECH_STACK } from '@/app/utils/tech-stack';

export function MobileSkills() {
  const { language } = useLanguage();
  const text = translations[language];
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const publishedSkills = await publicContentService.listPublishedSkills(36);
      setSkills(publishedSkills);
    } catch (error) {
      console.error('Failed to load mobile skills:', error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="skills" className="scroll-mt-24 px-4 py-8">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{text.about.skillsTitle}</h2>
        <p className="text-sm text-muted-foreground">{text.about.subtitle}</p>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          {language === 'fr' ? 'Stack principal' : 'Core Stack'}
        </p>
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max items-center gap-2">
            {CORE_TECH_STACK.map((tech, index) => (
              <TechBadge key={tech.id} tech={tech} size="sm" delay={index * 0.03} />
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-4">
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ) : skills.length > 0 ? (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.03,
              },
            },
          }}
          className="flex flex-wrap gap-2"
        >
          {skills.map((skill) => (
            <motion.div
              key={skill}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 },
              }}
            >
              <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs">
                {skill}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-sm text-muted-foreground">{text.about.noSkills}</p>
      )}
    </section>
  );
}
