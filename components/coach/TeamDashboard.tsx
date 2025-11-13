import { TeamCard } from './TeamCard';
import { UpcomingFollowUps } from './UpcomingFollowUps';
import { TeamWithStats } from '@/lib/services/team-service';

interface TeamDashboardProps {
  teams: TeamWithStats[];
  coachName: string;
}

export function TeamDashboard({ teams, coachName }: TeamDashboardProps) {
  const totalLearners = teams.reduce(
    (sum, team) => sum + team.learner_count,
    0
  );
  const totalPendingFeedback = teams.reduce(
    (sum, team) => sum + team.pending_feedback_count,
    0
  );
  const totalReflections = teams.reduce(
    (sum, team) => sum + team.total_reflections,
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {coachName} 코치님!
        </h1>
        <p className="mt-2 text-gray-600">
          담당 팀의 학습 현황을 확인하고 피드백을 제공하세요
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-600">담당 팀</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{teams.length}</p>
          <p className="mt-1 text-sm text-gray-500">
            총 {totalLearners}명의 학습자
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-600">전체 리플렉션</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalReflections}
          </p>
          <p className="mt-1 text-sm text-gray-500">모든 팀 합계</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <p className="text-sm font-medium text-orange-900">피드백 대기</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {totalPendingFeedback}
          </p>
          <p className="mt-1 text-sm text-orange-700">확인이 필요합니다</p>
        </div>
      </div>

      {/* Upcoming Follow-ups */}
      <UpcomingFollowUps />

      {/* Teams List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">담당 팀</h2>
        {teams.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">아직 담당 팀이 없습니다</p>
            <p className="mt-2 text-sm text-gray-400">
              관리자에게 팀 배정을 요청하세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>

      {totalPendingFeedback > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900">💡 코칭 팁</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li>• AI 피드백을 참고하여 학습자의 상황을 빠르게 파악하세요</li>
            <li>• 구체적이고 실행 가능한 피드백을 제공하세요</li>
            <li>• 학습자의 강점을 먼저 언급하고 개선점을 제안하세요</li>
          </ul>
        </div>
      )}
    </div>
  );
}
