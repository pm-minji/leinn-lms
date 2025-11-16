'use client';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { TeamInlineEditor } from './TeamInlineEditor';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

interface TeamListProps {
  teams: Team[];
}

export function TeamList({ teams }: TeamListProps) {
  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">등록된 팀이 없습니다</p>
        <Link
          href="/admin/teams/new"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          첫 팀 생성하기
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="space-y-4 sm:hidden">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">
                  {team.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(team.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <StatusBadge
                status={team.active ? 'active' : 'inactive'}
                label={team.active ? '활성' : '비활성'}
              />
            </div>
            <div className="mt-4">
              <Link
                href={`/admin/teams/${team.id}`}
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                상세보기
              </Link>
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
                팀 이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                생성일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {team.name}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge
                    status={team.active ? 'active' : 'inactive'}
                    label={team.active ? '활성' : '비활성'}
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(team.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <TeamInlineEditor team={team} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
