'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TeamSelectionProps {
  availableTeams: Array<{
    id: string;
    name: string;
    description?: string;
    active: boolean;
  }>;
  learnerId: string;
}

export function TeamSelection({ availableTeams, learnerId }: TeamSelectionProps) {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinTeam = async () => {
    if (!selectedTeam) {
      setError('팀을 선택해주세요.');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch('/api/learner/join-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          learner_id: learnerId,
          team_id: selectedTeam 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '팀 가입에 실패했습니다');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-2xl">🎯</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            팀에 참여하여 함께 학습해보세요!
          </h2>
          <p className="text-sm text-yellow-800 mb-4">
            팀에 참여하면 동료들과 함께 학습하고, 경험을 공유하며, 서로 도움을 주고받을 수 있습니다.
          </p>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {availableTeams.length > 0 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-900 mb-2">
                  참여할 팀을 선택하세요
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">팀을 선택하세요...</option>
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.description && `- ${team.description}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleJoinTeam}
                disabled={isJoining || !selectedTeam}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                  isJoining || !selectedTeam
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {isJoining ? '가입 중...' : '팀 가입하기'}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-yellow-800 mb-2">
                현재 가입 가능한 팀이 없습니다.
              </p>
              <p className="text-xs text-yellow-700">
                관리자에게 팀 배정을 요청하거나 새로운 팀이 생성될 때까지 기다려주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}