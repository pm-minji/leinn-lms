import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CoachingLogList } from '@/components/coach/CoachingLogList';
import { getCoachingLogs } from '@/lib/services/coaching-log-service';

export default async function CoachingLogsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch coaching logs directly from service
  let logs: any[] = [];
  try {
    logs = await getCoachingLogs(user.id);
  } catch (error) {
    console.error('Failed to fetch coaching logs:', error);
    logs = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">코칭 로그</h1>
          <p className="mt-2 text-sm text-gray-600">
            학습자 및 팀과의 코칭 세션 기록을 관리하세요
          </p>
        </div>
        <Link
          href="/coach/coaching-logs/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          새 코칭 로그
        </Link>
      </div>

      <CoachingLogList logs={logs} />
    </div>
  );
}
