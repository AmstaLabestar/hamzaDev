import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { FolderKanban, Briefcase, Hammer, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { AdminPageHeader, AdminStatCard, AdminSurface } from '@/app/components/dashboard';
import { TechBadge } from '@/app/components/ui/TechBadge';
import { CORE_TECH_STACK } from '@/app/utils/tech-stack';

interface DashboardStats {
  totalProjects: number;
  totalExperiences: number;
  totalSkills: number;
  lastUpdatedAt: string | null;
}

interface ActivityItem {
  id: number;
  action: string;
  entity_table: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const isFr = language === 'fr';
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalExperiences: 0,
    totalSkills: 0,
    lastUpdatedAt: null,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [projectsCount, experiencesCount, skillsCount, activityResult] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('experiences').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('skills').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase
          .from('admin_logs')
          .select('id, action, entity_table, created_at')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      if (projectsCount.error) throw projectsCount.error;
      if (experiencesCount.error) throw experiencesCount.error;
      if (skillsCount.error) throw skillsCount.error;
      if (activityResult.error) throw activityResult.error;

      const recent = (activityResult.data ?? []) as ActivityItem[];

      setStats({
        totalProjects: projectsCount.count ?? 0,
        totalExperiences: experiencesCount.count ?? 0,
        totalSkills: skillsCount.count ?? 0,
        lastUpdatedAt: recent[0]?.created_at ?? null,
      });

      setActivity(recent);
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formattedLastUpdate = useMemo(() => {
    if (!stats.lastUpdatedAt) {
      return isFr ? 'Aucune mise a jour' : 'No updates yet';
    }

    return new Date(stats.lastUpdatedAt).toLocaleString();
  }, [isFr, stats.lastUpdatedAt]);

  const statCards = [
    {
      title: isFr ? 'Total Projets' : 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: isFr ? 'Experiences' : 'Experiences',
      value: stats.totalExperiences,
      icon: Briefcase,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: isFr ? 'Competences' : 'Skills',
      value: stats.totalSkills,
      icon: Hammer,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: isFr ? 'Derniere MAJ' : 'Last Update',
      value: loading ? '...' : formattedLastUpdate,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ] as const;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={isFr ? 'Tableau de bord' : 'Dashboard'}
        description={
          isFr
            ? 'Bon retour. Voici un apercu de vos donnees admin.'
            : 'Welcome back! Here is an overview of your admin data.'
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <AdminStatCard
            key={stat.title}
            title={stat.title}
            value={loading ? '...' : stat.value}
            icon={stat.icon}
            iconClassName={stat.color}
            iconContainerClassName={stat.bgColor}
            delay={index * 0.08}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <AdminSurface className="space-y-4">
            <h2 className="text-xl font-bold">{isFr ? 'Activite recente' : 'Recent Activity'}</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">{isFr ? 'Aucune activite.' : 'No activity yet.'}</p>
            ) : (
              <div className="space-y-4">
                {activity.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">
                      {isFr ? `${entry.action} sur ${entry.entity_table}` : `${entry.action} on ${entry.entity_table}`} - {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AdminSurface>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <AdminSurface className="space-y-4">
            <h2 className="text-xl font-bold">{isFr ? 'Conseils rapides' : 'Quick Tips'}</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">-</span>
                <span>{isFr ? 'Utilisez le statut brouillon avant publication pour valider le contenu.' : 'Use draft status before each publish to validate content.'}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">-</span>
                <span>{isFr ? 'Preferez le bucket prive et les URLs signees pour les apercus.' : 'Prefer private bucket uploads and signed URLs for previews.'}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">-</span>
                <span>{isFr ? "Archivez les anciennes donnees en soft delete pour conserver l'historique." : 'Archive old entries with soft delete to keep audit history.'}</span>
              </li>
            </ul>
            <div className="space-y-3 pt-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {isFr ? 'Stack principal' : 'Core Stack'}
              </p>
              <div className="flex flex-wrap gap-2">
                {CORE_TECH_STACK.map((tech, index) => (
                  <TechBadge key={tech.id} tech={tech} size="sm" delay={index * 0.03} />
                ))}
              </div>
            </div>
          </AdminSurface>
        </motion.div>
      </div>
    </div>
  );
}
