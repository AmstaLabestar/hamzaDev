import { useState } from 'react';
import { Shield, KeyRound, Clock3, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { useAuth } from '@/app/contexts/AuthContext';
import { useSecurity } from '@/features/settings/hooks/useSecurity';

export default function AdminSettings() {
  const { isAdmin } = useAuth();
  const {
    overview,
    sessionInfo,
    logs,
    logsPage,
    setLogsPage,
    logsTotal,
    totalPages,
    loading,
    changingPassword,
    revoking,
    changePassword,
    revokeAllSessions,
    reload,
  } = useSecurity(isAdmin);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 10) {
      toast.error('Password must be at least 10 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password confirmation does not match');
      return;
    }

    await changePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Security controls, sessions and audit logs.</p>
        </div>
        <Button variant="outline" onClick={() => void reload()} disabled={loading}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Security Overview</h2>
          </div>
          <div className="space-y-2 text-sm">
            <p>Email: <span className="text-muted-foreground">{overview?.email ?? '-'}</span></p>
            <p>Admin: <span className="text-muted-foreground">{overview?.isAdmin ? 'Yes' : 'No'}</span></p>
            <p>Verified: <span className="text-muted-foreground">{overview?.emailConfirmedAt ? 'Yes' : 'No'}</span></p>
            <p>Last Sign-in: <span className="text-muted-foreground">{overview?.lastSignInAt ? new Date(overview.lastSignInAt).toLocaleString() : '-'}</span></p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Change Password</h2>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="new_password">New password</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Minimum 10 characters"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat new password"
              />
            </div>
            <Button
              type="button"
              onClick={() => void handleChangePassword()}
              disabled={changingPassword || newPassword.length < 10 || newPassword !== confirmPassword}
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock3 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Session</h2>
          </div>
          <div className="space-y-2 text-sm">
            <p>Current User: <span className="text-muted-foreground">{sessionInfo?.user?.email ?? '-'}</span></p>
            <p>Expires At: <span className="text-muted-foreground">{sessionInfo?.expiresAt ? new Date(sessionInfo.expiresAt).toLocaleString() : '-'}</span></p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void revokeAllSessions()}
            disabled={revoking}
          >
            {revoking ? 'Revoking...' : 'Sign Out All Sessions'}
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Admin Logs</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {logsTotal} log entr{logsTotal > 1 ? 'ies' : 'y'} - page {logsPage} / {totalPages}
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Actor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.entity_table}</TableCell>
                  <TableCell>{log.actor_id ?? '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={logsPage <= 1}
          onClick={() => setLogsPage(logsPage - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={logsPage >= totalPages}
          onClick={() => setLogsPage(logsPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
