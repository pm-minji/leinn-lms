'use client';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <ErrorMessage
          title="문제가 발생했습니다"
          message={
            error.message ||
            '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          }
        />
        <div className="mt-6 flex gap-4">
          <Button onClick={reset} variant="primary" fullWidth>
            다시 시도
          </Button>
          <Button
            onClick={() => (window.location.href = '/dashboard')}
            variant="outline"
            fullWidth
          >
            대시보드로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}
