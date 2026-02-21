'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Pill, Cross, Sun, Moon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-90 transition-opacity">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white">
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
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} aria-label="Toggle dark mode" className="h-9 w-9 rounded-lg p-0">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Creators
        </h1>
        <p className="text-muted-foreground mb-8">
          PillSnap was created by the following contributors.
        </p>

        <div className="space-y-4">
          <Card className="border-l-4 border-l-[hsl(var(--primary))]">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                <User className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">Shiv Patel</p>
                <p className="text-sm text-muted-foreground">Author</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--primary))]">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                <User className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">Ryder Pongracic</p>
                <p className="text-sm text-muted-foreground">Co-Author</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="mt-8">
          <Link href="/" className="text-[hsl(var(--primary))] font-semibold hover:underline">
            ← Back to Pill Identifier
          </Link>
        </p>
      </main>
    </div>
  );
}
