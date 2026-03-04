import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, X, Loader2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { projectsService } from '@/features/projects/services/projects.service';
import type { ProjectStatus, ProjectType, ProjectWritePayload } from '@/features/projects/types';
import { storageService } from '@/services/storage.service';
import { useAuth } from '../contexts/AuthContext';
import { AdminPageHeader } from '@/app/components/dashboard';

interface ProjectFormState {
  title: string;
  description: string;
  technologies: string[];
  project_type: ProjectType;
  image_path: string | null;
  demo_video_path: string | null;
  github_url: string;
  demo_url: string;
  project_date: string;
  status: ProjectStatus;
}

const INITIAL_FORM_STATE: ProjectFormState = {
  title: '',
  description: '',
  technologies: [],
  project_type: 'web',
  image_path: null,
  demo_video_path: null,
  github_url: '',
  demo_url: '',
  project_date: new Date().toISOString().slice(0, 10),
  status: 'draft',
};

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormState>(INITIAL_FORM_STATE);
  const [technologyInput, setTechnologyInput] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [demoVideoPreviewUrl, setDemoVideoPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (isEditing && id) {
      void loadProject(id);
    }
  }, [id, isEditing]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      const project = await projectsService.getById(projectId);
      if (!project) {
        toast.error('Project not found');
        navigate('/admin/projects');
        return;
      }

      setFormData({
        title: project.title,
        description: project.description,
        technologies: project.technologies ?? [],
        project_type: project.project_type,
        image_path: project.image_path,
        demo_video_path: project.demo_video_path,
        github_url: project.github_url ?? '',
        demo_url: project.demo_url ?? '',
        project_date: project.project_date,
        status: project.status,
      });

      if (project.image_path) {
        try {
          const url = await storageService.getSignedUrl(project.image_path, 3600);
          setImagePreviewUrl(url);
        } catch (error) {
          console.error('Failed to generate image preview URL:', error);
        }
      }

      if (project.demo_video_path) {
        try {
          const videoUrl = await storageService.getSignedUrl(project.demo_video_path, 3600);
          setDemoVideoPreviewUrl(videoUrl);
        } catch (error) {
          console.error('Failed to generate demo video preview URL:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!user?.id) {
      toast.error('You must be authenticated as admin to upload videos');
      return;
    }

    setUploading(true);
    try {
      const { path, previewUrl } = await storageService.uploadProjectDemoVideo(file, user.id);
      setFormData((previous) => ({ ...previous, demo_video_path: path }));
      setDemoVideoPreviewUrl(previewUrl);
      toast.success('Demo video uploaded successfully');
    } catch (error) {
      console.error('Video upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload demo video');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!user?.id) {
      toast.error('You must be authenticated as admin to upload images');
      return;
    }

    setUploading(true);
    try {
      const { path, previewUrl } = await storageService.uploadProjectImage(file, user.id);
      setFormData((previous) => ({ ...previous, image_path: path }));
      setImagePreviewUrl(previewUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTechnology = () => {
    const normalized = technologyInput.trim();
    if (!normalized) {
      return;
    }

    if (formData.technologies.includes(normalized)) {
      setTechnologyInput('');
      return;
    }

    setFormData((previous) => ({
      ...previous,
      technologies: [...previous.technologies, normalized],
    }));
    setTechnologyInput('');
  };

  const handleRemoveTechnology = (technology: string) => {
    setFormData((previous) => ({
      ...previous,
      technologies: previous.technologies.filter((item) => item !== technology),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: ProjectWritePayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      technologies: formData.technologies,
      project_type: formData.project_type,
      github_url: formData.github_url.trim() ? formData.github_url.trim() : null,
      demo_url: formData.demo_url.trim() ? formData.demo_url.trim() : null,
      demo_video_path: formData.demo_video_path,
      image_path: formData.image_path,
      project_date: formData.project_date,
      status: formData.status,
    };

    setLoading(true);
    try {
      if (isEditing && id) {
        await projectsService.update(id, payload);
        toast.success('Project updated successfully');
      } else {
        await projectsService.create(payload);
        toast.success('Project created successfully');
      }
      navigate('/admin/projects');
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <AdminPageHeader
        title={isEditing ? 'Edit Project' : 'New Project'}
        description={isEditing ? 'Update project details' : 'Add a new project to your portfolio'}
        action={
          <Button variant="outline" className="glow-hover" onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        }
      />

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={(event) => void handleSubmit(event)}
        className="rounded-2xl border border-border/70 bg-card/85 p-8 space-y-6 theme-glass"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            placeholder="My Awesome Project"
            value={formData.title}
            onChange={(event) => setFormData((previous) => ({ ...previous, title: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your project..."
            rows={5}
            value={formData.description}
            onChange={(event) => setFormData((previous) => ({ ...previous, description: event.target.value }))}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project_type">Project Type *</Label>
            <select
              id="project_type"
              value={formData.project_type}
              onChange={(event) =>
                setFormData((previous) => ({ ...previous, project_type: event.target.value as ProjectType }))
              }
              className="admin-select"
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="api">API</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_date">Project Date *</Label>
            <Input
              id="project_date"
              type="date"
              value={formData.project_date}
              onChange={(event) => setFormData((previous) => ({ ...previous, project_date: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(event) =>
                setFormData((previous) => ({ ...previous, status: event.target.value as ProjectStatus }))
              }
              className="admin-select"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Technologies</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a technology (React, Node.js, PostgreSQL...)"
              value={technologyInput}
              onChange={(event) => setTechnologyInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddTechnology();
                }
              }}
            />
            <Button type="button" onClick={handleAddTechnology}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.technologies.map((technology) => (
              <Badge key={technology} variant="secondary" className="gap-1">
                {technology}
                <button
                  type="button"
                  onClick={() => handleRemoveTechnology(technology)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Project Image (JPG, PNG, WEBP - max 5MB)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            {imagePreviewUrl ? (
              <div className="space-y-4">
                <img src={imagePreviewUrl} alt="Preview" className="w-full h-56 object-cover rounded-lg" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData((previous) => ({ ...previous, image_path: null }));
                    setImagePreviewUrl('');
                  }}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="max-w-xs mx-auto"
                />
                {uploading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input
            id="github_url"
            type="url"
            placeholder="https://github.com/..."
            value={formData.github_url}
            onChange={(event) => setFormData((previous) => ({ ...previous, github_url: event.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo_url">Live Demo URL (Web/App link)</Label>
          <Input
            id="demo_url"
            type="url"
            placeholder="https://..."
            value={formData.demo_url}
            onChange={(event) => setFormData((previous) => ({ ...previous, demo_url: event.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label>Demo Video (MP4, WEBM, MOV - max 100MB)</Label>
            {formData.project_type === 'mobile' && (
              <span className="text-xs text-muted-foreground">Recommended for mobile projects</span>
            )}
          </div>
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            {demoVideoPreviewUrl ? (
              <div className="space-y-4">
                <video src={demoVideoPreviewUrl} controls className="w-full rounded-lg bg-black" preload="metadata" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData((previous) => ({ ...previous, demo_video_path: null }));
                    setDemoVideoPreviewUrl('');
                  }}
                >
                  Remove Video
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  {uploading ? 'Uploading...' : 'Upload a demo video (optional)'}
                </p>
                <Input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleDemoVideoUpload}
                  disabled={uploading}
                  className="max-w-xs mx-auto"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading || uploading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Update Project'
            ) : (
              'Create Project'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/projects')}>
            Cancel
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
