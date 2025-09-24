'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function Loading() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-text font-medium">Carregando...</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
