import { Suspense } from 'react';
import MobileAuthPageInner from './mobile-inner';

export default function MobileAuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading…</div>}>
      <MobileAuthPageInner />
    </Suspense>
  );
}
