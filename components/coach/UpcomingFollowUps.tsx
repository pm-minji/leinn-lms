'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export function UpcomingFollowUps() {
  const [upcomingLogs, setUpcomingLogs] = useState<CoachingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingFollowUps = async () => {
      try {
        const response = await fetch('/api/coaching-logs/upcoming');
        if (!response.ok) {
          throw new Error('후속 일정을 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setUpcomingLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingFollowUps();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">다가오는 후속 일정</h2>
        <div className="mt-4 text-center text-sm text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">다가오는 후속 일정</h2>
        <div className="mt-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (upcomingLogs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">다가오는 후속 일정</h2>
        <div className="mt-4 text-center text-sm text-gray-500">
          다가오는 후속 일정이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-orange-900">
          다가오는 후속 일정
        </h2>
        <span className="rounded-full bg-orange-200 px-3 py-1 text-sm font-medium text-orange-900">
          {upcomingLogs.length}개
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {upcomingLogs.map((log) => {
          const followUpDate = log.follow_up_date
            ? new Date(log.follow_up_date).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
              })
            : '';

          const daysUntil = log.follow_up_date
            ? Math.ceil(
                (new Date(log.follow_up_date).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;

          return (
            <Link
              key={log.id}
              href={`/coaching-logs/${log.id}`}
              className="block rounded-md border border-orange-200 bg-white p-4 transition-colors hover:bg-orange-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{log.title}</h3>
                  {log.learners && (
                    <p className="mt-1 text-sm text-gray-600">
                      학습자: {log.learners.users.name}
                    </p>
                  )}
                  {log.teams && (
                    <p className="mt-1 text-sm text-gray-600">
                      팀: {log.teams.name}
                    </p>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium text-orange-900">
                    {followUpDate}
                  </p>
                  <p className="mt-1 text-xs text-orange-700">
                    {daysUntil === 0
                      ? '오늘'
                      : daysUntil === 1
                      ? '내일'
                      : `${daysUntil}일 후`}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/coaching-logs"
          className="text-sm font-medium text-orange-700 hover:text-orange-800"
        >
          모든 코칭 로그 보기 →
        </Link>
      </div>
    </div>
  );
}
