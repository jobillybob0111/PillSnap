'use client';

import { Database, ShieldCheck, FileText } from 'lucide-react';

const items = [
  { icon: Database, label: 'Verified Drug Database' },
  { icon: ShieldCheck, label: 'Secure Image Processing' },
  { icon: FileText, label: 'Informational Use Only' },
];

export function TrustBadge() {
  return (
    <div className="border-t border-border pt-6 mt-6">
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0 stroke-[1.5]" aria-hidden />
            <span className="text-xs font-medium tracking-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
