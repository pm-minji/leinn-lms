'use client';

import Link from 'next/link';

interface TeamSectionProps {
  team: {
    id: string;
    name: string;
    description?: string;
    created_at: string;
  };
  teamMembers: Array<{
    id: string;
    users: {
      id: string;
      name: string;
      email: string;
      avatar_url?: string;
    };
    joined_at: string;
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
  joinedAt: string;
}

export function TeamSection({ team, teamMembers, teamCoaches, joinedAt }: TeamSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            🏆 {team.name}
          </h2>
          {team.description && (
            <p className="text-sm text-gray-600 mt-1">{team.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">팀 가입일</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(joinedAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Members */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            👥 팀원들 ({teamMembers.length + 1}명)
          </h3>
          <div className="space-y-2">
            {teamMembers.slice(0, 4).map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {member.users.avatar_url ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={member.users.avatar_url}
                      alt={member.users.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {member.users.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.users.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(member.joined_at).toLocaleDateString('ko-KR')} 가입
                  </p>
                </div>
              </div>
            ))}
            {teamMembers.length > 4 && (
              <p className="text-xs text-gray-500 pl-11">
                +{teamMembers.length - 4}명 더
              </p>
            )}
          </div>
        </div>

        {/* Team Coaches */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            👨‍🏫 담당 코치 ({teamCoaches.length}명)
          </h3>
          <div className="space-y-2">
            {teamCoaches.map((coachAssignment) => (
              <div key={coachAssignment.coaches.users.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {coachAssignment.coaches.users.avatar_url ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={coachAssignment.coaches.users.avatar_url}
                      alt={coachAssignment.coaches.users.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-green-600">
                        {coachAssignment.coaches.users.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {coachAssignment.coaches.users.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {coachAssignment.coaches.users.email}
                  </p>
                </div>
              </div>
            ))}
            {teamCoaches.length === 0 && (
              <p className="text-sm text-gray-500">아직 배정된 코치가 없습니다</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>팀 생성일: {new Date(team.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
          <Link
            href={`/learner/team`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            팀 상세보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}