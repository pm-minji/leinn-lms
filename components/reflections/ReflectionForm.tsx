'use client';

import { FormField } from '@/components/ui/FormField';
import {
  reflectionSchema,
  ReflectionFormData,
} from '@/lib/validations/reflection';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function ReflectionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReflectionFormData>({
    resolver: zodResolver(reflectionSchema),
  });

  const contentLength = watch('content')?.length || 0;

  const onSubmit = async (data: ReflectionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reflections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '리플렉션 제출에 실패했습니다');
      }

      router.push('/reflections');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <FormField label="제목" error={errors.title?.message} required>
        <input
          type="text"
          {...register('title')}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="이번 주 리플렉션 제목을 입력하세요"
        />
      </FormField>

      <FormField label="주차 시작일" error={errors.week_start?.message} required>
        <input
          type="date"
          {...register('week_start')}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </FormField>

      <FormField label="리플렉션 내용" error={errors.content?.message} required>
        <textarea
          {...register('content')}
          rows={12}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="이번 주 학습 내용, 어려움, 인사이트 등을 자유롭게 작성하세요 (최소 100자)"
        />
        <p className="mt-1 text-sm text-gray-500">
          {contentLength} / 100자 이상
        </p>
      </FormField>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '제출 중...' : '제출하기'}
        </button>
      </div>
    </form>
  );
}
