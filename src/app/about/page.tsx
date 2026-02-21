'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Pill, Cross } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WelcomeBackground } from '@/components/WelcomeBackground';

export default function AboutPage() {
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
            <span className="text-sm font-medium text-foreground">About</span>
            <Link href="/creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Creators
            </Link>
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
            Why Pill Identification Matters
          </h1>
          <span className="block mt-2 h-0.5 w-16 mx-auto rounded-full bg-medical-red/80" aria-hidden />
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Knowing what pill you're holding can protect your health and prevent dangerous mistakes.
          </p>
        </motion.div>

        {/* Main content card - same style as home panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
        >
          <Card className="rounded-[24px] border border-pink-200/60 bg-white shadow-soft overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-8">
              <section>
                <h2 className="text-lg font-semibold text-medical-red mb-3">Safety first</h2>
                <p className="text-foreground leading-relaxed text-base">
                  Pills can get mixed up or end up unlabeled. Taking the wrong medication or the wrong strength can cause serious harm. Checking what you're about to take — using imprint, color, and shape — helps you confirm it's the right drug and dose.
                </p>
              </section>

              <section className="pt-2 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-medical-red mb-3">When it can help</h2>
                <ul className="list-disc pl-6 space-y-2 text-foreground leading-relaxed text-base">
                  <li>When you take several medications and want to double-check.</li>
                  <li>After a refill or switch to a generic — appearance may change.</li>
                  <li>When pills are repackaged or stored without labels.</li>
                  <li>When you find a pill and need to know what it is.</li>
                  <li>In situations where quick identification supports the right response.</li>
                  <li>When the imprint is hard to read and you need a simple way to look it up.</li>
                </ul>
              </section>

              <section className="pt-2 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-medical-red mb-3">How PillSnap works</h2>
                <p className="text-foreground leading-relaxed text-base">
                  You enter the letters and numbers on the pill (the imprint), and optionally color and shape. PillSnap looks up matching medications and shows you details like strength, drug class, and common uses — all on this site.
                </p>
              </section>

              <Card className="rounded-2xl border border-gray-200 bg-gray-50/80">
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Disclaimer:</strong> PillSnap is for informational use only and does not replace professional medical or pharmacy advice. When in doubt, ask a pharmacist or your doctor.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>

        <p className="mt-8 text-center">
          <Link href="/" className="text-medical-red font-semibold hover:underline transition-colors">
            ← Back to Pill Identifier
          </Link>
        </p>
      </main>
    </div>
  );
}
