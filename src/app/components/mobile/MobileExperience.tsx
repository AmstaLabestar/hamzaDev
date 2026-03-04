import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Briefcase, Calendar } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';
import { experiencesService } from '@/features/experiences/services/experiences.service';

interface MobileExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export function MobileExperience() {
  const { language } = useLanguage();
  const text = translations[language];
  const [items, setItems] = useState<MobileExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const response = await experiencesService.list({
        page: 1,
        pageSize: 20,
        status: 'published',
        includeDeleted: false,
      });

      const mapped = response.data.map((experience) => ({
        id: experience.id,
        company: experience.company,
        position: experience.position,
        startDate: experience.start_date,
        endDate: experience.end_date ?? '',
        isCurrent: experience.is_current,
        description: experience.description,
      }));

      setItems(mapped);
    } catch (error) {
      console.error('Failed to load mobile experiences:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="experiences" className="scroll-mt-24 px-4 py-8">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{text.experiences.title}</h2>
        <p className="text-sm text-muted-foreground">{text.experiences.subtitle}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((value) => (
            <div key={value} className="glass-card rounded-2xl p-4">
              <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="mb-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <motion.div
          className="space-y-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.04,
              },
            },
          }}
        >
          {items.map((item) => (
            <motion.article
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="glass-card neon-border rounded-2xl p-4"
            >
              <h3 className="mb-1 text-base font-semibold">{item.position}</h3>
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{item.company}</span>
              </div>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {item.startDate} - {item.isCurrent ? text.experiences.present : item.endDate}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.article>
          ))}
        </motion.div>
      ) : (
        <p className="text-sm text-muted-foreground">{text.experiences.empty}</p>
      )}
    </section>
  );
}
