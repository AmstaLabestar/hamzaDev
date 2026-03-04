import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { experiencesService } from '@/features/experiences/services/experiences.service';
import { Briefcase, Calendar } from 'lucide-react';
import { ExperienceCardSkeleton } from './LoadingSkeleton';
import { SectionHeader } from './ui/SectionHeader';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[];
}

export function ExperiencesSection() {
  const { language } = useLanguage();
  const text = translations[language];
  const [experiences, setExperiences] = useState<Experience[]>([]);
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

      const mappedExperiences: Experience[] = response.data.map((experience) => ({
        id: experience.id,
        company: experience.company,
        position: experience.position,
        startDate: experience.start_date,
        endDate: experience.end_date ?? '',
        current: experience.is_current,
        description: experience.description,
        technologies: [],
      }));

      setExperiences(mappedExperiences);
    } catch (error) {
      console.error('Failed to load experiences:', error);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="experiences" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title={text.experiences.title} subtitle={text.experiences.subtitle} />

        {loading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <ExperienceCardSkeleton key={i} />
            ))}
          </div>
        ) : experiences.length > 0 ? (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8">
              {experiences.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background hidden md:block" />

                  {/* Content Card */}
                  <div className="md:ml-20 bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold">{experience.position}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span className="font-medium text-primary">{experience.company}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {experience.startDate} - {experience.current ? text.experiences.present : experience.endDate}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground leading-relaxed">
                        {experience.description}
                      </p>

                      {/* Technologies */}
                      {experience.technologies && experience.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {experience.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {text.experiences.empty}
          </div>
        )}
      </div>
    </section>
  );
}
