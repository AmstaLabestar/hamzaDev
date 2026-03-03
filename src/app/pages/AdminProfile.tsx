import { useEffect, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useAuth } from '@/app/contexts/AuthContext';
import { useProfile } from '@/features/profile/hooks/useProfile';
import type { ProfileStatus, ProfileWritePayload } from '@/features/profile/types';
import { storageService } from '@/services/storage.service';
import { toast } from 'sonner';

interface ProfileFormState {
  full_name: string;
  professional_title: string;
  bio: string;
  email: string;
  linkedin_url: string;
  github_url: string;
  avatar_path: string | null;
  status: ProfileStatus;
}

const INITIAL_FORM_STATE: ProfileFormState = {
  full_name: '',
  professional_title: '',
  bio: '',
  email: '',
  linkedin_url: '',
  github_url: '',
  avatar_path: null,
  status: 'draft',
};

export default function AdminProfile() {
  const { user } = useAuth();
  const { profile, loading, saving, save } = useProfile(user?.id);
  const [formData, setFormData] = useState<ProfileFormState>(INITIAL_FORM_STATE);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile) {
      setFormData((previous) => ({
        ...previous,
        email: user?.email ?? previous.email,
      }));
      return;
    }

    setFormData({
      full_name: profile.full_name,
      professional_title: profile.professional_title,
      bio: profile.bio,
      email: profile.email,
      linkedin_url: profile.linkedin_url ?? '',
      github_url: profile.github_url ?? '',
      avatar_path: profile.avatar_path,
      status: profile.status,
    });

    if (profile.avatar_path) {
      void storageService
        .getSignedUrl(profile.avatar_path, 3600)
        .then((url) => setAvatarPreviewUrl(url))
        .catch((error) => {
          console.error('Failed to generate avatar preview URL:', error);
        });
    }
  }, [profile, user?.email]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      toast.error('Authentication required before upload');
      return;
    }

    setUploading(true);
    try {
      const { path, previewUrl } = await storageService.uploadAvatar(file, user.id);
      setFormData((previous) => ({ ...previous, avatar_path: path }));
      setAvatarPreviewUrl(previewUrl);
      toast.success('Avatar uploaded');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to upload avatar');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim() || !formData.professional_title.trim() || !formData.bio.trim() || !formData.email.trim()) {
      toast.error('Please complete all required fields');
      return;
    }

    const payload: ProfileWritePayload = {
      full_name: formData.full_name.trim(),
      professional_title: formData.professional_title.trim(),
      bio: formData.bio.trim(),
      email: formData.email.trim(),
      linkedin_url: formData.linkedin_url.trim() || null,
      github_url: formData.github_url.trim() || null,
      avatar_path: formData.avatar_path,
      status: formData.status,
    };

    await save(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your public professional profile information.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="space-y-2">
          <Label>Avatar (JPG, PNG, WEBP - max 5MB)</Label>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {avatarPreviewUrl ? (
                  <img src={avatarPreviewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">No avatar</span>
                )}
              </div>
              <div className="space-y-2">
                <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} disabled={uploading} />
                <div className="text-xs text-muted-foreground flex items-center">
                  <Upload className="h-3 w-3 mr-1" />
                  {uploading ? 'Uploading avatar...' : 'Upload a new avatar image'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(event) => setFormData((previous) => ({ ...previous, full_name: event.target.value }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="professional_title">Professional Title *</Label>
            <Input
              id="professional_title"
              value={formData.professional_title}
              onChange={(event) => setFormData((previous) => ({ ...previous, professional_title: event.target.value }))}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio *</Label>
          <Textarea
            id="bio"
            rows={5}
            value={formData.bio}
            onChange={(event) => setFormData((previous) => ({ ...previous, bio: event.target.value }))}
            disabled={loading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((previous) => ({ ...previous, email: event.target.value }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(event) =>
                setFormData((previous) => ({ ...previous, status: event.target.value as ProfileStatus }))
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              disabled={loading}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={(event) => setFormData((previous) => ({ ...previous, linkedin_url: event.target.value }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              type="url"
              value={formData.github_url}
              onChange={(event) => setFormData((previous) => ({ ...previous, github_url: event.target.value }))}
              disabled={loading}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="button" onClick={() => void handleSave()} disabled={saving || loading || uploading}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

