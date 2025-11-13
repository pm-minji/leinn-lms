'use client';

import { useState } from 'react';
import { CoachingLogCard } from './CoachingLogCard';
import { Database } from '@/types/supabase';

type CoachingLog = Database['public']['Tables']['coaching_logs']['Row'] & {
  learners?: {
    id: string;
    users: {
      name: string;
      email: string;
    };
  } | null;
  teams?: {
    id: string;
    name: string;
  } | null;
};

interface CoachingLogListProps {
  logs: CoachingLog[];
}

export function CoachingLogList({ logs }: CoachingLogListProps) {
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (sessionTypeFilter !== 'all' && log.session_type !== sessionTypeFilter) {
      return false;
    }
    if (statusFilter !== 'all' && log.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            세션 유형
          </label>
          <select
            value={sessionTypeFilter}
            onChange={(e) => setSessionTypeFilter(e.target.value)}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="1:1">1:1 코칭</option>
            <option value="team">팀 코칭</option>
            <option value="weekly">주간 코칭</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            상태
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="open">진행 중</option>
            <option value="done">완료</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filteredLogs.length}개의 코칭 로그
      </div>

      {/* Logs list */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">코칭 로그가 없습니다</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLogs.map((log) => (
            <CoachingLogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
