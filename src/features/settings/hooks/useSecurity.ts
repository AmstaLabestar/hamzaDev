import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { settingsService } from '@/features/settings/services/settings.service';
import type { AdminLogRecord, SecurityOverview, SessionInfo } from '@/features/settings/types';

export function useSecurity(isAdmin: boolean) {
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [logs, setLogs] = useState<AdminLogRecord[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize] = useState(10);
  const [logsTotal, setLogsTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const totalPages = useMemo(() => {
    if (logsTotal === 0) return 1;
    return Math.ceil(logsTotal / logsPageSize);
  }, [logsTotal, logsPageSize]);

  const loadSecurityState = useCallback(async () => {
    setLoading(true);
    try {
      const [nextOverview, nextSession, nextLogs] = await Promise.all([
        settingsService.getSecurityOverview(isAdmin),
        settingsService.getSessionInfo(),
        settingsService.listAdminLogs(logsPage, logsPageSize),
      ]);

      setOverview(nextOverview);
      setSessionInfo(nextSession);
      setLogs(nextLogs.data);
      setLogsTotal(nextLogs.total);
    } catch (error) {
      console.error('Failed to load security state:', error);
      toast.error('Unable to load security settings');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, logsPage, logsPageSize]);

  useEffect(() => {
    void loadSecurityState();
  }, [loadSecurityState]);

  const changePassword = useCallback(async (newPassword: string) => {
    setChangingPassword(true);
    try {
      await settingsService.changePassword(newPassword);
      toast.success('Password updated');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to update password');
    } finally {
      setChangingPassword(false);
    }
  }, []);

  const revokeAllSessions = useCallback(async () => {
    setRevoking(true);
    try {
      await settingsService.signOutAllSessions();
      toast.success('All sessions revoked');
    } catch (error) {
      console.error('Failed to revoke sessions:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to revoke sessions');
    } finally {
      setRevoking(false);
    }
  }, []);

  return {
    overview,
    sessionInfo,
    logs,
    logsPage,
    setLogsPage,
    logsTotal,
    logsPageSize,
    totalPages,
    loading,
    changingPassword,
    revoking,
    reload: loadSecurityState,
    changePassword,
    revokeAllSessions,
  };
}

