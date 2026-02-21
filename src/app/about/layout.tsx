import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - PillSnap',
  description: 'Why pill identification matters for safety and how PillSnap helps you identify medications by imprint, color, and shape.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
