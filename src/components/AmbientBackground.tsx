'use client';

import { useEffect, useState } from 'react';
import { Cross, Shield, Dna, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

const WATERMARK_SIZE = 320;
const WATERMARK_BLUR = 3;
const WATERMARK_OPACITY = 0.04;

export function AmbientBackground() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMouse({ x, y });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const parallaxOffset = 15;
  const px = (mouse.x - 0.5) * parallaxOffset;
  const py = (mouse.y - 0.5) * parallaxOffset;

  return (
    <>
      {/* Base + radial gradients */}
      <div className="fixed inset-0 bg-clinical-base" />

      {/* Large blurred gradient blobs - slow drift */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="blob absolute -top-32 -right-32 h-[420px] w-[420px] bg-cyan-500/25"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="blob absolute top-1/2 -left-40 h-[380px] w-[380px] bg-blue-500/20"
          animate={{
            x: [0, -20, 25, 0],
            y: [0, 20, -15, 0],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="blob absolute -bottom-24 right-1/4 h-[340px] w-[340px] bg-sky-400/15"
          animate={{
            x: [0, 15, -30, 0],
            y: [0, -20, 10, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Faint pulsing glow center */}
      <motion.div
        className="fixed inset-0 pointer-events-none flex items-center justify-center"
        style={{ paddingTop: '18vh' }}
      >
        <motion.div
          className="h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: `translate(${px}px, ${py}px)` }}
        />
      </motion.div>

      {/* Trust watermarks - very large, 3-5% opacity, blurred */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-24 -left-24 text-cyan-500/50"
          style={{
            width: WATERMARK_SIZE,
            height: WATERMARK_SIZE,
            filter: `blur(${WATERMARK_BLUR}px)`,
            opacity: WATERMARK_OPACITY,
            transform: `translate(${px * 0.5}px, ${py * 0.5}px)`,
          }}
        >
          <Cross size={WATERMARK_SIZE} strokeWidth={1} />
        </div>
        <div
          className="absolute -top-16 -right-16 text-cyan-500/50"
          style={{
            width: WATERMARK_SIZE,
            height: WATERMARK_SIZE,
            filter: `blur(${WATERMARK_BLUR}px)`,
            opacity: WATERMARK_OPACITY,
            transform: `translate(${-px * 0.5}px, ${py * 0.5}px)`,
          }}
        >
          <Shield size={WATERMARK_SIZE} strokeWidth={1} />
        </div>
        <div
          className="absolute bottom-0 -left-20 text-cyan-500/50"
          style={{
            width: WATERMARK_SIZE,
            height: WATERMARK_SIZE,
            filter: `blur(${WATERMARK_BLUR}px)`,
            opacity: WATERMARK_OPACITY,
            transform: `translate(${px * 0.5}px, ${-py * 0.5}px)`,
          }}
        >
          <Dna size={WATERMARK_SIZE} strokeWidth={1} />
        </div>
        <div
          className="absolute bottom-12 -right-20 text-cyan-500/50"
          style={{
            width: WATERMARK_SIZE,
            height: WATERMARK_SIZE,
            filter: `blur(${WATERMARK_BLUR}px)`,
            opacity: WATERMARK_OPACITY,
            transform: `translate(${-px * 0.5}px, ${-py * 0.5}px)`,
          }}
        >
          <Stethoscope size={WATERMARK_SIZE} strokeWidth={1} />
        </div>
      </div>

      <div className="vignette" />
      <div className="grain" />
    </>
  );
}
