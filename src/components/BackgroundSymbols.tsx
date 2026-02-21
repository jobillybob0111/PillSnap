'use client';

import { Cross, Shield, Dna, Stethoscope } from 'lucide-react';

const size = 280;
const blur = 2;

export function BackgroundSymbols() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-20 -left-20 opacity-[0.05] dark:opacity-[0.04]"
        style={{ filter: `blur(${blur}px)` }}
      >
        <Cross size={size} strokeWidth={1} className="text-[hsl(var(--primary))]" />
      </div>
      <div
        className="absolute -top-10 -right-10 opacity-[0.05] dark:opacity-[0.04]"
        style={{ filter: `blur(${blur}px)` }}
      >
        <Shield size={size} strokeWidth={1} className="text-[hsl(var(--primary))]" />
      </div>
      <div
        className="absolute bottom-0 -left-16 opacity-[0.05] dark:opacity-[0.04]"
        style={{ filter: `blur(${blur}px)` }}
      >
        <Dna size={size} strokeWidth={1} className="text-[hsl(var(--primary))]" />
      </div>
      <div
        className="absolute bottom-10 -right-16 opacity-[0.05] dark:opacity-[0.04]"
        style={{ filter: `blur(${blur}px)` }}
      >
        <Stethoscope size={size} strokeWidth={1} className="text-[hsl(var(--primary))]" />
      </div>
    </div>
  );
}
