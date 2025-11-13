import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';

interface LearnerCardProps {
  learner: {
    id: string;
    user_id: string;
    team_id: string;
    joined_at: string;
    active: boolean;
    users: {
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
    };
    recent_reflection: {
      id: string;
      title: string;
      status: string;
      created_at: string;
    } | null;
    total_reflections: number;
    pending_feedback: number;
  };
  teamId: string;
}

export function LearnerCard({ learner, teamId }: LearnerCardProps) {
  const joinedDate = new Date(learner.joined_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const recentReflectionDate = learner.recent_reflection
    ? new Date(learner.recent_reflection.created_at).toLocaleDateString(
        'ko-KR',
        {
          month: 'short',
          day: 'numeric',
        }
      )
    : null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {learner.users.avatar_url ? (
            <img
              src={learner.users.avatar_url}
              alt={learner.users.name}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <span className="text-lg font-semibold">
                {learner.users.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {learner.users.name}
            </h3>
            <p className="text-sm text-gray-500">{learner.users.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">전체 리플렉션</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            {learner.total_reflections}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">피드백 대기</p>
          <p className="mt-1 text-xl font-semibold text-orange-600">
            {learner.pending_feedback}
          </p>
        </div>
      </div>

      {learner.recent_reflection ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500">최근 리플렉션</p>
          <Link
            href={`/coach/reflections/${learner.recent_reflection.id}`}
            className="mt-2 block rounded-md border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {learner.recent_reflection.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {recentReflectionDate}
                </p>
              </div>
              <StatusBadge
                status={
                  learner.recent_reflection.status as
                    | 'submitted'
                    | 'ai_feedback_done'
                    | 'ai_feedback_pending'
                    | 'coach_feedback_done'
                }
              />
            </div>
          </Link>
        </div>
      ) : (
        <div className="mt-4 rounded-md bg-gray-50 p-3 text-center">
          <p className="text-sm text-gray-500">아직 리플렉션이 없습니다</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">참여일: {joinedDate}</div>
    </div>
  );
}
