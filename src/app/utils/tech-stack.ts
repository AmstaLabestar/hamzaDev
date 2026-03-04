export type TechStackId =
  | 'react'
  | 'tailwindcss'
  | 'daisyui'
  | 'nodejs'
  | 'express'
  | 'nestjs'
  | 'django'
  | 'drf';

export interface TechStackItem {
  id: TechStackId;
  label: string;
  simpleIconSlug: string;
  brandColor: string;
  aliases: readonly string[];
}

export const CORE_TECH_STACK: readonly TechStackItem[] = [
  {
    id: 'react',
    label: 'React',
    simpleIconSlug: 'react',
    brandColor: '#61DAFB',
    aliases: ['react', 'reactjs', 'react.js'],
  },
  {
    id: 'tailwindcss',
    label: 'Tailwind CSS',
    simpleIconSlug: 'tailwindcss',
    brandColor: '#06B6D4',
    aliases: ['tailwind', 'tailwindcss', 'tailwind css'],
  },
  {
    id: 'daisyui',
    label: 'daisyUI',
    simpleIconSlug: 'daisyui',
    brandColor: '#1AD1A5',
    aliases: ['daisyui', 'daisy ui'],
  },
  {
    id: 'nodejs',
    label: 'Node.js',
    simpleIconSlug: 'nodedotjs',
    brandColor: '#5FA04E',
    aliases: ['node', 'nodejs', 'node.js'],
  },
  {
    id: 'express',
    label: 'Express',
    simpleIconSlug: 'express',
    brandColor: '#FFFFFF',
    aliases: ['express', 'expressjs', 'express.js'],
  },
  {
    id: 'nestjs',
    label: 'NestJS',
    simpleIconSlug: 'nestjs',
    brandColor: '#E0234E',
    aliases: ['nestjs', 'nest', 'nest.js'],
  },
  {
    id: 'django',
    label: 'Django',
    simpleIconSlug: 'django',
    brandColor: '#092E20',
    aliases: ['django'],
  },
  {
    id: 'drf',
    label: 'DRF',
    simpleIconSlug: 'djangorestframework',
    brandColor: '#A30000',
    aliases: ['drf', 'django rest framework', 'django-rest-framework', 'djangorestframework'],
  },
];

function normalizeAlias(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const TECH_STACK_BY_ALIAS = CORE_TECH_STACK.reduce((accumulator, item) => {
  item.aliases.forEach((alias) => {
    accumulator.set(normalizeAlias(alias), item);
  });
  return accumulator;
}, new Map<string, TechStackItem>());

export function findTechStackItem(name: string): TechStackItem | null {
  const normalized = normalizeAlias(name);
  return TECH_STACK_BY_ALIAS.get(normalized) ?? null;
}
