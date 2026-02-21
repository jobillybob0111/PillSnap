'use client';

import { motion } from 'framer-motion';

const SPRITE_COLORS = [
  '#E11D48', '#F43F5E', '#FB7185', '#F9A8D4', '#A78BFA', '#38BDF8', '#34D399', '#FBBF24', '#F97316',
];
const NUM_SPRITES = 14;
const NUM_LINES = 10;
const SPRITE_DISTANCE = 120;
const DURATION = 0.7;

function getAngle(i: number, total: number) {
  return (i / total) * 360;
}

interface IdentifyBurstProps {
  origin: { x: number; y: number };
  onComplete?: () => void;
}

export function IdentifyBurst({ origin, onComplete }: IdentifyBurstProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[60]"
      aria-hidden
    >
      {/* Colorful sprites */}
      {Array.from({ length: NUM_SPRITES }).map((_, i) => {
        const angle = getAngle(i, NUM_SPRITES) + (i * 7);
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * SPRITE_DISTANCE;
        const ty = Math.sin(rad) * SPRITE_DISTANCE;
        const color = SPRITE_COLORS[i % SPRITE_COLORS.length];
        const size = 6 + (i % 4) * 2;
        return (
          <motion.div
            key={`s-${i}`}
            className="absolute rounded-full"
            style={{
              left: origin.x,
              top: origin.y,
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              backgroundColor: color,
              boxShadow: `0 0 ${size}px ${color}`,
            }}
            initial={{ scale: 0, opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{
              scale: [0, 1.2, 0.8],
              opacity: [1, 0.9, 0],
              x: [0, tx],
              y: [0, ty],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: DURATION,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            onAnimationComplete={i === 0 ? onComplete : undefined}
          />
        );
      })}
      {/* Lines that swivel out */}
      {Array.from({ length: NUM_LINES }).map((_, i) => {
        const angle = getAngle(i, NUM_LINES) + 15;
        const colors = ['#E11D48', '#A78BFA', '#34D399', '#FBBF24'];
        const color = colors[i % colors.length];
        return (
          <motion.div
            key={`l-${i}`}
            className="absolute h-0.5 origin-center"
            style={{
              left: origin.x,
              top: origin.y,
              width: 4,
              marginLeft: -2,
              marginTop: -1,
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
              rotate: angle,
            }}
            initial={{ scaleX: 0, opacity: 1, rotate: angle }}
            animate={{
              scaleX: [0, 30],
              opacity: [1, 0],
              rotate: [angle, angle + 220],
            }}
            transition={{
              duration: DURATION,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        );
      })}
    </div>
  );
}
