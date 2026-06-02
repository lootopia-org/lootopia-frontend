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
      whileHover={hover ? { y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' } : {}}
      className={`bg-white rounded-xl shadow-md p-6 transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};
