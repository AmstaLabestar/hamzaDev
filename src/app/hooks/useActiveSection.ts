import { useEffect, useMemo, useRef, useState } from 'react';

interface UseActiveSectionOptions {
  sectionIds: string[];
  rootMargin?: string;
  threshold?: number | number[];
}

export function useActiveSection({
  sectionIds,
  rootMargin = '-38% 0px -50% 0px',
  threshold = [0.15, 0.35, 0.6],
}: UseActiveSectionOptions) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '');
  const sectionKey = sectionIds.join('|');
  const thresholdKey = useMemo(
    () => (Array.isArray(threshold) ? threshold.join(',') : String(threshold)),
    [threshold],
  );
  const normalizedSectionIds = useMemo(() => sectionIds, [sectionKey]);
  const observerThreshold = useMemo(
    () => (Array.isArray(threshold) ? [...threshold] : threshold),
    [thresholdKey],
  );
  const visibilityMapRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!normalizedSectionIds.length) {
      return;
    }

    visibilityMapRef.current = {};

    const sectionElements = normalizedSectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((element): element is HTMLElement => element !== null);

    if (!sectionElements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sectionId = (entry.target as HTMLElement).id;
          visibilityMapRef.current[sectionId] = entry.isIntersecting ? entry.intersectionRatio : 0;
        }

        const mostVisible = normalizedSectionIds
          .map((sectionId) => ({
            sectionId,
            ratio: visibilityMapRef.current[sectionId] ?? 0,
          }))
          .sort((left, right) => right.ratio - left.ratio)[0];

        if (mostVisible && mostVisible.ratio > 0.05) {
          setActiveSection((previous) => (previous === mostVisible.sectionId ? previous : mostVisible.sectionId));
        }
      },
      {
        rootMargin,
        threshold: observerThreshold,
      },
    );

    for (const sectionElement of sectionElements) {
      observer.observe(sectionElement);
    }

    const handleTopScroll = () => {
      if (window.scrollY < 120) {
        setActiveSection((previous) => (previous === normalizedSectionIds[0] ? previous : normalizedSectionIds[0]));
      }
    };

    window.addEventListener('scroll', handleTopScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleTopScroll);
      observer.disconnect();
    };
  }, [normalizedSectionIds, rootMargin, observerThreshold]);

  return activeSection;
}
