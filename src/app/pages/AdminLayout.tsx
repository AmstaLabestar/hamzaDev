import { Outlet, useNavigate, Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Briefcase, 
  BrainCircuit,
  FileText,
  UserCircle2,
  Settings, 
  LogOut,
  Menu,
  X,
  Eye,
  Languages
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function AdminLayout() {
  const { user, loading, signout, isAuthenticated, isAdmin } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isFr = language === 'fr';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }

    if (!loading && isAuthenticated && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  const handleSignout = async () => {
    try {
      await signout();
    } finally {
      navigate('/login');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: isFr ? 'Tableau de bord' : 'Dashboard', path: '/admin' },
    { icon: FolderKanban, label: isFr ? 'Projets' : 'Projects', path: '/admin/projects' },
    { icon: Briefcase, label: isFr ? 'Experiences' : 'Experiences', path: '/admin/experiences' },
    { icon: BrainCircuit, label: isFr ? 'Competences' : 'Skills', path: '/admin/skills' },
    { icon: FileText, label: isFr ? 'Documents' : 'Documents', path: '/admin/documents' },
    { icon: UserCircle2, label: isFr ? 'Profil' : 'Profile', path: '/admin/profile' },
    { icon: Settings, label: isFr ? 'Parametres' : 'Settings', path: '/admin/settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{isFr ? 'Chargement...' : 'Loading...'}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold">{isFr ? 'Panneau Admin' : 'Admin Panel'}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to="/">
              <Eye className="h-4 w-4 mr-2" />
              {isFr ? 'Portfolio' : 'Portfolio'}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={isFr ? 'Passer en anglais' : 'Switch to French'}>
            <Languages className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isFr ? 'Panneau Admin' : 'Admin Panel'}
            </h1>
          </div>

          <div className="px-4 pt-4 space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/">
                <Eye className="h-4 w-4 mr-2" />
                {isFr ? 'Retour au portfolio' : 'Back to Portfolio'}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={toggleLanguage}
              aria-label={isFr ? 'Passer en anglais' : 'Switch to French'}
            >
              <Languages className="h-4 w-4 mr-2" />
              {isFr ? 'Langue: FR' : 'Language: EN'}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.user_metadata?.name || (isFr ? 'Admin' : 'Admin')}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => void handleSignout()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isFr ? 'Se deconnecter' : 'Logout'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
