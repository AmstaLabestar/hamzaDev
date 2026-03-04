import { lazy, Suspense } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/sections';
import { ScrollProgressBar } from '../components/ui/ScrollProgressBar';
import { SectionReveal } from '../components/ui/SectionReveal';
import { useMediaQuery } from '../hooks';

const MobileLayout = lazy(async () => ({
  default: (await import('../components/mobile/MobileLayout')).MobileLayout,
}));

const AboutSection = lazy(async () => ({
  default: (await import('../components/sections/AboutSection')).AboutSection,
}));

const ExperiencesSection = lazy(async () => ({
  default: (await import('../components/sections/ExperiencesSection')).ExperiencesSection,
}));

const ProjectsSection = lazy(async () => ({
  default: (await import('../components/sections/ProjectsSection')).ProjectsSection,
}));

const ContactSection = lazy(async () => ({
  default: (await import('../components/sections/ContactSection')).ContactSection,
}));

const Footer = lazy(async () => ({
  default: (await import('../components/sections/Footer')).Footer,
}));

const ScrollToTop = lazy(async () => ({
  default: (await import('../components/sections/ScrollToTop')).ScrollToTop,
}));

function SectionFallback({ className = 'py-16' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="mx-auto h-32 w-full max-w-7xl animate-pulse rounded-2xl bg-card/60" />
    </div>
  );
}

export default function HomePage() {
  const isMobile = useMediaQuery('(max-width: 1023px)');

  if (isMobile) {
    return (
      <Suspense fallback={<div className="min-h-screen theme-page" />}>
        <MobileLayout />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen theme-page">
      <ScrollProgressBar />
      <Navbar />
      <div aria-hidden className="desktop-aurora pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="desktop-aurora__orb desktop-aurora__orb--one" />
        <div className="desktop-aurora__orb desktop-aurora__orb--two" />
        <div className="desktop-aurora__orb desktop-aurora__orb--three" />
      </div>
      <HeroSection />
      <SectionReveal delay={0.04}>
        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
        </Suspense>
      </SectionReveal>
      <SectionReveal delay={0.08}>
        <Suspense fallback={<SectionFallback />}>
          <ExperiencesSection />
        </Suspense>
      </SectionReveal>
      <SectionReveal delay={0.12}>
        <Suspense fallback={<SectionFallback />}>
          <ProjectsSection />
        </Suspense>
      </SectionReveal>
      <SectionReveal delay={0.16}>
        <Suspense fallback={<SectionFallback className="py-12" />}>
          <ContactSection />
        </Suspense>
      </SectionReveal>
      <Suspense fallback={<SectionFallback className="py-8" />}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
    </div>
  );
}
