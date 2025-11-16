'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuickTeamAssign } from './QuickTeamAssign';

interface UserInlineEditorProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    learners?: Array<{
      id: string;
      team_id: string | null;
      active: boolean;
      teams: { id: string; name: string } | null
    }>;
    coaches?: Array<{
      id: string;
      active: boolean
    }>;
  };
}

export function UserInlineEditor({ user }: UserInlineEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTeamAssign, setShowTeamAssign] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
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
      role: user.role,
    });
    setIsEditing(false);
    setError(null);
  };

  const handleTeamAssign = () => {
    setShowTeamAssign(true);
  };

  if (isEditing) {
    return (
      <div className="space-y-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
        {error && (
          <div className="text-xs text-red-600">{error}</div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 placeholder:text-gray-400"
            placeholder="이름"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
          >
            <option value="learner">학습자</option>
            <option value="coach">코치</option>
            <option value="admin">관리자</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          ✏️ 편집
        </button>
        
        {user.role === 'learner' && (
          <button
            onClick={handleTeamAssign}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            🏆 팀 배정
          </button>
        )}
        
        <a
          href={`/admin/users/${user.id}`}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          👁️ 상세
        </a>
      </div>

      {showTeamAssign && (
        <QuickTeamAssign
          userId={user.id}
          userRole={user.role}
          currentTeamId={user.learners?.[0]?.team_id}
          onClose={() => setShowTeamAssign(false)}
        />
      )}
    </>
  );
}