import type { AppLanguage } from '@/app/contexts/LanguageContext';

type Translations = {
  navbar: {
    home: string;
    about: string;
    experiences: string;
    projects: string;
    contact: string;
    lightMode: string;
    darkMode: string;
    switchLanguage: string;
  };
  hero: {
    greeting: string;
    roleSuffix: string;
    viewWork: string;
    downloadCv: string;
    codeConst: string;
    codeDeveloper: string;
    codeName: string;
    codeTitle: string;
    codePassion: string;
    codePassionValue: string;
    defaultName: string;
    defaultTitle: string;
    defaultBio: string;
  };
  about: {
    title: string;
    subtitle: string;
    profileLabel: string;
    skillsTitle: string;
    noSkills: string;
    techFrontend: string;
    techBackend: string;
    techFullStack: string;
    techUiUx: string;
    defaultName: string;
    defaultTitle: string;
    defaultBio: string;
  };
  experiences: {
    title: string;
    subtitle: string;
    present: string;
    empty: string;
  };
  projects: {
    title: string;
    subtitle: string;
    code: string;
    liveDemo: string;
    empty: string;
  };
  contact: {
    title: string;
    subtitle: string;
    email: string;
    social: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sending: string;
    send: string;
    sentSuccess: string;
  };
  footer: {
    rightsReserved: string;
  };
};

export const translations: Record<AppLanguage, Translations> = {
  fr: {
    navbar: {
      home: 'Accueil',
      about: 'A propos',
      experiences: 'Experiences',
      projects: 'Projets',
      contact: 'Contact',
      lightMode: 'Mode clair',
      darkMode: 'Mode sombre',
      switchLanguage: 'Passer en anglais',
    },
    hero: {
      greeting: 'Salut, je suis',
      roleSuffix: 'Developpeur',
      viewWork: 'Voir mes projets',
      downloadCv: 'Telecharger CV',
      codeConst: 'const',
      codeDeveloper: 'developpeur',
      codeName: 'nom',
      codeTitle: 'titre',
      codePassion: 'passion',
      codePassionValue: 'Construire des produits fiables',
      defaultName: 'Labestar',
      defaultTitle: 'Full Stack',
      defaultBio: "Je suis un developpeur passionne specialise dans la creation d'applications web modernes et performantes.",
    },
    about: {
      title: 'A propos de moi',
      subtitle: 'Decouvrez mes competences et mon experience',
      profileLabel: 'Profil',
      skillsTitle: 'Competences & Technologies',
      noSkills: 'Aucune competence publiee pour le moment.',
      techFrontend: 'Frontend',
      techBackend: 'Backend',
      techFullStack: 'Full Stack',
      techUiUx: 'UI/UX',
      defaultName: 'Proprietaire du portfolio',
      defaultTitle: 'Developpeur Full Stack',
      defaultBio: 'Je construis des applications web modernes avec un focus sur la fiabilite, la performance et la qualite produit.',
    },
    experiences: {
      title: 'Experience professionnelle',
      subtitle: 'Mon parcours et mes etapes importantes',
      present: 'Present',
      empty: "Aucune experience publiee pour le moment.",
    },
    projects: {
      title: 'Projets en avant',
      subtitle: 'Quelques travaux recents et projets personnels',
      code: 'Code',
      liveDemo: 'Demo live',
      empty: 'Aucun projet publie pour le moment.',
    },
    contact: {
      title: 'Contact',
      subtitle: 'Vous avez un projet ? Construisons quelque chose de fiable ensemble.',
      email: 'Email',
      social: 'Reseaux',
      nameLabel: 'Nom',
      namePlaceholder: 'Votre nom',
      emailLabel: 'Email',
      emailPlaceholder: 'votre.email@example.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Parlez-moi de votre projet...',
      sending: 'Envoi...',
      send: 'Envoyer le message',
      sentSuccess: 'Message envoye avec succes !',
    },
    footer: {
      rightsReserved: 'Tous droits reserves.',
    },
  },
  en: {
    navbar: {
      home: 'Home',
      about: 'About',
      experiences: 'Experiences',
      projects: 'Projects',
      contact: 'Contact',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      switchLanguage: 'Switch to French',
    },
    hero: {
      greeting: 'Hi, I am',
      roleSuffix: 'Developer',
      viewWork: 'View My Work',
      downloadCv: 'Download CV',
      codeConst: 'const',
      codeDeveloper: 'developer',
      codeName: 'name',
      codeTitle: 'title',
      codePassion: 'passion',
      codePassionValue: 'Building reliable products',
      defaultName: 'Labestar',
      defaultTitle: 'Full Stack',
      defaultBio: 'I am a passionate developer specialized in building modern and reliable web applications.',
    },
    about: {
      title: 'About Me',
      subtitle: 'Get to know more about my skills and experience',
      profileLabel: 'Profile',
      skillsTitle: 'Skills & Technologies',
      noSkills: 'No published skills yet.',
      techFrontend: 'Frontend',
      techBackend: 'Backend',
      techFullStack: 'Full Stack',
      techUiUx: 'UI/UX',
      defaultName: 'Portfolio Owner',
      defaultTitle: 'Full Stack Developer',
      defaultBio: 'I build modern web applications with a focus on reliability, performance, and product quality.',
    },
    experiences: {
      title: 'Work Experience',
      subtitle: 'My professional journey and key milestones',
      present: 'Present',
      empty: 'No published experiences available yet.',
    },
    projects: {
      title: 'Featured Projects',
      subtitle: 'Some of my recent work and side projects',
      code: 'Code',
      liveDemo: 'Live Demo',
      empty: 'No published projects available yet.',
    },
    contact: {
      title: 'Get In Touch',
      subtitle: "Have a project in mind? Let's work together to create something reliable.",
      email: 'Email',
      social: 'Social',
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'your.email@example.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Tell me about your project...',
      sending: 'Sending...',
      send: 'Send Message',
      sentSuccess: 'Message sent successfully!',
    },
    footer: {
      rightsReserved: 'All rights reserved.',
    },
  },
};
