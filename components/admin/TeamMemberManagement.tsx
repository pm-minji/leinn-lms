'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface Learner {
  id: string;
  user_id: string;
  joined_at: string;
  active: boolean;
  users: User;
}

interface Coach {
  id: string;
  coach_id: string;
  coaches: {
    id: string;
    user_id: string;
    users: User;
  };
}

interface AvailableUser {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'coach' | 'admin';
}

interface TeamMemberManagementProps {
  teamId: string;
  learners: Learner[];
  coaches: Coach[];
  availableUsers: AvailableUser[];
}

export function TeamMemberManagement({
  teamId,
  learners,
  coaches,
  availableUsers,
}: TeamMemberManagementProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddLearner = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/learners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '학습자 추가에 실패했습니다');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLearner = async (learnerId: string) => {
    if (!confirm('정말로 이 학습자를 팀에서 제거하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/learners/${learnerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '학습자 제거에 실패했습니다');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCoach = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/coaches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '코치 추가에 실패했습니다');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoach = async (coachTeamId: string) => {
    if (!confirm('정말로 이 코치를 팀에서 제거하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/coaches/${coachTeamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '코치 제거에 실패했습니다');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const availableLearners = availableUsers.filter(user => 
    user.role === 'learner' || user.role === 'admin'
  );
  
  const availableCoaches = availableUsers.filter(user => 
    user.role === 'coach' || user.role === 'admin'
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Team Learners */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">팀 학습자</h2>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddLearner(e.target.value);
                  e.target.value = '';
                }
              }}
              disabled={isLoading}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">학습자 추가...</option>
              {availableLearners.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {learners.length > 0 ? (
          <div className="space-y-3">
            {learners.map((learner) => (
              <div key={learner.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {learner.users.avatar_url ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={learner.users.avatar_url}
                        alt={learner.users.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {learner.users.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{learner.users.name}</p>
                    <p className="text-xs text-gray-500">{learner.users.email}</p>
                    <p className="text-xs text-gray-400">
                      가입일: {new Date(learner.joined_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    learner.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {learner.active ? '활성' : '비활성'}
                  </span>
                  <button
                    onClick={() => handleRemoveLearner(learner.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    제거
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">팀에 할당된 학습자가 없습니다.</p>
        )}
      </div>

      {/* Team Coaches */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">팀 코치</h2>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddCoach(e.target.value);
                  e.target.value = '';
                }
              }}
              disabled={isLoading}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">코치 추가...</option>
              {availableCoaches.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {coaches.length > 0 ? (
          <div className="space-y-3">
            {coaches.map((coach) => (
              <div key={coach.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {coach.coaches.users.avatar_url ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={coach.coaches.users.avatar_url}
                        alt={coach.coaches.users.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {coach.coaches.users.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{coach.coaches.users.name}</p>
                    <p className="text-xs text-gray-500">{coach.coaches.users.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRemoveCoach(coach.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    제거
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">팀에 할당된 코치가 없습니다.</p>
        )}
      </div>
    </div>
  );
}