import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from '../../lib/motion';

// Self-drawing animated cross / plus medical icon
export function AnimatedCross({ size = 60, color = '#14b8a6', className = '' }: { size?: number; color?: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 100 100" className={className}>
      <motion.line x1="20" y1="50" x2="80" y2="50" stroke={color} strokeWidth="10" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={inView ? { pathLength: 1, opacity: 1 } : {}} transition={{ duration: 0.6 }} />
      <motion.line x1="50" y1="20" x2="50" y2="80" stroke={color} strokeWidth="10" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={inView ? { pathLength: 1, opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.3 }} />
    </svg>
  );
}

// Pulse live indicator
export function PulseCircle({ color = '#10b981', size = 12 }: { color?: string; size?: number }) {
  return (
    <span className="relative flex" style={{ width: size, height: size }}>
      <motion.span className="absolute inline-flex rounded-full opacity-75" style={{ background: color, width: size, height: size }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
      <span className="relative inline-flex rounded-full" style={{ background: color, width: size, height: size }} />
    </span>
  );
}

// Float-in card on scroll
export function FloatingCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}>
      {children}
    </motion.div>
  );
}

// Stagger container + item
export function StaggerContainer({ children, className = '', stagger = 0.1 }: { children: React.ReactNode; className?: string; stagger?: number }) {
  return (
    <motion.div className={className} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } }}>
      {children}
    </motion.div>
  );
}

// Glow hover wrapper
export function GlowCard({ children, color = 'blue', className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  const glowMap: Record<string, string> = {
    blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]',
    teal: 'hover:shadow-[0_0_30px_rgba(20,184,166,0.25)]',
    emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
    purple: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]',
    amber: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    rose: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]',
  };
  return (
    <motion.div className={`transition-shadow duration-300 ${glowMap[color] ?? glowMap.blue} ${className}`}
      whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      {children}
    </motion.div>
  );
}

// Gradient border card
export function GradientBorderCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={`relative rounded-2xl p-px bg-gradient-to-br from-blue-500 via-teal-400 to-emerald-500 ${className}`}
      whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <div className="rounded-2xl bg-white dark:bg-slate-800 w-full h-full">{children}</div>
    </motion.div>
  );
}

// Wave SVG divider
export function WaveDivider({ flip = false, color = '#f8fafc' }: { flip?: boolean; color?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10">
        <path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,15 1440,25 L1440,50 L0,50 Z" fill={color} />
      </svg>
    </div>
  );
}

// Scroll progress bar
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setProgress(el.scrollHeight - el.clientHeight > 0 ? (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <motion.div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-teal-500 z-[100] origin-left"
      style={{ width: `${progress}%` }} />
  );
}

// Typewriter text
export function TypewriterText({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  return (
    <span ref={ref} className={className}>
      {text.split('').map((char, i) => (
        <motion.span key={i} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: delay + i * 0.04, duration: 0.1 }}>
          {char}
        </motion.span>
      ))}
    </span>
  );
}
