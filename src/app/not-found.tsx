import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-[family-name:var(--font-syne)] font-bold text-gold/30">404</p>
      <h1 className="mt-4 font-[family-name:var(--font-syne)] text-2xl font-bold">Lost in the wilderness</h1>
      <p className="mt-2 text-white/50">This page doesn&apos;t exist or has been moved.</p>
      <Button className="mt-8" asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
