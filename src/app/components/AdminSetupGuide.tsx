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
            To use the admin panel, you need to create an admin account first.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-mono mb-2">Quick Setup:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Open browser console (F12)</li>
              <li>Run this code to create an admin account:</li>
            </ol>
            <pre className="text-xs mt-2 p-2 bg-background rounded overflow-x-auto">
{`fetch('https://unlwiuxgwwivdprhmjbn.supabase.co/functions/v1/server/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin'
  })
}).then(r => r.json()).then(console.log)`}
            </pre>
          </div>
          <p className="text-sm">
            Then use <strong>admin@example.com</strong> / <strong>admin123</strong> to login.
          </p>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
