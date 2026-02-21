'use client';

import { Cross } from 'lucide-react';

export function WelcomeBackground() {
  return (
    <>
      <div className="fixed inset-0 bg-hospital-base" />
      {/* Faint medical cross watermark */}
      <div
        className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.03]"
        aria-hidden
      >
        <Cross className="h-[480px] w-[480px] text-medical-red" strokeWidth={1} />
      </div>
      {/* Soft layered light behind main card area */}
      <div
        className="pointer-events-none fixed inset-0 bg-card-glow"
        aria-hidden
      />
    </>
  );
}
