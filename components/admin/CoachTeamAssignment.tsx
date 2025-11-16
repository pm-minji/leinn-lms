'use client';

import { FormField } from '@/components/ui/FormField';
import { coachTeamAssignmentSchema, CoachTeamAssignmentData } from '@/lib/validations/coach-team';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface Team {
  id: string;
  name: string;
  active: boolean;
}

interface CoachTeamAssignmentProps {
  coachId: string;
  teams: Team[];
  assignedTeamIds: string[];
}

export function CoachTeamAssignment({
  coachId,
  teams,
  assignedTeamIds,
}: CoachTeamAssignmentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CoachTeamAssignmentData>({
    resolver: zodResolver(coachTeamAssignmentSchema),
    defaultValues: {
      coach_id: coachId,
      team_id: '',
    },
  });

  const onSubmit = async (data: CoachTeamAssignmentData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/coach-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '팀 할당에 실패했습니다');
      }

      reset({ coach_id: coachId, team_id: '' });
      router.refresh();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (teamId: string) => {
    if (!confirm('정말 이 팀 할당을 해제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/coach-teams?coach_id=${coachId}&team_id=${teamId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '팀 할당 해제에 실패했습니다');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    }
  };

  const activeTeams = teams.filter((team) => team.active);
  const unassignedTeams = activeTeams.filter(
    (team) => !assignedTeamIds.includes(team.id)
  );
  const assignedTeams = activeTeams.filter((team) =>
    assignedTeamIds.includes(team.id)
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Assigned Teams */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-900">
          할당된 팀 ({assignedTeams.length})
        </h4>
        {assignedTeams.length === 0 ? (
          <p className="text-sm text-gray-500">할당된 팀이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {assignedTeams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-2"
              >
                <span className="text-sm text-gray-900">{team.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAssignment(team.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  할당 해제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Assignment */}
      {unassignedTeams.length > 0 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('coach_id')} />
          
          <FormField label="새 팀 할당" error={errors.team_id?.message}>
            <select
              {...register('team_id')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">팀 선택</option>
              {unassignedTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              한 코치는 여러 팀을 담당할 수 있습니다
            </p>
          </FormField>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '할당 중...' : '팀 할당'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
