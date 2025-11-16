'use client';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Prompt {
  id: string;
  name: string;
  description: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PromptListProps {
  prompts: Prompt[];
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PromptList({ prompts, onActivate, onDelete }: PromptListProps) {
  if (prompts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">등록된 프롬프트가 없습니다</p>
        <Link href="/admin/ai-prompts/new">
          <Button variant="primary" className="mt-4">
            첫 프롬프트 생성하기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="space-y-4 sm:hidden">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">
                  {prompt.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{prompt.description}</p>
                <p className="mt-1 text-xs text-gray-400">
                  생성일: {new Date(prompt.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <StatusBadge
                status={prompt.is_active ? 'active' : 'inactive'}
                label={prompt.is_active ? '활성' : '비활성'}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/admin/ai-prompts/${prompt.id}/edit`} className="flex-1">
                <Button variant="outline" size="sm" fullWidth>
                  수정
                </Button>
              </Link>
              {!prompt.is_active && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onActivate(prompt.id)}
                  className="flex-1"
                >
                  활성화
                </Button>
              )}
              {!prompt.is_active && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(prompt.id)}
                >
                  삭제
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow sm:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                프롬프트 이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                상태
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {prompts.map((prompt) => (
              <tr key={prompt.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {prompt.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{prompt.description}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(prompt.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge
                    status={prompt.is_active ? 'active' : 'inactive'}
                    label={prompt.is_active ? '활성' : '비활성'}
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/ai-prompts/${prompt.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      수정
                    </Link>
                    {!prompt.is_active && (
                      <>
                        <button
                          onClick={() => onActivate(prompt.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          활성화
                        </button>
                        <button
                          onClick={() => onDelete(prompt.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
