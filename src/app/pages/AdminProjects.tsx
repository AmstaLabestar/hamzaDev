import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, ExternalLink, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { TableRowSkeleton } from '../components/LoadingSkeleton';
import { useProjects } from '@/features/projects/hooks/useProjects';
import type { ProjectType } from '@/features/projects/types';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function AdminProjects() {
  const { language } = useLanguage();
  const isFr = language === 'fr';
  const {
    query,
    projects,
    total,
    totalPages,
    loading,
    setSearch,
    setStatus,
    setProjectType,
    setPage,
    remove,
    togglePublish,
  } = useProjects();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const isEmpty = useMemo(() => !loading && projects.length === 0, [loading, projects.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await remove(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{isFr ? 'Projets' : 'Projects'}</h1>
          <p className="text-muted-foreground">
            {isFr ? 'Gerez les projets du portfolio' : 'Manage your portfolio projects'}
          </p>
        </div>
        <Button onClick={() => navigate('/admin/projects/new')}>
          <Plus className="h-4 w-4 mr-2" />
          {isFr ? 'Nouveau projet' : 'New Project'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">
        <Input
          placeholder={isFr ? 'Rechercher par titre, description, stack...' : 'Search by title, description, stack...'}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <select
          value={query.status ?? 'all'}
          onChange={(event) => setStatus(event.target.value as 'all' | 'draft' | 'published')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">{isFr ? 'Tous les statuts' : 'All statuses'}</option>
          <option value="published">{isFr ? 'Publie' : 'Published'}</option>
          <option value="draft">{isFr ? 'Brouillon' : 'Draft'}</option>
        </select>
        <select
          value={query.projectType ?? 'all'}
          onChange={(event) => setProjectType(event.target.value as ProjectType | 'all')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">{isFr ? 'Tous les types' : 'All types'}</option>
          <option value="web">Web</option>
          <option value="mobile">{isFr ? 'Mobile' : 'Mobile'}</option>
          <option value="desktop">{isFr ? 'Desktop' : 'Desktop'}</option>
          <option value="api">API</option>
          <option value="other">{isFr ? 'Autre' : 'Other'}</option>
        </select>
      </div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        {loading ? (
          <Table>
            <TableBody>
              {Array.from({ length: query.pageSize }).map((_, index) => (
                <TableRowSkeleton key={`project-loading-${index}`} />
              ))}
            </TableBody>
          </Table>
        ) : isEmpty ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">{isFr ? 'Aucun projet' : 'No projects yet'}</p>
            <Button onClick={() => navigate('/admin/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              {isFr ? 'Creer le premier projet' : 'Create your first project'}
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isFr ? 'Titre' : 'Title'}</TableHead>
                <TableHead>{isFr ? 'Type' : 'Type'}</TableHead>
                <TableHead>{isFr ? 'Stack' : 'Stack'}</TableHead>
                <TableHead>{isFr ? 'Date' : 'Date'}</TableHead>
                <TableHead>{isFr ? 'Liens' : 'Links'}</TableHead>
                <TableHead>{isFr ? 'Statut' : 'Status'}</TableHead>
                <TableHead className="text-right">{isFr ? 'Actions' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {project.project_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.technologies?.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.technologies.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{project.project_date}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {project.demo_video_path && (
                        <span className="text-muted-foreground" title={isFr ? 'Video de demo uploadee' : 'Demo video uploaded'}>
                          <Video className="h-4 w-4" />
                        </span>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={project.status === 'published'}
                      onCheckedChange={() => void togglePublish(project.id, project.status)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} {isFr ? `resultat${total > 1 ? 's' : ''}` : `result${total > 1 ? 's' : ''}`} - {isFr ? 'Page' : 'Page'} {query.page} / {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={query.page <= 1}
            onClick={() => setPage(query.page - 1)}
          >
            {isFr ? 'Precedent' : 'Previous'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={query.page >= totalPages}
            onClick={() => setPage(query.page + 1)}
          >
            {isFr ? 'Suivant' : 'Next'}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isFr ? 'Confirmer ?' : 'Are you sure?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isFr
                ? 'Ce projet sera archive (soft delete) et retire des listes actives.'
                : 'This project will be archived (soft delete) and removed from active listings.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isFr ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()}>{isFr ? 'Archiver' : 'Archive'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
