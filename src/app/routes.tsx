import { createBrowserRouter } from 'react-router';
import AdminLayout from './pages/AdminLayout';
import { RequireAdminRoute } from './router/RequireAdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => ({
      Component: (await import('./pages/HomePage')).default,
    }),
  },
  {
    path: '/login',
    lazy: async () => ({
      Component: (await import('./pages/LoginPage')).default,
    }),
  },
  {
    path: '/admin',
    element: (
      <RequireAdminRoute>
        <AdminLayout />
      </RequireAdminRoute>
    ),
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('./pages/AdminDashboard')).default,
        }),
      },
      {
        path: 'projects',
        lazy: async () => ({
          Component: (await import('./pages/AdminProjects')).default,
        }),
      },
      {
        path: 'projects/new',
        lazy: async () => ({
          Component: (await import('./pages/ProjectForm')).default,
        }),
      },
      {
        path: 'projects/:id',
        lazy: async () => ({
          Component: (await import('./pages/ProjectForm')).default,
        }),
      },
      {
        path: 'experiences',
        lazy: async () => ({
          Component: (await import('./pages/AdminExperiences')).default,
        }),
      },
      {
        path: 'skills',
        lazy: async () => ({
          Component: (await import('./pages/AdminSkills')).default,
        }),
      },
      {
        path: 'documents',
        lazy: async () => ({
          Component: (await import('./pages/AdminDocuments')).default,
        }),
      },
      {
        path: 'profile',
        lazy: async () => ({
          Component: (await import('./pages/AdminProfile')).default,
        }),
      },
      {
        path: 'settings',
        lazy: async () => ({
          Component: (await import('./pages/AdminSettings')).default,
        }),
      },
    ],
  },
  {
    path: '*',
    lazy: async () => ({
      Component: (await import('./pages/NotFound')).default,
    }),
  },
]);

