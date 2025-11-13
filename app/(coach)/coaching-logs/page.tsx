import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CoachingLogList } from '@/components/coach/CoachingLogList';

export default async function CoachingLogsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch coaching logs
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/coaching-logs`,
    {
      headers: {
        Cookie: (await supabase.auth.getSession()).data.session?.access_token
          ? `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`
          : '',
      },
      cache: 'no-store',
    }
  );

  const logs = response.ok ? await response.json() : [];

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
          href="/coaching-logs/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          새 코칭 로그
        </Link>
      </div>

      <CoachingLogList logs={logs} />
    </div>
  );
}
