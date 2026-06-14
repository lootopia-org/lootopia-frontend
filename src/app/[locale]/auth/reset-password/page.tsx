import { Suspense } from 'react';
import ResetPasswordInner from './reset-inner';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
