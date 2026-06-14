import { Suspense } from 'react';
import VerifyEmailInner from './verify-inner';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading…</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
