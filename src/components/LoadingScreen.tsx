'use client';

import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[#0B1220]/98 backdrop-blur-md"
    >
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.85, 1, 0.85],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 text-cyan-400 shadow-glow"
      >
        <Pill className="h-12 w-12" strokeWidth={1.5} />
      </motion.div>
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg font-medium text-foreground"
        >
          Identifying your pill…
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-1.5 text-sm text-muted-foreground"
        >
          Searching verified databases
        </motion.p>
      </div>
      <motion.div
        className="h-1 w-56 overflow-hidden rounded-full bg-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <motion.div
          className="h-full min-w-[35%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          style={{ width: '35%' }}
          animate={{ x: ['-100%', '350%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
