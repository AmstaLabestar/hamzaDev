import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Github, PlayCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';
import { projectsService } from '@/features/projects/services/projects.service';
import { storageService } from '@/services/storage.service';
import { usePrefersReducedMotion } from '@/app/hooks';
import { normalizeStoragePath } from './mobile-utils';

interface MobileProject {
  id: string;
  title: string;
  description: string;
  projectType: 'web' | 'mobile' | 'desktop' | 'api' | 'other';
  imageUrl: string;
  demoVideoUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  technologies: string[];
}

function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}

export function MobileProjects() {
  const { language } = useLanguage();
  const text = translations[language];
  const prefersReducedMotion = usePrefersReducedMotion();

  const [projects, setProjects] = useState<MobileProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    void loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsService.list({
        page: 1,
        pageSize: 12,
        status: 'published',
        includeDeleted: false,
      });

      const mapped = await Promise.all(
        response.data.map(async (project) => {
          let imageUrl = '';
          let demoVideoUrl: string | undefined;

          if (project.image_path) {
            try {
              imageUrl = await storageService.getSignedUrl(normalizeStoragePath(project.image_path), 3600);
            } catch (error) {
              console.error(`Failed to sign mobile project image ${project.id}:`, error);
            }
          }

          if (project.demo_video_path) {
            try {
              demoVideoUrl = await storageService.getSignedUrl(normalizeStoragePath(project.demo_video_path), 3600);
            } catch (error) {
              console.error(`Failed to sign mobile project video ${project.id}:`, error);
            }
          }

          return {
            id: project.id,
            title: project.title,
            description: project.description,
            projectType: project.project_type,
            imageUrl,
            demoVideoUrl,
            githubUrl: project.github_url ?? undefined,
            liveUrl: project.demo_url ?? undefined,
            technologies: project.technologies ?? [],
          } satisfies MobileProject;
        }),
      );

      setProjects(mapped);
      setIndex(0);
    } catch (error) {
      console.error('Failed to load mobile projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const hasProjects = projects.length > 0;
  const activeProject = hasProjects ? projects[index] : null;
  const paginationDots = useMemo(() => projects.map((project) => project.id), [projects]);

  const paginate = (nextDirection: number) => {
    if (!projects.length) return;

    setDirection(nextDirection);
    setIndex((current) => {
      const next = current + nextDirection;

      if (next < 0) {
        return projects.length - 1;
      }

      if (next >= projects.length) {
        return 0;
      }

      return next;
    });
  };

  return (
    <section id="projects" className="scroll-mt-24 px-4 py-8">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{text.projects.title}</h2>
        <p className="text-sm text-muted-foreground">{text.projects.subtitle}</p>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-3 h-40 animate-pulse rounded-xl bg-muted" />
          <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
        </div>
      ) : activeProject ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl">
            <AnimatePresence custom={direction} initial={false} mode="wait">
              <motion.article
                key={activeProject.id}
                custom={direction}
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : direction >= 0 ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : direction >= 0 ? -36 : 36 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.34 }}
                drag={prefersReducedMotion ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.95}
                onDragEnd={(_, info) => {
                  const swipe = swipePower(info.offset.x, info.velocity.x);
                  if (swipe < -900) {
                    paginate(1);
                  } else if (swipe > 900) {
                    paginate(-1);
                  }
                }}
                className="glass-card neon-border rounded-2xl p-4"
              >
                <div className="relative mb-3 overflow-hidden rounded-xl bg-muted">
                  {activeProject.projectType === 'mobile' && activeProject.demoVideoUrl ? (
                    <video
                      src={activeProject.demoVideoUrl}
                      controls
                      preload="metadata"
                      className="h-52 w-full object-cover"
                    />
                  ) : activeProject.imageUrl ? (
                    <img
                      src={activeProject.imageUrl}
                      alt={activeProject.title}
                      width={1280}
                      height={720}
                      loading="lazy"
                      decoding="async"
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">No preview</div>
                  )}

                  <Badge className="absolute left-2 top-2 capitalize" variant="secondary">
                    {activeProject.projectType}
                  </Badge>
                </div>

                <h3 className="mb-1 text-lg font-semibold">{activeProject.title}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{activeProject.description}</p>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  {activeProject.technologies.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {activeProject.githubUrl ? (
                    <Button variant="outline" className="h-11" asChild>
                      <a href={activeProject.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        {text.projects.code}
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" className="h-11" disabled>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {text.projects.code}
                    </Button>
                  )}
                  {activeProject.liveUrl ? (
                    <Button className="h-11" asChild>
                      <a href={activeProject.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {text.projects.liveDemo}
                      </a>
                    </Button>
                  ) : (
                    <Button className="h-11" disabled>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {text.projects.liveDemo}
                    </Button>
                  )}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-2 py-1">
            {paginationDots.map((dotId, dotIndex) => (
              <button
                key={dotId}
                type="button"
                className={`h-2 rounded-full transition-all ${dotIndex === index ? 'w-5 bg-primary' : 'w-2 bg-border'}`}
                onClick={() => {
                  if (dotIndex === index) {
                    return;
                  }
                  setDirection(dotIndex > index ? 1 : -1);
                  setIndex(dotIndex);
                }}
                aria-label={`View project ${dotIndex + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{text.projects.empty}</p>
      )}
    </section>
  );
}
