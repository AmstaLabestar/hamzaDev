import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { TableRowSkeleton } from '@/app/components/LoadingSkeleton';
import { useExperiences } from '@/features/experiences/hooks/useExperiences';
import { experiencesService } from '@/features/experiences/services/experiences.service';
import type { ExperienceStatus, ExperienceWritePayload } from '@/features/experiences/types';
import { toast } from 'sonner';

interface ExperienceFormState {
  position: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  status: ExperienceStatus;
}

const INITIAL_FORM_STATE: ExperienceFormState = {
  position: '',
  company: '',
  location: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
  status: 'draft',
};

function formatDateRange(startDate: string, endDate: string | null, isCurrent: boolean): string {
  if (!startDate) return '-';
  if (isCurrent) return `${startDate} - Present`;
  if (!endDate) return startDate;
  return `${startDate} - ${endDate}`;
}

export default function AdminExperiences() {
  const {
    query,
    experiences,
    total,
    totalPages,
    loading,
    refresh,
    setSearch,
    setStatus,
    setPage,
    remove,
    togglePublish,
  } = useExperiences();

  const [searchInput, setSearchInput] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExperienceFormState>(INITIAL_FORM_STATE);

  const isEmpty = useMemo(() => !loading && experiences.length === 0, [loading, experiences.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    setFormOpen(true);
  };

  const openEditDialog = async (id: string) => {
    try {
      setFormLoading(true);
      const experience = await experiencesService.getById(id);
      if (!experience) {
        toast.error('Experience not found');
        return;
      }

      setEditingId(id);
      setFormData({
        position: experience.position,
        company: experience.company,
        location: experience.location,
        start_date: experience.start_date,
        end_date: experience.end_date ?? '',
        is_current: experience.is_current,
        description: experience.description,
        status: experience.status,
      });
      setFormOpen(true);
    } catch (error) {
      console.error('Failed to load experience for edit:', error);
      toast.error('Unable to load experience');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.position || !formData.company || !formData.location || !formData.start_date || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.is_current && !formData.end_date) {
      toast.error('End date is required when experience is not current');
      return;
    }

    const payload: ExperienceWritePayload = {
      position: formData.position.trim(),
      company: formData.company.trim(),
      location: formData.location.trim(),
      start_date: formData.start_date,
      end_date: formData.is_current ? null : formData.end_date,
      is_current: formData.is_current,
      description: formData.description.trim(),
      status: formData.status,
    };

    try {
      setFormLoading(true);
      if (editingId) {
        await experiencesService.update(editingId, payload);
        toast.success('Experience updated');
      } else {
        await experiencesService.create(payload);
        toast.success('Experience created');
      }
      setFormOpen(false);
      setEditingId(null);
      setFormData(INITIAL_FORM_STATE);
      await refresh();
    } catch (error) {
      console.error('Failed to save experience:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to save experience');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Experiences</h1>
          <p className="text-muted-foreground">Manage work experiences for your portfolio.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Experience
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <Input
          placeholder="Search by role, company, description..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <select
          value={query.status ?? 'all'}
          onChange={(event) => setStatus(event.target.value as 'all' | 'draft' | 'published')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <Table>
            <TableBody>
              {Array.from({ length: query.pageSize }).map((_, index) => (
                <TableRowSkeleton key={`experience-loading-${index}`} />
              ))}
            </TableBody>
          </Table>
        ) : isEmpty ? (
          <div className="p-8 text-center text-muted-foreground">No experiences found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map((experience) => (
                <TableRow key={experience.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{experience.position}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{experience.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{experience.company}</TableCell>
                  <TableCell>{experience.location}</TableCell>
                  <TableCell>{formatDateRange(experience.start_date, experience.end_date, experience.is_current)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={experience.status === 'published'}
                        onCheckedChange={() => void togglePublish(experience.id, experience.status)}
                      />
                      <Badge variant={experience.status === 'published' ? 'default' : 'secondary'}>
                        {experience.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => void openEditDialog(experience.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(experience.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} result{total > 1 ? 's' : ''} - Page {query.page} / {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={query.page <= 1}
            onClick={() => setPage(query.page - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={query.page >= totalPages}
            onClick={() => setPage(query.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Experience' : 'New Experience'}</DialogTitle>
            <DialogDescription>Maintain your professional timeline with clean structured data.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(event) => setFormData((previous) => ({ ...previous, position: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(event) => setFormData((previous) => ({ ...previous, company: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(event) => setFormData((previous) => ({ ...previous, location: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(event) =>
                    setFormData((previous) => ({ ...previous, status: event.target.value as ExperienceStatus }))
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(event) => setFormData((previous) => ({ ...previous, start_date: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  disabled={formData.is_current}
                  onChange={(event) => setFormData((previous) => ({ ...previous, end_date: event.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Current role</p>
                <p className="text-xs text-muted-foreground">If enabled, end date is automatically cleared.</p>
              </div>
              <Switch
                checked={formData.is_current}
                onCheckedChange={(checked) =>
                  setFormData((previous) => ({
                    ...previous,
                    is_current: checked,
                    end_date: checked ? '' : previous.end_date,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(event) => setFormData((previous) => ({ ...previous, description: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={formLoading}>
              {formLoading ? 'Saving...' : editingId ? 'Update Experience' : 'Create Experience'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this experience?</AlertDialogTitle>
            <AlertDialogDescription>
              The record will be soft deleted and can still be audited in admin logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  void remove(deleteId);
                }
                setDeleteId(null);
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

