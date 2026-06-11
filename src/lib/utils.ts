import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppDownloadUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL ||
    'https://your-server.com/lootopia.apk'
  );
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api.wookiesrpeople2.dev'
  );
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'text-teal-400';
    case 'medium':
      return 'text-amber-400';
    case 'hard':
      return 'text-rose-400';
    default:
      return 'text-white/70';
  }
}

export function formatStepType(type: string): string {
  switch (type) {
    case 'checkpoint':
      return 'Checkpoint';
    case 'riddle':
      return 'Riddle';
    case 'qr_code':
      return 'QR Code';
    case 'clue':
      return 'Clue';
    case 'ar':
      return 'AR Treasure';
    default:
      return type;
  }
}

export function difficultyBg(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-teal-500/20 border-teal-500/30';
    case 'medium':
      return 'bg-amber-500/20 border-amber-500/30';
    case 'hard':
      return 'bg-rose-500/20 border-rose-500/30';
    default:
      return 'bg-white/10 border-white/20';
  }
}
