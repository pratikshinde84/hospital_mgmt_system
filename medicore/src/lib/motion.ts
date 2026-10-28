// Central re-export of framer-motion to fix module resolution issues
// All components should import from here, not directly from 'framer-motion'
export { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';
export type { Variants, Transition, MotionProps } from 'framer-motion';
