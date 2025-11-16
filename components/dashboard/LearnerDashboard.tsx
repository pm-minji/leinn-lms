import { ReflectionStats } from './ReflectionStats';
import { RecentReflections } from './RecentReflections';
import { TeamSection } from './TeamSection';
import { LearningProgress } from './LearningProgress';
import { TeamSelection } from './TeamSelection';
import { Database } from '@/types/supabase';
import Link from 'next/link';

type Reflection = Database['public']['Tables']['reflections']['Row'];

interface LearnerDashboardProps {
  reflections: Reflection[];
  userName: string;
  learner: any;
  teamMembers: any[];
  teamCoaches: any[];
  availableTeams: any[];
}

export function LearnerDashboard({
  reflections,
  userName,
  learner,
  teamMembers,
  teamCoaches,
  availableTeams,
}: LearnerDashboardProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          안녕하세요, {userName}님! 👋
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          {learner.teams ? `${learner.teams.name} 팀에서 함께 성장하고 있어요` : '팀을 선택하여 동료들과 함께 학습해보세요'}
        </p>
      </div>

      {/* Team Section or Team Selection */}
      {learner.teams ? (
        <TeamSection 
          team={learner.teams}
          teamMembers={teamMembers}
          teamCoaches={teamCoaches}
          joinedAt={learner.joined_at}
        />
      ) : (
        <TeamSelection 
          availableTeams={availableTeams}
          learnerId={learner.id}
        />
      )}

      {/* Learning Progress */}
      <LearningProgress 
        reflections={reflections}
        learner={learner}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <ReflectionStats reflections={reflections} />
        </div>
        
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-blue-900 sm:text-base">💡 이번 주 학습 목표</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li>• 새로운 개념을 실제 프로젝트에 적용해보기</li>
            <li>• 팀원들과 학습 경험 공유하기</li>
            <li>• 어려운 부분은 코치에게 질문하기</li>
            <li>• 매주 성찰을 통해 성장 과정 기록하기</li>
          </ul>
          <Link
            href="/learner/reflections/new"
            className="mt-4 inline-block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
          >
            새 리플렉션 작성하기
          </Link>
        </div>
      </div>

      {/* Recent Reflections */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
            최근 리플렉션
          </h2>
          <Link
            href="/learner/reflections"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            전체 보기 →
          </Link>
        </div>
        <RecentReflections reflections={reflections} />
      </div>
    </div>
  );
}
