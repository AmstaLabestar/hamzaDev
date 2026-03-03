# 🚀 Quick Start Guide

Bienvenue dans votre nouveau portfolio ! Voici comment démarrer en quelques minutes.

## ⚡ Étape 1 : Créer un compte admin

1. Ouvrez la page `/login`
2. Ouvrez la console du navigateur (F12 ou Cmd+Option+I sur Mac)
3. Copiez-collez ce code :

```javascript
fetch('https://unlwiuxgwwivdprhmjbn.supabase.co/functions/v1/make-server-353144cd/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin'
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Compte créé !', data);
  alert('Compte admin créé avec succès ! Utilisez admin@example.com / admin123');
});
```

4. Appuyez sur Entrée

## 🔑 Étape 2 : Se connecter

1. Sur la page `/login`, utilisez :
   - Email: `admin@example.com`
   - Password: `admin123`
2. Cliquez sur "Sign In"

## 📝 Étape 3 : Ajouter votre premier projet

1. Dans le dashboard, allez à "Projects"
2. Cliquez sur "+ New Project"
3. Remplissez le formulaire :
   - **Titre** : Le nom de votre projet
   - **Description** : Une description détaillée
   - **Catégorie** : web, mobile, design, ou other
   - **Tags** : Ajoutez des technologies (ex: React, Node.js)
   - **Image** : Uploadez une capture d'écran (optionnel)
   - **GitHub URL** : Lien vers le code (optionnel)
   - **Live URL** : Lien vers la démo (optionnel)
   - **Active** : Activez pour afficher sur le portfolio public
4. Cliquez sur "Create Project"

## 🎨 Étape 4 : Personnaliser votre portfolio

### Modifier le Hero Section
Éditez `/src/app/components/HeroSection.tsx` :
- Ligne 23-26 : Changez "Hi, I'm" et "Full Stack Developer"
- Ligne 35-37 : Modifiez la description

### Modifier la section About
Éditez `/src/app/components/AboutSection.tsx` :
- Ligne 46-50 : Changez l'emoji et le titre
- Ligne 53-60 : Modifiez la bio
- Ligne 13-24 : Ajoutez/modifiez vos skills

### Modifier le Footer
Éditez `/src/app/components/Footer.tsx` :
- Ligne 8-11 : Mettez à jour vos liens sociaux

### Modifier les couleurs
Éditez `/src/styles/theme.css` :
- Ligne 11 : `--primary` (couleur principale)
- Ligne 16 : `--accent` (couleur d'accentuation)

## 🌓 Changer le thème

Le site supporte automatiquement :
- **Mode clair** par défaut
- **Mode sombre** via le bouton dans la navbar
- **Auto** basé sur les préférences système

## 📸 Uploader des images

1. Dans l'admin, lors de l'ajout d'un projet
2. Cliquez sur la zone de drop ou sélectionnez un fichier
3. L'image est automatiquement uploadée vers Supabase Storage
4. Maximum 5MB par image

## 🔧 Prochaines étapes

### Personnalisation avancée

1. **Ajouter des expériences** :
   - Utilisez l'API `/admin/experiences` (à venir)
   - Ou modifiez directement `ExperiencesSection.tsx`

2. **Modifier le contact** :
   - Éditez `ContactSection.tsx`
   - Ajoutez votre vrai email et numéro

3. **Ajouter un CV téléchargeable** :
   - Uploadez votre CV sur un service (Google Drive, Dropbox)
   - Mettez à jour le lien dans `HeroSection.tsx` ligne 62

### SEO et Meta Tags

Éditez votre fichier HTML principal pour :
- Ajouter un titre et description
- Ajouter des meta tags Open Graph
- Ajouter Google Analytics (optionnel)

## 🐛 Debugging

### Les projets ne s'affichent pas
1. Vérifiez que le projet est **Active** dans l'admin
2. Rechargez la page d'accueil
3. Vérifiez la console pour les erreurs

### L'image ne s'upload pas
1. Vérifiez que l'image fait moins de 5MB
2. Vérifiez que c'est bien un fichier image (jpg, png, webp)
3. Vérifiez votre connexion Supabase

### Erreur d'authentification
1. Vérifiez que vous avez créé le compte admin
2. Vérifiez l'email et le mot de passe
3. Ouvrez la console pour voir les erreurs détaillées

## 💡 Astuces

1. **Utilisez des images optimisées** : Compressez vos images avec TinyPNG avant de les uploader
2. **Écrivez des descriptions claires** : Les utilisateurs passent peu de temps sur chaque projet
3. **Ajoutez des liens GitHub** : Les recruteurs aiment voir le code
4. **Gardez votre portfolio à jour** : Ajoutez régulièrement vos nouveaux projets

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Motion (Framer Motion)](https://motion.dev)

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez la console navigateur pour les erreurs
2. Consultez le fichier PORTFOLIO_README.md
3. Vérifiez les logs Supabase

---

**Bon développement ! 🚀**
