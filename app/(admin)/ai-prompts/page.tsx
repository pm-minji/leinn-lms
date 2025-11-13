'use client';

import { PromptList } from '@/components/admin/PromptList';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Prompt {
  id: string;
  name: string;
  description: string;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AIPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-prompts');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      setPrompts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleActivate = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-prompts/${id}/activate`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to activate prompt');
      await fetchPrompts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to activate prompt');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 프롬프트를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/ai-prompts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete prompt');
      await fetchPrompts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete prompt');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <LoadingSpinner size="lg" className="py-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ErrorMessage message={error} onRetry={fetchPrompts} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            AI 프롬프트 관리
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            리플렉션 분석에 사용되는 AI 프롬프트를 관리합니다
          </p>
        </div>
        <Link href="/admin/ai-prompts/new">
          <Button variant="primary">새 프롬프트 생성</Button>
        </Link>
      </div>

      <PromptList
        prompts={prompts}
        onActivate={handleActivate}
        onDelete={handleDelete}
      />
    </div>
  );
}
