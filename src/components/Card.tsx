'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ className = '', children, hover = false }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '7px 7px 0 #1A1A1A' } : {}}
      className={`bg-white rounded-2xl border-2 border-dark shadow-arcade-lg p-6 transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};
