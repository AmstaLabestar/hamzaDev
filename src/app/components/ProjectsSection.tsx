import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { projectsService } from '@/features/projects/services/projects.service';
import { storageService } from '@/services/storage.service';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { SectionHeader } from './ui/SectionHeader';
import { TiltCard } from './ui/TiltCard';
import { ExternalLink, Github } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProjectCardSkeleton } from './LoadingSkeleton';
import { usePrefersReducedMotion } from '@/app/hooks';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';

interface Project {
  id: string;
  title: string;
  description: string;
  projectType: 'web' | 'mobile' | 'desktop' | 'api' | 'other';
  image: string;
  demoVideoUrl?: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
}

function normalizeStoragePath(path: string): string {
  const trimmedPath = path.trim();
  const withoutLeadingSlash = trimmedPath.replace(/^\/+/, '');
  if (withoutLeadingSlash.startsWith('admin-private/')) {
    return withoutLeadingSlash.replace(/^admin-private\//, '');
  }
  return withoutLeadingSlash;
}

export function ProjectsSection() {
  const { language } = useLanguage();
  const text = translations[language];
  const prefersReducedMotion = usePrefersReducedMotion();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsService.list({
        page: 1,
        pageSize: 24,
        status: 'published',
        includeDeleted: false,
      });

      const mappedProjects: Project[] = await Promise.all(
        response.data.map(async (project) => {
          let imageUrl = '';
          let demoVideoUrl: string | undefined;

          if (project.image_path) {
            try {
              imageUrl = await storageService.getSignedUrl(normalizeStoragePath(project.image_path), 3600);
            } catch (error) {
              console.error(`Failed to create signed URL for project image ${project.id}:`, error);
            }
          }

          if (project.demo_video_path) {
            try {
              demoVideoUrl = await storageService.getSignedUrl(normalizeStoragePath(project.demo_video_path), 3600);
            } catch (error) {
              console.error(`Failed to create signed URL for project demo video ${project.id}:`, error);
            }
          }

          return {
            id: project.id,
            title: project.title,
            description: project.description,
            projectType: project.project_type,
            image: imageUrl,
            demoVideoUrl,
            tags: project.technologies ?? [],
            githubUrl: project.github_url ?? undefined,
            liveUrl: project.demo_url ?? undefined,
          };
        }),
      );

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title={text.projects.title} subtitle={text.projects.subtitle} />

        {/* Projects Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: prefersReducedMotion ? 0 : 0.08,
                  delayChildren: 0.05,
                },
              },
            }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                variants={{
                  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.44,
                      delay: prefersReducedMotion ? 0 : index * 0.01,
                    },
                  },
                }}
              >
                <TiltCard className="group bg-card border border-border rounded-xl overflow-hidden glow-hover">
                  {/* Project Image */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <div className="absolute top-3 left-3 z-10">
                      <Badge variant="secondary" className="capitalize">
                        {project.projectType}
                      </Badge>
                    </div>
                    {project.projectType === 'mobile' && project.demoVideoUrl ? (
                      <video
                        src={project.demoVideoUrl}
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    ) : project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        width={1280}
                        height={720}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ImageWithFallback
                        query={project.projectType === 'mobile' ? 'mobile app interface' : 'modern web application dashboard'}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Project Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{project.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex gap-2 pt-2">
                      {project.githubUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            {text.projects.code}
                          </a>
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {text.projects.liveDemo}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {text.projects.empty}
          </div>
        )}
      </div>
    </section>
  );
}
