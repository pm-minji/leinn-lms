import Link from 'next/link';
import { TeamWithStats } from '@/lib/services/team-service';

interface TeamCardProps {
  team: TeamWithStats;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link
      href={`/coach/teams/${team.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {team.learner_count}명의 학습자
          </p>
        </div>
        {!team.active && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            비활성
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500">전체 리플렉션</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {team.total_reflections}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">피드백 대기</p>
          <p className="mt-1 text-2xl font-semibold text-orange-600">
            {team.pending_feedback_count}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">완료율</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {team.submission_rate}%
          </p>
        </div>
      </div>

      {team.pending_feedback_count > 0 && (
        <div className="mt-4 rounded-md bg-orange-50 p-3">
          <p className="text-sm text-orange-800">
            {team.pending_feedback_count}개의 리플렉션이 피드백을 기다리고
            있습니다
          </p>
        </div>
      )}
    </Link>
  );
}
