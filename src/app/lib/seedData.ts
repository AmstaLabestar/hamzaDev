// Helper to initialize demo data

export const seedProjects = [
  {
    title: 'E-Commerce Platform',
    description: 'A full-featured online shopping platform with cart, checkout, payment integration, and admin dashboard. Built with modern technologies for optimal performance.',
    category: 'web',
    tags: ['React', 'Node.js', 'Stripe', 'MongoDB', 'Express'],
    image: '',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    active: true,
  },
  {
    title: 'Task Management App',
    description: 'Collaborative task management application with real-time updates, team collaboration, and project tracking features.',
    category: 'web',
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    image: '',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    active: true,
  },
  {
    title: 'Mobile Fitness Tracker',
    description: 'Cross-platform mobile app for tracking workouts, nutrition, and fitness goals with social features.',
    category: 'mobile',
    tags: ['React Native', 'Firebase', 'Redux', 'TypeScript'],
    image: '',
    githubUrl: 'https://github.com',
    active: true,
  },
];

export const seedExperiences = [
  {
    company: 'Tech Company',
    position: 'Senior Full Stack Developer',
    startDate: '2022-01',
    endDate: '',
    current: true,
    description: 'Leading development of modern web applications using React, TypeScript, and Node.js. Mentoring junior developers and architecting scalable solutions.',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  },
  {
    company: 'Startup Inc',
    position: 'Full Stack Developer',
    startDate: '2020-06',
    endDate: '2021-12',
    current: false,
    description: 'Developed and maintained multiple client projects using modern web technologies. Collaborated with designers and product managers.',
    technologies: ['React', 'Next.js', 'MongoDB', 'Express', 'AWS'],
  },
];

export const seedProfile = {
  name: 'Your Name',
  title: 'Full Stack Developer',
  bio: 'Passionate developer with expertise in building modern web applications.',
  email: 'contact@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  avatar: '',
  socials: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
  skills: [
    'React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS',
    'PostgreSQL', 'MongoDB', 'GraphQL', 'Docker', 'AWS', 'Git', 'REST APIs'
  ],
  resumeUrl: '',
};
