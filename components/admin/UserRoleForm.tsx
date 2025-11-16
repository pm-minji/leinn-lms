'use client';

import { FormField } from '@/components/ui/FormField';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface UserRoleFormProps {
  userId: string;
  currentRole: 'learner' | 'coach' | 'admin';
  userName: string;
  isCurrentUser: boolean;
}

interface RoleFormData {
  role: 'learner' | 'coach' | 'admin';
}

export function UserRoleForm({
  userId,
  currentRole,
  userName,
  isCurrentUser,
}: UserRoleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<RoleFormData>({
    defaultValues: {
      role: currentRole,
    },
  });

  const onSubmit = async (data: RoleFormData) => {
    if (data.role === currentRole) {
      return;
    }

    if (
      !confirm(
        `${userName}님의 역할을 "${getRoleLabel(currentRole)}"에서 "${getRoleLabel(data.role)}"로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '역할 변경에 실패했습니다');
      }

      router.refresh();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'learner':
        return '학습자';
      case 'coach':
        return '코치';
      case 'admin':
        return '관리자';
      default:
        return role;
    }
  };

  if (isCurrentUser) {
    return (
      <div className="rounded-md bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          자신의 역할은 변경할 수 없습니다
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <FormField label="역할">
        <select
          {...register('role')}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="learner">학습자</option>
          <option value="coach">코치</option>
          <option value="admin">관리자</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          역할 변경 시 관련 레코드가 자동으로 생성되거나 비활성화됩니다
        </p>
      </FormField>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '변경 중...' : '역할 변경'}
        </button>
      </div>
    </form>
  );
}
