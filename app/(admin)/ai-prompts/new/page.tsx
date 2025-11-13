'use client';

import { PromptForm } from '@/components/admin/PromptForm';
import { PromptPreview } from '@/components/admin/PromptPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PromptInput } from '@/lib/validations/prompt';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewPromptPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const handleSubmit = async (data: PromptInput) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create prompt');
      }

      router.push('/admin/ai-prompts');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          새 프롬프트 생성
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          리플렉션 분석에 사용할 새로운 AI 프롬프트를 생성합니다
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>프롬프트 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <PromptPreview
            content={previewContent}
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
