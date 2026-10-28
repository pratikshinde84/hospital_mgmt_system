/* eslint-disable @typescript-eslint/no-explicit-any */
// Global type override for framer-motion compatibility with React 19 + TS 5.7
declare module 'framer-motion' {
  interface MotionProps {
    [key: string]: any;
  }
}
