'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface MotionViewProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  id?: string;
  onClick?: () => void;
}

export default function MotionView({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  direction = 'up',
  id,
  onClick,
}: MotionViewProps) {
  const directions = {
    up: { y: 40, opacity: 0 },
    down: { y: -40, opacity: 0 },
    left: { x: 40, opacity: 0 },
    right: { x: -40, opacity: 0 },
    none: { opacity: 0 },
  };

  return (
    <motion.div
      id={id}
      initial={directions[direction]}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for smooth luxury ease-out
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export function TextReveal({
  text,
  className = '',
  tag: Tag = 'h2',
  delay = 0,
}: {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
}) {
  const words = text.split(' ');

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    hidden: { y: '110%' },
    visible: {
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.span
      className="inline-flex flex-wrap overflow-hidden py-1"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span variants={child} className={`inline-block ${className}`}>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
