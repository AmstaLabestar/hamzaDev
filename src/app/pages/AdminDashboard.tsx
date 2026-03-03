import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { FolderKanban, Briefcase, Hammer, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
      <div>
        <h1 className="text-3xl font-bold mb-2">{isFr ? 'Tableau de bord' : 'Dashboard'}</h1>
        <p className="text-muted-foreground">
          {isFr ? 'Bon retour. Voici un apercu de vos donnees admin.' : 'Welcome back! Here is an overview of your admin data.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold break-words">{loading ? '...' : stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold mb-4">{isFr ? 'Activite recente' : 'Recent Activity'}</h2>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold mb-4">{isFr ? 'Conseils rapides' : 'Quick Tips'}</h2>
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
        </motion.div>
      </div>
    </div>
  );
}
