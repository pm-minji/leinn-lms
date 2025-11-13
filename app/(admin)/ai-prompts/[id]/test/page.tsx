'use client';

import { PromptTester } from '@/components/admin/PromptTester';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Prompt {
  id: string;
  name: string;
  description: string;
  version: string;
}

export default function TestPromptPage({ params }: { params: { id: string } }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await fetch(`/api/ai-prompts/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch prompt');
        const data = await response.json();
        setPrompt(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <LoadingSpinner size="lg" className="py-12" />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ErrorMessage
          message={error || 'Prompt not found'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/ai-prompts"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← 프롬프트 목록으로
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          프롬프트 테스트
        </h1>
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            {prompt.name} (v{prompt.version})
          </p>
          <p className="text-sm text-gray-500">{prompt.description}</p>
        </div>
      </div>

      <PromptTester promptId={params.id} />
    </div>
  );
}
