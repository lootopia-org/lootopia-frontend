import { Suspense } from 'react';
import LoginPageInner from './login-inner';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">…</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
