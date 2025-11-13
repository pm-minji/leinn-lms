import { LearnerCard } from './LearnerCard';

interface LearnerListProps {
  learners: Array<{
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
  }>;
  teamId: string;
}

export function LearnerList({ learners, teamId }: LearnerListProps) {
  if (learners.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">아직 팀에 학습자가 없습니다</p>
        <p className="mt-2 text-sm text-gray-400">
          관리자에게 학습자 배정을 요청하세요
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {learners.map((learner) => (
        <LearnerCard key={learner.id} learner={learner} teamId={teamId} />
      ))}
    </div>
  );
}
