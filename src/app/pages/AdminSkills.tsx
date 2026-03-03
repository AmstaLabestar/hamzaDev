import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
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
import { useSkills } from '@/features/skills/hooks/useSkills';
import { skillsService } from '@/features/skills/services/skills.service';
import type { SkillCategory, SkillStatus, SkillWritePayload } from '@/features/skills/types';

interface SkillFormState {
  name: string;
  category: SkillCategory;
  level: number;
  icon: string;
  sort_order: number;
  status: SkillStatus;
}

const INITIAL_FORM_STATE: SkillFormState = {
  name: '',
  category: 'frontend',
  level: 3,
  icon: 'code',
  sort_order: 0,
  status: 'published',
};

const SKILL_CATEGORIES: SkillCategory[] = [
  'frontend',
  'backend',
  'devops',
  'database',
  'cloud',
  'mobile',
  'tooling',
  'other',
];

export default function AdminSkills() {
  const {
    query,
    skills,
    total,
    totalPages,
    loading,
    refresh,
    setSearch,
    setStatus,
    setPage,
    remove,
    togglePublish,
  } = useSkills();

  const [searchInput, setSearchInput] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SkillFormState>(INITIAL_FORM_STATE);

  const isEmpty = useMemo(() => !loading && skills.length === 0, [loading, skills.length]);

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

  const openEditDialog = (id: string) => {
    const skill = skills.find((entry) => entry.id === id);
    if (!skill) {
      toast.error('Skill not found');
      return;
    }

    setEditingId(id);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      icon: skill.icon,
      sort_order: skill.sort_order,
      status: skill.status,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Skill name is required');
      return;
    }

    const payload: SkillWritePayload = {
      name: formData.name.trim(),
      category: formData.category,
      level: formData.level,
      icon: formData.icon.trim() || 'code',
      sort_order: formData.sort_order,
      status: formData.status,
    };

    try {
      setFormLoading(true);
      if (editingId) {
        await skillsService.update(editingId, payload);
        toast.success('Skill updated');
      } else {
        await skillsService.create(payload);
        toast.success('Skill created');
      }
      setFormOpen(false);
      setEditingId(null);
      setFormData(INITIAL_FORM_STATE);
      await refresh();
    } catch (error) {
      console.error('Failed to save skill:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to save skill');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Skills</h1>
          <p className="text-muted-foreground">Manage your public skills catalog and sorting.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Skill
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <Input
          placeholder="Search skills..."
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
                <TableRowSkeleton key={`skill-loading-${index}`} />
              ))}
            </TableBody>
          </Table>
        ) : isEmpty ? (
          <div className="p-8 text-center text-muted-foreground">No skills found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-xs text-muted-foreground">Icon: {skill.icon}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{skill.category}</TableCell>
                  <TableCell>{skill.level}/5</TableCell>
                  <TableCell>{skill.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={skill.status === 'published'}
                        onCheckedChange={() => void togglePublish(skill.id, skill.status)}
                      />
                      <Badge variant={skill.status === 'published' ? 'default' : 'secondary'}>{skill.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(skill.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(skill.id)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Skill' : 'New Skill'}</DialogTitle>
            <DialogDescription>Set category, level and ordering for portfolio rendering.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill_name">Name *</Label>
              <Input
                id="skill_name"
                value={formData.name}
                onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="skill_category">Category *</Label>
                <select
                  id="skill_category"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData((previous) => ({ ...previous, category: event.target.value as SkillCategory }))
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm capitalize"
                >
                  {SKILL_CATEGORIES.map((category) => (
                    <option key={category} value={category} className="capitalize">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill_status">Status *</Label>
                <select
                  id="skill_status"
                  value={formData.status}
                  onChange={(event) =>
                    setFormData((previous) => ({ ...previous, status: event.target.value as SkillStatus }))
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
                <Label htmlFor="skill_level">Level (1-5) *</Label>
                <Input
                  id="skill_level"
                  type="number"
                  min={1}
                  max={5}
                  value={formData.level}
                  onChange={(event) =>
                    setFormData((previous) => ({ ...previous, level: Math.min(5, Math.max(1, Number(event.target.value))) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill_order">Display order *</Label>
                <Input
                  id="skill_order"
                  type="number"
                  min={0}
                  value={formData.sort_order}
                  onChange={(event) =>
                    setFormData((previous) => ({ ...previous, sort_order: Math.max(0, Number(event.target.value)) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill_icon">Icon key *</Label>
              <Input
                id="skill_icon"
                value={formData.icon}
                onChange={(event) => setFormData((previous) => ({ ...previous, icon: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={formLoading}>
              {formLoading ? 'Saving...' : editingId ? 'Update Skill' : 'Create Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this skill?</AlertDialogTitle>
            <AlertDialogDescription>This will soft delete the skill from active display.</AlertDialogDescription>
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

