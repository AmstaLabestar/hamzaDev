import { useMemo, useState } from 'react';
import { FileUp, Eye, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
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
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import { documentsService } from '@/features/documents/services/documents.service';
import { useAuth } from '@/app/contexts/AuthContext';

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminDocuments() {
  const { user } = useAuth();
  const { query, documents, total, totalPages, loading, setPage, uploadVersion, setActive, remove } = useDocuments();
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const isEmpty = useMemo(() => !loading && documents.length === 0, [loading, documents.length]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      toast.error('Authentication required before upload');
      return;
    }

    setUploading(true);
    try {
      await uploadVersion(file, user.id);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handlePreview = async (id: string, storagePath: string) => {
    try {
      setPreviewingId(id);
      const signedUrl = await documentsService.getSignedUrl(storagePath, 600);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open document preview:', error);
      toast.error('Unable to open preview');
    } finally {
      setPreviewingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Documents</h1>
          <p className="text-muted-foreground">Upload and manage CV versions in private storage.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <label className="text-sm font-medium">Upload new CV version (PDF only, max 10MB)</label>
        <div className="mt-3 flex items-center gap-3">
          <Input type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} />
          <div className="inline-flex items-center text-sm text-muted-foreground">
            <FileUp className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Choose a PDF to upload'}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <Table>
            <TableBody>
              {Array.from({ length: query.pageSize }).map((_, index) => (
                <TableRowSkeleton key={`document-loading-${index}`} />
              ))}
            </TableBody>
          </Table>
        ) : isEmpty ? (
          <div className="p-8 text-center text-muted-foreground">No document versions uploaded yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>v{document.version}</TableCell>
                  <TableCell>{document.file_name}</TableCell>
                  <TableCell>{formatFileSize(document.size_bytes)}</TableCell>
                  <TableCell>{new Date(document.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={document.is_active} onCheckedChange={() => void setActive(document.id)} />
                      <Badge variant={document.is_active ? 'default' : 'secondary'}>
                        {document.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void handlePreview(document.id, document.storage_path)}
                        disabled={previewingId === document.id}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!document.is_active && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => void setActive(document.id)}>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </Button>
                      )}
                      <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteId(document.id)}>
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

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this document?</AlertDialogTitle>
            <AlertDialogDescription>
              The version will be soft deleted and removed from active history.
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
