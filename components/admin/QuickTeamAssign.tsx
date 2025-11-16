'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface QuickTeamAssignProps {
  userId: string;
  userRole: string;
  currentTeamId?: string | null;
  onClose: () => void;
}

export function QuickTeamAssign({ userId, userRole, currentTeamId, onClose }: QuickTeamAssignProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState(currentTeamId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available teams
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        if (data.teams) {
          setTeams(data.teams.filter((t: any) => t.active));
        }
      })
      .catch(err => {
        setError('팀 목록을 불러오는데 실패했습니다');
      });
  }, []);

  const handleAssign = async () => {
    if (!selectedTeam) {
      setError('팀을 선택해주세요');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = userRole === 'learner' 
        ? '/api/admin/assign-learner-team'
        : '/api/admin/assign-coach-team';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          team_id: selectedTeam
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '팀 배정에 실패했습니다');
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentTeamId) return;

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = userRole === 'learner' 
        ? '/api/admin/remove-learner-team'
        : '/api/admin/remove-coach-team';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '팀 제거에 실패했습니다');
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          팀 배정 {userRole === 'learner' ? '(학습자)' : '(코치)'}
        </h3>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              팀 선택
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">팀을 선택하세요...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.description && `- ${team.description}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between space-x-3">
            <div className="flex space-x-2">
              {currentTeamId && (
                <button
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 disabled:opacity-50"
                >
                  팀에서 제거
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAssign}
                disabled={isLoading || !selectedTeam}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isLoading || !selectedTeam
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? '처리 중...' : '배정하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}