'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantClasses = {
  primary: 'bg-primary text-white border-2 border-dark shadow-arcade hover:bg-orange-600',
  secondary: 'bg-secondary text-white border-2 border-dark shadow-arcade hover:bg-blue-900',
  outline: 'bg-white text-dark border-2 border-dark shadow-arcade hover:bg-orange-50',
  danger: 'bg-danger text-white border-2 border-dark shadow-arcade hover:bg-red-700',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 1 }}
      className={`rounded-xl font-extrabold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⌛</span>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
