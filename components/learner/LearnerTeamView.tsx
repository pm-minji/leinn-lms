'use client';

import Link from 'next/link';

interface LearnerTeamViewProps {
  team: {
    id: string;
    name: string;
    description?: string;
    created_at: string;
  };
  currentLearner: {
    id: string;
    joined_at: string;
  };
  teamMembers: Array<{
    id: string;
    user_id: string;
    joined_at: string;
    users: {
      id: string;
      name: string;
      email: string;
      avatar_url?: string;
    };
  }>;
  teamCoaches: Array<{
    coaches: {
      users: {
        id: string;
        name: string;
        email: string;
        avatar_url?: string;
      };
    };
  }>;
  teamReflections: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
    week_start: string;
    learner_id: string;
    learners: {
      users: {
        name: string;
        avatar_url?: string;
      };
    };
  }>;
  currentUserId: string;
}

export function LearnerTeamView({
  team,
  currentLearner,
  teamMembers,
  teamCoaches,
  teamReflections,
  currentUserId,
}: LearnerTeamViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'ai_feedback_pending':
        return 'bg-blue-100 text-blue-800';
      case 'ai_feedback_done':
        return 'bg-orange-100 text-orange-800';
      case 'coach_feedback_done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return '제출됨';
      case 'ai_feedback_pending':
        return 'AI 분석 중';
      case 'ai_feedback_done':
        return '피드백 대기';
      case 'coach_feedback_done':
        return '완료';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/learner/dashboard" className="text-blue-600 hover:underline text-sm">
          ← 대시보드로 돌아가기
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{team.name}</h1>
        {team.description && (
          <p className="mt-1 text-sm text-gray-600">{team.description}</p>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">팀원 수</div>
          <div className="mt-2 text-3xl font-semibold text-blue-600">
            {teamMembers.length}명
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">담당 코치</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {teamCoaches.length}명
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">팀 리플렉션</div>
          <div className="mt-2 text-3xl font-semibold text-orange-600">
            {teamReflections.length}개
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">팀 생성일</div>
          <div className="mt-2 text-lg font-semibold text-gray-900">
            {new Date(team.created_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Team Members */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">👥 팀원들</h2>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {member.users.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={member.users.avatar_url}
                      alt={member.users.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.users.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.users.name}
                    </p>
                    {member.user_id === currentUserId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        나
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{member.users.email}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(member.joined_at).toLocaleDateString('ko-KR')} 가입
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Coaches */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">👨‍🏫 담당 코치</h2>
          <div className="space-y-4">
            {teamCoaches.length > 0 ? (
              teamCoaches.map((coachAssignment) => (
                <div key={coachAssignment.coaches.users.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {coachAssignment.coaches.users.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={coachAssignment.coaches.users.avatar_url}
                        alt={coachAssignment.coaches.users.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {coachAssignment.coaches.users.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {coachAssignment.coaches.users.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {coachAssignment.coaches.users.email}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">아직 배정된 코치가 없습니다</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Team Reflections */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">📝 팀 리플렉션 활동</h2>
        </div>
        
        {teamReflections.length > 0 ? (
          <div className="space-y-4">
            {teamReflections.map((reflection) => (
              <div key={reflection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {reflection.learners.users.avatar_url ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={reflection.learners.users.avatar_url}
                        alt={reflection.learners.users.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {reflection.learners.users.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {reflection.title}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{reflection.learners.users.name}</span>
                      <span>•</span>
                      <span>{new Date(reflection.week_start).toLocaleDateString('ko-KR')}</span>
                      <span>•</span>
                      <span>{new Date(reflection.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(reflection.status)}`}>
                    {getStatusLabel(reflection.status)}
                  </span>
                  {reflection.learner_id === currentLearner.id && (
                    <Link
                      href={`/learner/reflections/${reflection.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      보기
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">아직 팀에서 작성된 리플렉션이 없습니다.</p>
            <Link
              href="/learner/reflections/new"
              className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              첫 번째 리플렉션 작성하기 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}