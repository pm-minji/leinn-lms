'use client';

import { FormField } from '@/components/ui/FormField';
import { learnerTeamAssignmentSchema, LearnerTeamAssignmentData } from '@/lib/validations/learner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface Team {
  id: string;
  name: string;
  active: boolean;
}

interface LearnerTeamAssignmentProps {
  learnerId: string;
  currentTeamId: string | null;
  teams: Team[];
}

export function LearnerTeamAssignment({
  learnerId,
  currentTeamId,
  teams,
}: LearnerTeamAssignmentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LearnerTeamAssignmentData>({
    resolver: zodResolver(learnerTeamAssignmentSchema),
    defaultValues: {
      team_id: currentTeamId,
    },
  });

  const onSubmit = async (data: LearnerTeamAssignmentData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/learners/${learnerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '팀 배정에 실패했습니다');
      }

      router.refresh();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTeams = teams.filter((team) => team.active);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <FormField label="팀 배정" error={errors.team_id?.message}>
        <select
          {...register('team_id')}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">팀 없음</option>
          {activeTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          학습자는 하나의 팀에만 소속될 수 있습니다
        </p>
      </FormField>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : '팀 배정 저장'}
        </button>
      </div>
    </form>
  );
}
