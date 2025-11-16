import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function CoachingLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch coaching log
  const sessionResponse = await supabase.auth.getSession();
  const accessToken = sessionResponse.data.session?.access_token;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/coaching-logs/${id}`,
    {
      headers: {
        Cookie: accessToken ? `sb-access-token=${accessToken}` : '',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    notFound();
  }

  const log = await response.json();

  const sessionDate = new Date(log.session_date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const followUpDate = log.follow_up_date
    ? new Date(log.follow_up_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const sessionTypeLabels: Record<string, string> = {
    '1:1': '1:1 코칭',
    'team': '팀 코칭',
    'weekly': '주간 코칭',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/coaching-logs"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← 코칭 로그 목록으로
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{log.title}</h1>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {sessionTypeLabels[log.session_type] || log.session_type}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                세션 날짜: {sessionDate}
              </p>
            </div>
            <StatusBadge
              status={log.status === 'open' ? 'submitted' : 'coach_feedback_done'}
            />
          </div>

          <div className="mt-6 grid gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2">
            {log.learners && (
              <div>
                <p className="text-sm font-medium text-gray-500">학습자</p>
                <p className="mt-1 text-base text-gray-900">
                  {log.learners.users.name}
                </p>
                <p className="text-sm text-gray-500">
                  {log.learners.users.email}
                </p>
              </div>
            )}
            {log.teams && (
              <div>
                <p className="text-sm font-medium text-gray-500">팀</p>
                <p className="mt-1 text-base text-gray-900">{log.teams.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">세션 메모</h2>
          <div className="mt-4 whitespace-pre-wrap text-gray-700">
            {log.notes}
          </div>
        </div>

        {/* Next Actions */}
        {log.next_actions && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-lg font-semibold text-blue-900">다음 액션</h2>
            <div className="mt-4 whitespace-pre-wrap text-blue-800">
              {log.next_actions}
            </div>
          </div>
        )}

        {/* Follow-up Date */}
        {followUpDate && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-lg font-semibold text-orange-900">
              후속 일정
            </h2>
            <p className="mt-2 text-orange-800">{followUpDate}</p>
            {log.status === 'open' && (
              <p className="mt-2 text-sm text-orange-700">
                이 코칭 로그는 아직 진행 중입니다
              </p>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-sm font-medium text-gray-500">기록 정보</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">생성일</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(log.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">수정일</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(log.updated_at).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
