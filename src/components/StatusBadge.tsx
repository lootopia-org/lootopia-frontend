'use client';

import React from 'react';

/**
 * Badge de statut unifié pour le Partner Studio.
 * Couvre à la fois le vocabulaire des chasses (active / draft / archived)
 * et celui du builder (draft / test / live).
 */
type StatusConfig = { label: string; className: string; dot: string };

const STATUS_CONFIG: Record<string, StatusConfig> = {
  live: { label: 'En ligne', className: 'bg-card-green text-emerald-800', dot: 'bg-emerald-500' },
  active: { label: 'En ligne', className: 'bg-card-green text-emerald-800', dot: 'bg-emerald-500' },
  test: { label: 'Test interne', className: 'bg-card-yellow text-amber-800', dot: 'bg-amber-500' },
  draft: { label: 'Brouillon', className: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  archived: { label: 'Archivée', className: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-dark px-3 py-1 text-xs font-bold ${config.className} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  );
};
