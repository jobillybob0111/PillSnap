'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Pill, Cross, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WelcomeBackground } from '@/components/WelcomeBackground';

export default function CreatorsPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <WelcomeBackground />
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="sticky top-0 z-40 border-b border-gray-200/80 bg-white"
      >
        <div className="mx-auto flex h-16 max-w-clinical items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-foreground transition-colors duration-200 hover:opacity-90">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-medical-red text-white">
              <Pill className="h-4 w-4" strokeWidth={2} />
              <Cross className="absolute bottom-1 right-1 h-2 w-2 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-800">Pill<span className="text-medical-red">Snap</span></span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <span className="text-sm font-medium text-foreground">Creators</span>
          </nav>
        </div>
      </motion.header>

      <main className="relative flex-1 mx-auto w-full max-w-clinical px-4 pt-8 pb-16 sm:px-6">
        {/* Hero-style title - same as home */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
            Creators
          </h1>
          <span className="block mt-2 h-0.5 w-16 mx-auto rounded-full bg-medical-red/80" aria-hidden />
          <p className="mt-4 text-lg text-muted-foreground">
            PillSnap was created by the following contributors.
          </p>
        </motion.div>

        {/* Creator cards - same panel style as home */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
          >
            <Card className="rounded-[24px] border border-pink-200/60 bg-white shadow-soft overflow-hidden">
              <CardContent className="py-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-medical-red">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">Shiv Patel</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
          >
            <Card className="rounded-[24px] border border-pink-200/60 bg-white shadow-soft overflow-hidden">
              <CardContent className="py-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-medical-red">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">Ryder Pongracic</p>
                  <p className="text-sm text-muted-foreground">Co-Author</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.19, ease: 'easeOut' }}
          >
            <Card className="rounded-[24px] border border-pink-200/60 bg-white shadow-soft overflow-hidden">
              <CardContent className="py-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-medical-red">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">Hussam Idris</p>
                  <p className="text-sm text-muted-foreground">Co-Author</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26, ease: 'easeOut' }}
          >
            <Card className="rounded-[24px] border border-pink-200/60 bg-white shadow-soft overflow-hidden">
              <CardContent className="py-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-medical-red">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">Abba Ndomo</p>
                  <p className="text-sm text-muted-foreground">Co-Author</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <p className="mt-8 text-center">
          <Link href="/" className="text-medical-red font-semibold hover:underline transition-colors">
            ← Back to Pill Identifier
          </Link>
        </p>
      </main>
    </div>
  );
}
