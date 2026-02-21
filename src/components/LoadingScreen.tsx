'use client';

import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[#FDFEFE]/98 backdrop-blur-sm"
    >
      <motion.div
        animate={{
          scale: [1, 1.03, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex h-24 w-24 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/80 text-medical-red"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <Pill className="h-12 w-12" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 4 }}
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
        className="h-1 w-56 overflow-hidden rounded-full bg-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <motion.div
          className="h-full min-w-[30%] rounded-full bg-medical-red/80"
          style={{ width: '30%' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
