import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Horizontal wipe line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] bg-primary z-20"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: [0, 1, 0], originX: [0, 0, 1] }}
        transition={{ duration: 0.6, times: [0, 0.4, 1], ease: 'easeInOut' }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
          opacity: { duration: 0.3 },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
