'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'coach' | 'learner';
  avatar_url: string | null;
  created_at: string;
  updated_at?: string;
  learners?: Array<{
    id: string;
    team_id: string | null;
    active: boolean;
    joined_at: string;
    teams?: { id: string; name: string } | null;
  }>;
  coaches?: Array<{
    id: string;
    active: boolean;
    created_at: string;
    specialty: string[] | null;
  }>;
}

interface Team {
  id: string;
  name: string;
  active: boolean;
}

interface CoachTeam {
  id: string;
  team_id: string;
  teams: { id: string; name: string };
}

interface Reflection {
  id: string;
  title: string;
  status: string;
  created_at: string;
  week_start: string;
}

interface UserDetailFormProps {
  user: User;
  teams: Team[];
  coachTeams: CoachTeam[];
  recentReflections: Reflection[];
}

export function UserDetailForm({ user, teams, coachTeams, recentReflections }: UserDetailFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '사용자 정보 업데이트에 실패했습니다');
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditing(false);
    setError(null);
  };

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
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* User Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">사용자 정보</h1>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {isLoading ? '저장 중...' : '저장'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                편집
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                역할
              </label>
              {isEditing ? (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="learner">학습자</option>
                  <option value="coach">코치</option>
                  <option value="admin">관리자</option>
                </select>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role === 'admin' ? '관리자' : user.role === 'coach' ? '코치' : '학습자'}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가입일
              </label>
              <p className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>

            {user.updated_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최종 수정일
                </label>
                <p className="text-gray-900">
                  {new Date(user.updated_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            )}

            {user.learners && user.learners.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  소속 팀
                </label>
                <p className="text-gray-900">
                  {user.learners[0].teams?.name || '팀 미할당'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coach Teams */}
      {user.coaches && user.coaches.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">담당 팀</h2>
          {coachTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coachTeams.map((assignment) => (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{assignment.teams.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">팀 ID: {assignment.teams.id}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">담당 팀이 없습니다.</p>
          )}
        </div>
      )}

      {/* Recent Reflections */}
      {user.learners && user.learners.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">최근 리플렉션</h2>
          {recentReflections.length > 0 ? (
            <div className="space-y-3">
              {recentReflections.map((reflection) => (
                <div key={reflection.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{reflection.title}</h3>
                    <p className="text-sm text-gray-500">
                      주차: {new Date(reflection.week_start).toLocaleDateString('ko-KR')} • 
                      제출일: {new Date(reflection.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(reflection.status)}`}>
                      {getStatusLabel(reflection.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">제출된 리플렉션이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}