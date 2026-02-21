'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Cross, Sun, Moon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AmbientBackground } from '@/components/AmbientBackground';

export default function CreatorsPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('pillsnap-theme');
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('pillsnap-theme', next ? 'dark' : 'light');
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <AmbientBackground />
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-40 border-b border-white/10 bg-black/20 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-clinical items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-foreground transition-all duration-300 hover:opacity-90 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-glow transition-shadow duration-300 group-hover:shadow-glow-lg">
              <Pill className="h-4 w-4" strokeWidth={2} />
              <Cross className="absolute bottom-1 right-1 h-2 w-2 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold tracking-tight">PillSnap</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <span className="text-sm font-medium text-foreground">Creators</span>
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} aria-label="Toggle dark mode" className="h-9 w-9 rounded-full p-0 border border-transparent hover:border-white/10">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>
        </div>
      </motion.header>

      <main className="relative flex-1 mx-auto w-full max-w-clinical px-4 py-10 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          Creators
        </motion.h1>
        <p className="text-muted-foreground mb-8">
          PillSnap was created by the following contributors.
        </p>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
            <Card className="rounded-2xl border-l-4 border-l-cyan-500 border border-white/10 bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
              <CardContent className="py-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">Shiv Patel</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <Card className="rounded-2xl border-l-4 border-l-cyan-500 border border-white/10 bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
              <CardContent className="py-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">Ryder Pongracic</p>
                  <p className="text-sm text-muted-foreground">Co-Author</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <p className="mt-8">
          <Link href="/" className="text-cyan-400 font-semibold hover:underline">
            ← Back to Pill Identifier
          </Link>
        </p>
      </main>
    </div>
  );
}
