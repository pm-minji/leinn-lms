'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  coachingLogSchema,
  CoachingLogFormData,
} from '@/lib/validations/coaching-log';
import { FormField } from '@/components/ui/FormField';

export function CoachingLogForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CoachingLogFormData>({
    resolver: zodResolver(coachingLogSchema),
    defaultValues: {
      title: '',
      session_date: new Date().toISOString().split('T')[0],
      learner_name: '',
      team_name: '',
      notes: '',
      next_actions: '',
      follow_up_date: null,
      status: 'open',
    },
  });

  const onSubmit = async (data: CoachingLogFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/coaching-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '코칭 로그 저장에 실패했습니다');
      }

      router.push('/coach/coaching-logs');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          코칭 로그 작성
        </h2>
        
        <div className="mb-4 rounded-md bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>간단한 메모 형태</strong>로 코칭 활동을 기록하세요. 
            학습자나 팀 정보는 선택사항입니다.
          </p>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <FormField label="제목" error={errors.title?.message} required>
            <input
              type="text"
              {...register('title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="예: 김철수 1:1 코칭, Alpha팀 주간 미팅"
            />
          </FormField>

          {/* Session Date */}
          <FormField
            label="세션 날짜"
            error={errors.session_date?.message}
            required
          >
            <input
              type="date"
              {...register('session_date')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-100"
            />
          </FormField>

          {/* Optional: Learner Name */}
          <FormField label="학습자 이름 (선택사항)" error={errors.learner_name?.message}>
            <input
              type="text"
              {...register('learner_name')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="예: 김철수"
            />
          </FormField>

          {/* Optional: Team Name */}
          <FormField label="팀 이름 (선택사항)" error={errors.team_name?.message}>
            <input
              type="text"
              {...register('team_name')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="예: Alpha팀"
            />
          </FormField>

          {/* Notes */}
          <FormField label="메모" error={errors.notes?.message} required>
            <textarea
              {...register('notes')}
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="코칭 세션 내용, 논의 사항, 관찰 내용 등을 자유롭게 기록하세요"
            />
          </FormField>

          {/* Next Actions */}
          <FormField label="다음 액션 (선택사항)" error={errors.next_actions?.message}>
            <textarea
              {...register('next_actions')}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="다음에 실행할 액션 아이템이나 후속 조치"
            />
          </FormField>

          {/* Follow-up Date */}
          <FormField
            label="후속 일정 (선택사항)"
            error={errors.follow_up_date?.message}
          >
            <input
              type="date"
              {...register('follow_up_date')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-100"
            />
          </FormField>

          {/* Status */}
          <FormField label="상태">
            <select
              {...register('status')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="open">진행 중</option>
              <option value="done">완료</option>
            </select>
          </FormField>
        </div>

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
            {isSubmitting ? '저장 중...' : '코칭 로그 저장'}
          </button>
        </div>
      </div>
    </form>
  );
}