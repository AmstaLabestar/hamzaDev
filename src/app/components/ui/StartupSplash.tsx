import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/app/hooks';

export function StartupSplash() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Loading Labestar"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.01 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, filter: 'blur(2px)' }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#04070f] text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.14),transparent_38%),radial-gradient(circle_at_80%_85%,rgba(56,189,248,0.08),transparent_40%)]" />

      <div className="relative z-10 flex flex-col items-center gap-5 px-6">
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 0.78, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.38, delay: prefersReducedMotion ? 0 : 0.08 }}
          className="text-[0.62rem] uppercase tracking-[0.42em] text-white/60"
          style={{ fontFamily: '"Sora", "Plus Jakarta Sans", "Segoe UI", sans-serif' }}
        >
          Experience Loading
        </motion.p>

        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10, letterSpacing: '0.18em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.08em' }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.52, delay: prefersReducedMotion ? 0 : 0.12 }}
          className="text-3xl font-semibold sm:text-4xl"
          style={{ fontFamily: '"Sora", "Plus Jakarta Sans", "Segoe UI", sans-serif' }}
        >
          Labestar
        </motion.h1>

        <div className="relative mt-1 h-[2px] w-52 overflow-hidden rounded-full bg-white/15">
          {prefersReducedMotion ? (
            <div className="h-full w-2/3 bg-white/60" />
          ) : (
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-sky-300 to-transparent"
              animate={{ x: ['-120%', '220%'] }}
              transition={{ duration: 1.2, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
