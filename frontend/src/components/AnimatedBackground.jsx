import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Large animated text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.span
          className="text-[clamp(4rem,18vw,14rem)] font-extrabold tracking-tighter select-none whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, rgba(225,6,0,0.12) 0%, rgba(225,6,0,0.04) 50%, rgba(225,6,0,0.08) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          animate={{
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Ripple DevOps Agent
        </motion.span>
      </motion.div>

      {/* Ripple circles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(225,6,0,0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/2 right-1/4 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(225,6,0,0.06) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(225,6,0,0.05) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(225,6,0,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(225,6,0,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
