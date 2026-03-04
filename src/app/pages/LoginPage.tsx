import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { AdminSetupGuide } from '../components/AdminSetupGuide';
import { getConfiguredAdminEmail } from '@/app/utils/admin-access';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const configuredAdminEmail = useMemo(() => getConfiguredAdminEmail(), []);
  const isAdminEmailConfigured = Boolean(configuredAdminEmail);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    navigate(isAdmin ? '/admin' : '/', { replace: true });
  }, [isAdmin, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdminEmailConfigured) {
      toast.error('Admin access is not configured. Set VITE_ADMIN_EMAIL in your environment.');
      return;
    }

    if (configuredAdminEmail && email.trim().toLowerCase() !== configuredAdminEmail) {
      toast.error('Access denied. This admin area is restricted to the configured administrator email.');
      return;
    }

    setLoading(true);

    try {
      await signin(email, password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof Error && error.message.includes('Email logins are disabled')) {
        toast.error('Supabase Email login is disabled. Enable it in Authentication > Providers > Email.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
            <p className="text-muted-foreground">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={configuredAdminEmail ?? 'admin@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !isAdminEmailConfigured}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isAdminEmailConfigured ? (
              <p>Use the configured administrator account only.</p>
            ) : (
              <p>Admin access is disabled until `VITE_ADMIN_EMAIL` is configured.</p>
            )}
          </div>
        </div>

        <AdminSetupGuide />
      </motion.div>
    </div>
  );
}
