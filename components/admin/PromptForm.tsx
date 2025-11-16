'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { promptSchema, PromptInput } from '@/lib/validations/prompt';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface PromptFormProps {
  initialData?: Partial<PromptInput>;
  onSubmit: (data: PromptInput) => void;
  onContentChange?: (content: string) => void;
  isLoading?: boolean;
}

export function PromptForm({
  initialData,
  onSubmit,
  onContentChange,
  isLoading = false,
}: PromptFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PromptInput>({
    resolver: zodResolver(promptSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      content: '',
      version: '1.0',
    },
  });

  const contentValue = watch('content');
  
  // Call onContentChange when content changes
  React.useEffect(() => {
    if (onContentChange && contentValue) {
      onContentChange(contentValue);
    }
  }, [contentValue, onContentChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          프롬프트 이름 <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="예: 리플렉션 분석 프롬프트 v2"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="version"
          className="block text-sm font-medium text-gray-700"
        >
          버전
        </label>
        <input
          {...register('version')}
          type="text"
          id="version"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="예: 1.0, 2.1"
        />
        {errors.version && (
          <p className="mt-1 text-sm text-red-600">{errors.version.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="이 프롬프트의 목적과 사용 방법을 설명해주세요"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          프롬프트 내용 <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 text-xs text-gray-500">
          사용 가능한 변수: {'{reflection_content}'}, {'{learner_name}'},{' '}
          {'{team_name}'}
        </div>
        <textarea
          {...register('content')}
          id="content"
          rows={15}
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="프롬프트 내용을 입력하세요..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          취소
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? '수정하기' : '생성하기'}
        </Button>
      </div>
    </form>
  );
}
