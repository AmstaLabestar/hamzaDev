# 🎨 Portfolio Développeur avec Admin Dashboard

Portfolio moderne et professionnel avec espace d'administration complet, conçu pour les développeurs fullstack.

## ✨ Fonctionnalités

### 🌐 Portfolio Public
- **Hero Section** - Présentation impactante avec animations
- **About** - Profil, bio, compétences et stack technique
- **Experiences** - Timeline des expériences professionnelles
- **Projects** - Grid responsive de projets avec filtres par catégorie
- **Contact** - Formulaire de contact
- **Dark Mode** - Thème clair/sombre avec transition fluide
- **Responsive** - Design adaptatif mobile-first

### 🔐 Espace Admin Sécurisé
- **Dashboard** - Vue d'ensemble avec statistiques
- **Gestion des Projets** - CRUD complet avec upload d'images
- **Gestion des Expériences** - Timeline des expériences
- **Upload d'Images** - Système drag & drop avec preview
- **Authentification** - Login sécurisé avec Supabase Auth

## 🛠️ Stack Technique

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Tailwind CSS v4** - Styling moderne
- **Motion (Framer Motion)** - Animations fluides
- **React Router v7** - Navigation
- **Shadcn/ui** - Composants UI
- **Lucide Icons** - Icônes

### Backend
- **Supabase** - Backend as a Service
  - Auth - Authentification
  - Storage - Upload d'images
  - Database (KV Store) - Stockage de données
- **Hono** - Web framework pour Edge Functions
- **Deno** - Runtime pour les fonctions serveur

## 🚀 Démarrage Rapide

### 1. Créer un compte admin

Ouvrez la console navigateur (F12) et exécutez :

```javascript
fetch('https://unlwiuxgwwivdprhmjbn.supabase.co/functions/v1/make-server-353144cd/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin'
  })
}).then(r => r.json()).then(console.log)
```

### 2. Se connecter

- Aller sur `/login`
- Email: `admin@example.com`
- Password: `admin123`

### 3. Ajouter du contenu

1. **Projets** : `/admin/projects` → Nouveau projet
2. **Expériences** : `/admin/experiences` → À venir
3. **Paramètres** : `/admin/settings` → À venir

## 📁 Structure du Projet

```
/src/app/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI (shadcn)
│   ├── Navbar.tsx      # Navigation publique
│   ├── Footer.tsx      # Pied de page
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── ExperiencesSection.tsx
│   ├── ProjectsSection.tsx
│   └── ContactSection.tsx
├── pages/              # Pages
│   ├── HomePage.tsx    # Page publique
│   ├── LoginPage.tsx   # Connexion admin
│   ├── AdminLayout.tsx # Layout admin avec sidebar
│   ├── AdminDashboard.tsx
│   ├── AdminProjects.tsx
│   ├── ProjectForm.tsx
│   └── NotFound.tsx
├── contexts/           # Contextes React
│   └── AuthContext.tsx # Gestion auth
├── lib/               # Utilitaires
│   ├── api.ts         # Client API
│   ├── supabase.ts    # Client Supabase
│   └── seedData.ts    # Données de démo
└── routes.tsx         # Configuration Router

/supabase/functions/server/
└── index.tsx          # API backend (Hono + Supabase)
```

## 🎨 Design System

### Couleurs
- **Primary** : Indigo (#4f46e5 / #6366f1 dark)
- **Accent** : Cyan (#06b6d4 / #0ea5e9 dark)
- **Background** : Blanc / Slate foncé
- **Card** : Blanc / Slate

### Animations
- Transitions douces
- Hover states élégants
- Scroll animations
- Loading states

## 🔌 API Routes

### Auth
- `POST /auth/signup` - Créer un compte
- `POST /auth/signin` - Se connecter
- `GET /auth/session` - Vérifier la session

### Projects
- `GET /projects` - Liste des projets
- `GET /projects/:id` - Détails d'un projet
- `POST /projects` - Créer un projet (protégé)
- `PUT /projects/:id` - Modifier un projet (protégé)
- `DELETE /projects/:id` - Supprimer un projet (protégé)

### Experiences
- `GET /experiences` - Liste des expériences
- `POST /experiences` - Créer une expérience (protégé)
- `PUT /experiences/:id` - Modifier une expérience (protégé)
- `DELETE /experiences/:id` - Supprimer une expérience (protégé)

### Upload
- `POST /upload` - Upload d'image (protégé)
- `GET /files/:path` - Obtenir URL signée (protégé)

## 💾 Stockage des Données

Les données sont stockées dans le KV Store de Supabase :

- `projects` - Liste des projets
- `experiences` - Liste des expériences
- `profile` - Informations du profil

Les images sont stockées dans Supabase Storage dans le bucket `make-353144cd-portfolio`.

## 🎯 Prochaines Étapes

- [ ] Formulaire complet de gestion des expériences
- [ ] Page de paramètres pour éditer le profil
- [ ] Analytics dashboard
- [ ] Export du portfolio en PDF
- [ ] Multilingue (FR/EN)
- [ ] Blog intégré

## 📝 Notes Importantes

- Les images uploadées sont stockées avec des URLs signées valides 1 an
- L'authentification utilise Supabase Auth avec confirmation auto
- Le thème sombre est géré par next-themes
- Les animations utilisent Motion (anciennement Framer Motion)

## 🤝 Support

Pour toute question ou problème, consultez la documentation Supabase ou les guides React Router.

---

**Créé avec ❤️ pour les développeurs**
