'use client';

import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm"
    >
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
      >
        <Pill className="h-10 w-10" />
      </motion.div>
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-lg font-medium text-foreground"
        >
          Identifying your pill…
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-1 text-sm text-muted-foreground"
        >
          Searching our database
        </motion.p>
      </div>
      <motion.div
        className="h-1 w-48 overflow-hidden rounded-full bg-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-full min-w-[40%] rounded-full bg-[hsl(var(--primary))]/80"
          style={{ width: '40%' }}
          animate={{
            x: ['-100%', '250%'],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
