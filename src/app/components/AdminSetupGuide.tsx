import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function AdminSetupGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-8"
    >
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Setup Required</AlertTitle>
        <AlertDescription className="space-y-4 mt-2">
          <p>
            To use the admin panel, configure your admin email and create the matching Supabase account first.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-mono mb-2">Quick Setup:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Set <code>VITE_ADMIN_EMAIL</code> in your <code>.env</code> file.</li>
              <li>Create the same user in Supabase Authentication.</li>
              <li>Add that user to <code>public.admin_users</code> with <code>is_active=true</code>.</li>
            </ol>
          </div>
          <p className="text-sm">
            Only the configured admin email will be allowed to sign in to the back-office.
          </p>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
