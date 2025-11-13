'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  coachFeedbackSchema,
  CoachFeedbackFormData,
} from '@/lib/validations/coach-feedback';
import { FormField } from '@/components/ui/FormField';
import { Database } from '@/types/supabase';
import { AIFeedbackPanel } from './AIFeedbackPanel';

type Reflection = Database['public']['Tables']['reflections']['Row'];

interface CoachFeedbackFormProps {
  reflection: Reflection;
  learnerName?: string;
}

export function CoachFeedbackForm({
  reflection,
  learnerName,
}: CoachFeedbackFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CoachFeedbackFormData>({
    resolver: zodResolver(coachFeedbackSchema),
    defaultValues: {
      coach_feedback: reflection.coach_feedback || '',
    },
  });

  const onSubmit = async (data: CoachFeedbackFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/reflections/${reflection.id}/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '피드백 저장에 실패했습니다');
      }

      router.refresh();
      alert('피드백이 성공적으로 저장되었습니다');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekStart = new Date(reflection.week_start).toLocaleDateString(
    'ko-KR',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div className="space-y-6">
      {/* Learner and Reflection Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <div className="text-sm text-gray-500">
            학습자: {learnerName || '알 수 없는 학습자'}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {reflection.title}
          </h2>
          <div className="mt-1 text-sm text-gray-500">주차: {weekStart}</div>
        </div>
        <div className="whitespace-pre-wrap text-gray-700">
          {reflection.content}
        </div>
      </div>

      {/* AI Feedback Panel */}
      <AIFeedbackPanel
        aiSummary={reflection.ai_summary}
        aiRisks={reflection.ai_risks}
        aiActions={reflection.ai_actions}
      />

      {/* Coach Feedback Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-blue-900">
            코치 피드백 작성
          </h3>

          <FormField
            label="피드백"
            error={errors.coach_feedback?.message}
            required
          >
            <textarea
              {...register('coach_feedback')}
              rows={8}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="학습자에게 전달할 피드백을 작성해주세요. AI 분석 결과를 참고하여 구체적이고 실행 가능한 조언을 제공하세요."
            />
          </FormField>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '피드백 저장'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
