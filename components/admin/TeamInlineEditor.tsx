'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TeamInlineEditorProps {
  team: {
    id: string;
    name: string;
    active: boolean;
  };
}

export function TeamInlineEditor({ team }: TeamInlineEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: team.name,
    active: team.active,
  });

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '팀 정보 업데이트에 실패했습니다');
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
      name: team.name,
      active: team.active,
    });
    setIsEditing(false);
    setError(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-2 p-2 border border-blue-200 rounded bg-blue-50">
        {error && (
          <div className="text-xs text-red-600">{error}</div>
        )}
        
        <div className="space-y-2">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
            placeholder="팀 이름"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-700">활성 상태</span>
          </label>
        </div>

        <div className="flex items-center space-x-1">
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
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setIsEditing(true)}
        className="text-blue-600 hover:text-blue-900 text-sm"
      >
        ✏️ 편집
      </button>
      <Link
        href={`/admin/teams/${team.id}`}
        className="text-green-600 hover:text-green-900 text-sm"
      >
        👁️ 상세
      </Link>
    </div>
  );
}