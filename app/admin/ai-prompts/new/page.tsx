'use client';

import { PromptForm } from '@/components/admin/PromptForm';
import { PromptPreview } from '@/components/admin/PromptPreview';
import { PromptTemplateSelector } from '@/components/admin/PromptTemplateSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PromptInput } from '@/lib/validations/prompt';
import { getAllPromptTemplates } from '@/lib/ai/prompt-templates';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewPromptPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);

  const templates = getAllPromptTemplates();

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    setPreviewContent(template.template);
  };

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

  if (showTemplateSelector) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            새 프롬프트 생성
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            먼저 프롬프트 템플릿을 선택하세요
          </p>
        </div>

        <PromptTemplateSelector
          templates={templates}
          onSelect={handleTemplateSelect}
          onSkip={() => setShowTemplateSelector(false)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              새 프롬프트 생성
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {selectedTemplate ? `${selectedTemplate.name} 템플릿을 기반으로 프롬프트를 생성합니다` : '리플렉션 분석에 사용할 새로운 AI 프롬프트를 생성합니다'}
            </p>
          </div>
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            템플릿 다시 선택
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>프롬프트 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <PromptForm 
              onSubmit={handleSubmit} 
              isLoading={isLoading}
              initialData={selectedTemplate ? {
                name: selectedTemplate.name,
                description: selectedTemplate.description,
                content: selectedTemplate.template,
                version: '1.0'
              } : undefined}
              onContentChange={setPreviewContent}
            />
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
