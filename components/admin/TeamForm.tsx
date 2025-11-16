'use client';

import { FormField } from '@/components/ui/FormField';
import { teamSchema, TeamFormData } from '@/lib/validations/team';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface TeamFormProps {
  team?: {
    id: string;
    name: string;
    active: boolean;
  };
}

export function TeamForm({ team }: TeamFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: team
      ? { name: team.name, active: team.active }
      : { name: '', active: true },
  });

  const onSubmit = async (data: TeamFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = team ? `/api/teams/${team.id}` : '/api/teams';
      const method = team ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '팀 저장에 실패했습니다');
      }

      router.push('/admin/teams');
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

      <FormField label="팀 이름" error={errors.name?.message} required>
        <input
          type="text"
          {...register('name')}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="팀 이름을 입력하세요"
        />
      </FormField>

      <FormField label="활성 상태">
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('active')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">
            팀 활성화
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          비활성화된 팀은 새로운 학습자를 배정할 수 없습니다
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
          {isSubmitting ? '저장 중...' : team ? '수정하기' : '생성하기'}
        </button>
      </div>
    </form>
  );
}
