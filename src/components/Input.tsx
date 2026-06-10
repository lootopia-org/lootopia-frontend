'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-bold text-dark mb-2">{label}</label>}
      <input
        className={`w-full px-4 py-2 bg-white border-2 border-dark rounded-xl focus:outline-none focus:shadow-arcade-sm focus:border-primary transition-all ${
          error ? 'border-danger' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
};
