'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileEditor } from '@/components/ui/ProfileEditor';
import { TeamSelection } from '@/components/dashboard/TeamSelection';
import Link from 'next/link';

interface LearnerProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
  };
  learner: {
    id: string;
    team_id: string | null;
    joined_at: string;
    active: boolean;
  };
  currentTeam: {
    id: string;
    name: string;
    active: boolean;
    created_at: string;
  } | null;
  teamMembers: Array<{
    id: string;
    user_id: string;
    joined_at: string;
    users: {
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
    };
  }>;
  teamCoaches: Array<{
    coaches: {
      users: {
        id: string;
        name: string;
        email: string;
        avatar_url: string | null;
      };
    };
  }>;
  availableTeams: Array<{
    id: string;
    name: string;
    active: boolean;
  }>;
  reflections: Array<{
    id: string;
    status: string;
    created_at: string;
    week_start: string;
  }>;
}

export function LearnerProfile({
  user,
  learner,
  currentTeam,
  teamMembers,
  teamCoaches,
  availableTeams,
  reflections,
}: LearnerProfileProps) {
  const router = useRouter();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showTeamChange, setShowTeamChange] = useState(false);

  // Calculate learning stats
  const totalReflections = reflections.length;
  
  // 이번 주 (월요일부터 일요일까지) 작성한 리플렉션
  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 일요일은 6, 나머지는 dayOfWeek - 1
  startOfWeek.setDate(now.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const thisWeekReflections = reflections.filter(r => {
    return new Date(r.created_at) >= startOfWeek;
  }).length;
  
  // 피드백 상태별 분류
  const pendingReflections = reflections.filter(r => r.status === 'submitted' || r.status === 'ai_feedback_pending').length;
  const aiCompletedReflections = reflections.filter(r => r.status === 'ai_feedback_done').length;
  const coachCompletedReflections = reflections.filter(r => r.status === 'coach_feedback_done').length;
  
  // 최근 30일 활동
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const recentReflections = reflections.filter(r => {
    return new Date(r.created_at) >= thirtyDaysAgo;
  }).length;

  const handleTeamChange = async (teamId: string) => {
    try {
      const response = await fetch('/api/learner/join-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          learner_id: learner.id,
          team_id: teamId 
        }),
      });

      if (response.ok) {
        router.refresh();
        setShowTeamChange(false);
      }
    } catch (error) {
      console.error('Failed to change team:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
          <p className="mt-1 text-sm text-gray-600">
            프로필, 팀 정보, 학습 현황을 한눈에 확인하세요
          </p>
        </div>
        <Link
          href="/learner/reflections"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          📝 리플렉션 관리
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">👤 내 프로필</h2>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isEditingProfile ? '취소' : '편집'}
              </button>
            </div>

            {isEditingProfile ? (
              <ProfileEditor
                currentName={user.name}
                currentEmail={user.email}
                userId={user.id}
                onCancel={() => setIsEditingProfile(false)}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-medium text-blue-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-600">
                      가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{totalReflections}</div>
                      <div className="text-xs text-gray-500">총 리플렉션</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{recentReflections}</div>
                      <div className="text-xs text-gray-500">최근 활동</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Section */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">🏆 내 팀</h2>
              {currentTeam && (
                <button
                  onClick={() => setShowTeamChange(!showTeamChange)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  팀 변경
                </button>
              )}
            </div>

            {showTeamChange ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새로운 팀 선택
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleTeamChange(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">팀을 선택하세요...</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowTeamChange(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
              </div>
            ) : currentTeam ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900">{currentTeam.name}</h3>
                  <p className="text-xs text-gray-500 mt-2">
                    팀 가입일: {new Date(learner.joined_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team Members */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      👥 팀원들 ({teamMembers.length + 1}명)
                    </h4>
                    <div className="space-y-2">
                      {/* Current user */}
                      <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name} (나)</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      
                      {/* Other team members */}
                      {teamMembers.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {member.users.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.users.name}</p>
                            <p className="text-xs text-gray-500">{member.users.email}</p>
                          </div>
                        </div>
                      ))}
                      
                      {teamMembers.length > 3 && (
                        <p className="text-xs text-gray-500 pl-11">
                          +{teamMembers.length - 3}명 더
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Team Coaches */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      👨‍🏫 담당 코치 ({teamCoaches.length}명)
                    </h4>
                    <div className="space-y-2">
                      {teamCoaches.map((coachAssignment) => (
                        <div key={coachAssignment.coaches.users.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-green-600">
                              {coachAssignment.coaches.users.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{coachAssignment.coaches.users.name}</p>
                            <p className="text-xs text-gray-500">{coachAssignment.coaches.users.email}</p>
                          </div>
                        </div>
                      ))}
                      {teamCoaches.length === 0 && (
                        <p className="text-sm text-gray-500">아직 배정된 코치가 없습니다</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <TeamSelection 
                availableTeams={availableTeams}
                learnerId={learner.id}
              />
            )}
          </div>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 학습 현황</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalReflections}</div>
            <div className="text-sm text-gray-600">총 리플렉션</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{thisWeekReflections}</div>
            <div className="text-sm text-gray-600">이번 주 작성</div>
            <div className="text-xs text-gray-500 mt-1">(월~일)</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{recentReflections}</div>
            <div className="text-sm text-gray-600">최근 30일</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{coachCompletedReflections}</div>
            <div className="text-sm text-gray-600">코치 피드백 완료</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">피드백 현황</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">{pendingReflections}</div>
              <div className="text-xs text-gray-600">대기 중</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{aiCompletedReflections}</div>
              <div className="text-xs text-gray-600">AI 피드백 완료</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{coachCompletedReflections}</div>
              <div className="text-xs text-gray-600">코치 피드백 완료</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}