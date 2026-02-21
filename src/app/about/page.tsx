'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Cross, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AmbientBackground } from '@/components/AmbientBackground';

export default function AboutPage() {
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
            <span className="text-sm font-medium text-foreground">About</span>
            <Link href="/creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Creators
            </Link>
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
          className="text-2xl font-bold text-foreground mb-4"
        >
          Why Pill Identification Matters
        </motion.h1>

        <p className="text-muted-foreground leading-relaxed mb-8">
          Knowing what pill you're holding can protect your health and prevent dangerous mistakes. PillSnap is one way to look up medications using the imprint and other details you enter.
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-cyan-400 mb-3">Safety first</h2>
          <p className="text-foreground leading-relaxed">
            Pills can get mixed up or end up unlabeled. Taking the wrong medication or the wrong strength can cause serious harm. Checking what you're about to take — using imprint, color, and shape — helps you confirm it's the right drug and dose.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-cyan-400 mb-3">When it can help</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground leading-relaxed">
            <li>When you take several medications and want to double-check.</li>
            <li>After a refill or switch to a generic — appearance may change.</li>
            <li>When pills are repackaged or stored without labels.</li>
            <li>When you find a pill and need to know what it is.</li>
            <li>In situations where quick identification supports the right response.</li>
            <li>When the imprint is hard to read and you need a simple way to look it up.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-cyan-400 mb-3">How PillSnap works</h2>
          <p className="text-foreground leading-relaxed">
            You enter the letters and numbers on the pill (the imprint), and optionally color and shape. PillSnap looks up matching medications and shows you details like strength, drug class, and common uses — all on this site.
          </p>
        </section>

        <Card className="rounded-2xl border-l-4 border-l-cyan-500 border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Disclaimer:</strong> PillSnap is for informational use only and does not replace professional medical or pharmacy advice. When in doubt, ask a pharmacist or your doctor.
            </p>
          </CardContent>
        </Card>

        <p className="mt-8">
          <Link href="/" className="text-cyan-400 font-semibold hover:underline">
            ← Back to Pill Identifier
          </Link>
        </p>
      </main>
    </div>
  );
}
