'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  coachingLogSchema,
  CoachingLogFormData,
} from '@/lib/validations/coaching-log';
import { FormField } from '@/components/ui/FormField';

interface Team {
  id: string;
  name: string;
}

interface Learner {
  id: string;
  user_id: string;
  team_id: string;
  users: {
    name: string;
    email: string;
  };
}

export function CoachingLogForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingLearners, setLoadingLearners] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CoachingLogFormData>({
    resolver: zodResolver(coachingLogSchema),
    defaultValues: {
      title: '',
      session_date: new Date().toISOString().split('T')[0],
      session_type: '1:1',
      learner_id: null,
      team_id: null,
      notes: '',
      next_actions: '',
      follow_up_date: null,
      status: 'open',
    },
  });

  const sessionType = watch('session_type');

  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) {
          throw new Error('팀 목록을 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setTeams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '팀 목록 조회 실패');
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  // Fetch learners when team is selected
  useEffect(() => {
    if (!selectedTeamId) {
      setLearners([]);
      return;
    }

    const fetchLearners = async () => {
      setLoadingLearners(true);
      try {
        const response = await fetch(`/api/teams/${selectedTeamId}/learners`);
        if (!response.ok) {
          throw new Error('학습자 목록을 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setLearners(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '학습자 목록 조회 실패');
      } finally {
        setLoadingLearners(false);
      }
    };

    fetchLearners();
  }, [selectedTeamId]);

  // Update form values based on session type
  useEffect(() => {
    if (sessionType === 'team' || sessionType === 'weekly') {
      setValue('learner_id', null);
    }
    if (sessionType === '1:1') {
      setValue('team_id', null);
    }
  }, [sessionType, setValue]);

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

      router.push('/coaching-logs');
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

        <div className="space-y-4">
          {/* Title */}
          <FormField label="제목" error={errors.title?.message} required>
            <input
              type="text"
              {...register('title')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="코칭 세션 제목"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </FormField>

          {/* Session Type */}
          <FormField
            label="세션 유형"
            error={errors.session_type?.message}
            required
          >
            <select
              {...register('session_type')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="1:1">1:1 코칭</option>
              <option value="team">팀 코칭</option>
              <option value="weekly">주간 코칭</option>
            </select>
          </FormField>

          {/* Team Selection (for team/weekly sessions) */}
          {(sessionType === 'team' || sessionType === 'weekly') && (
            <FormField label="팀" error={errors.team_id?.message} required>
              <select
                {...register('team_id')}
                onChange={(e) => {
                  setValue('team_id', e.target.value || null);
                  setSelectedTeamId(e.target.value);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={loadingTeams}
              >
                <option value="">팀을 선택하세요</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {/* Learner Selection (for 1:1 sessions) */}
          {sessionType === '1:1' && (
            <>
              <FormField label="팀 선택" required>
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    setValue('learner_id', null);
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loadingTeams}
                >
                  <option value="">팀을 먼저 선택하세요</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="학습자"
                error={errors.learner_id?.message}
                required
              >
                <select
                  {...register('learner_id')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={!selectedTeamId || loadingLearners}
                >
                  <option value="">학습자를 선택하세요</option>
                  {learners.map((learner) => (
                    <option key={learner.id} value={learner.id}>
                      {learner.users.name} ({learner.users.email})
                    </option>
                  ))}
                </select>
              </FormField>
            </>
          )}

          {/* Notes */}
          <FormField label="메모" error={errors.notes?.message} required>
            <textarea
              {...register('notes')}
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="코칭 세션 내용, 논의 사항, 관찰 내용 등을 기록하세요"
            />
          </FormField>

          {/* Next Actions */}
          <FormField label="다음 액션" error={errors.next_actions?.message}>
            <textarea
              {...register('next_actions')}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="학습자 또는 팀이 다음에 실행할 액션 아이템"
            />
          </FormField>

          {/* Follow-up Date */}
          <FormField
            label="후속 일정"
            error={errors.follow_up_date?.message}
          >
            <input
              type="date"
              {...register('follow_up_date')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </FormField>

          {/* Status */}
          <FormField label="상태" error={errors.status?.message}>
            <select
              {...register('status')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
