import { useEffect, useMemo, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface UseTypingEffectOptions {
  phrases: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseMs?: number;
  reducedMotion?: boolean;
}

interface UseTypingEffectResult {
  typedText: string;
  phraseIndex: number;
}

export function useTypingEffect({
  phrases,
  typeSpeed = 60,
  deleteSpeed = 36,
  pauseMs = 1200,
  reducedMotion,
}: UseTypingEffectOptions): UseTypingEffectResult {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion;
  const normalizedPhrases = useMemo(() => phrases.filter(Boolean), [phrases]);

  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (normalizedPhrases.length === 0) {
      setTypedText('');
      return;
    }

    if (shouldReduceMotion) {
      if (typedText !== normalizedPhrases[0]) {
        setTypedText(normalizedPhrases[0]);
      }
      if (phraseIndex !== 0) {
        setPhraseIndex(0);
      }
      if (isDeleting) {
        setIsDeleting(false);
      }
      return;
    }

    const activePhrase = normalizedPhrases[phraseIndex] ?? '';
    const isFullyTyped = typedText === activePhrase;
    const isEmpty = typedText.length === 0;

    let timeoutDuration = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && isFullyTyped) {
      timeoutDuration = pauseMs;
    }

    const timeoutId = window.setTimeout(() => {
      if (!isDeleting && !isFullyTyped) {
        setTypedText(activePhrase.slice(0, typedText.length + 1));
        return;
      }

      if (!isDeleting && isFullyTyped) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && !isEmpty) {
        setTypedText(activePhrase.slice(0, typedText.length - 1));
        return;
      }

      setIsDeleting(false);
      setPhraseIndex((previous) => (previous + 1) % normalizedPhrases.length);
    }, timeoutDuration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    normalizedPhrases,
    typedText,
    phraseIndex,
    isDeleting,
    typeSpeed,
    deleteSpeed,
    pauseMs,
    shouldReduceMotion,
  ]);

  return {
    typedText,
    phraseIndex,
  };
}
