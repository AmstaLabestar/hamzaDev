import { useEffect } from 'react';
import { API_URL } from '@/lib/supabase-client';

type Hint = {
  rel: 'preconnect' | 'dns-prefetch';
  href: string;
  crossOrigin?: string;
};

function ensureHintLink({ rel, href, crossOrigin }: Hint) {
  const selector = `link[rel="${rel}"][href="${href}"]`;
  if (document.head.querySelector(selector)) {
    return;
  }

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (crossOrigin) {
    link.crossOrigin = crossOrigin;
  }
  link.setAttribute('data-resource-hint', 'true');
  document.head.appendChild(link);
}

export function ResourceHints() {
  useEffect(() => {
    const hints: Hint[] = [
      { rel: 'dns-prefetch', href: '//cdn.simpleicons.org' },
      { rel: 'preconnect', href: 'https://cdn.simpleicons.org', crossOrigin: 'anonymous' },
    ];

    try {
      const supabaseUrl = new URL(API_URL);
      const supabaseOrigin = supabaseUrl.origin;
      hints.push(
        { rel: 'dns-prefetch', href: `//${supabaseUrl.host}` },
        { rel: 'preconnect', href: supabaseOrigin, crossOrigin: 'anonymous' },
      );
    } catch {
      // Ignore invalid URL parsing to avoid blocking app startup.
    }

    hints.forEach(ensureHintLink);
  }, []);

  return null;
}
