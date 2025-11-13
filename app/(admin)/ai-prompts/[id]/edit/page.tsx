'use client';

import { PromptForm } from '@/components/admin/PromptForm';
import { PromptPreview } from '@/components/admin/PromptPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { PromptInput } from '@/lib/validations/prompt';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  version: string;
  is_active: boolean;
}

export default function EditPromptPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (data: PromptInput) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/ai-prompts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update prompt');
      }

      router.push('/admin/ai-prompts');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update prompt');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          프롬프트 수정
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          AI 프롬프트의 내용을 수정합니다
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>프롬프트 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <PromptForm
              initialData={{
                name: prompt.name,
                description: prompt.description,
                content: prompt.content,
                version: prompt.version,
              }}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <PromptPreview
            content={prompt.content}
            variables={{
              reflection_content: '이번 주는 팀 프로젝트에서...',
              learner_name: '홍길동',
              team_name: 'Team Alpha',
            }}
          />
        </div>
      </div>
    </div>
  );
}
