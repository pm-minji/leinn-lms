import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();
  const { data: userData } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // 코치와 관리자만 접근 가능
  if (userData?.role !== 'coach' && userData?.role !== 'admin') {
    redirect('/learner/dashboard');
  }

  // Get coach data
  const { data: coachData } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // Get assigned teams
  const { data: teams } = await supabase
    .from('coach_teams')
    .select(`
      team_id,
      teams (
        id,
        name,
        active
      )
    `)
    .eq('coach_id', coachData?.id || '');

  // Get pending reflections count
  const { count: pendingCount } = await supabase
    .from('reflections')
    .select('id', { count: 'exact', head: true })
    .in('team_id', teams?.map((t: any) => t.teams.id) || [])
    .eq('status', 'ai_feedback_done');

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">코치 대시보드</h1>
          <p className="mt-2 text-gray-600">담당 팀의 학습 현황을 확인하고 코칭하세요</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">담당 팀</h3>
            <p className="text-4xl font-bold text-indigo-600">{teams?.length || 0}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">피드백 대기</h3>
            <p className="text-4xl font-bold text-orange-600">{pendingCount || 0}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">이번 주 코칭</h3>
            <p className="text-4xl font-bold text-green-600">0</p>
          </div>
        </div>

        {/* My Teams */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">내 팀들</h2>
          {teams && teams.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {teams.map((teamData: any) => (
                <Link
                  key={teamData.team_id}
                  href={`/coach/coach-teams/${teamData.teams.id}`}
                  className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                >
                  <h3 className="font-semibold text-gray-900">{teamData.teams.name}</h3>
                  <p className="text-sm text-gray-600">
                    {teamData.teams.active ? '활성' : '비활성'}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">할당된 팀이 없습니다.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/coach/reflections"
            className="block rounded-lg bg-indigo-600 p-6 text-center text-white hover:bg-indigo-700"
          >
            <h3 className="text-xl font-semibold">리플렉션 관리</h3>
            <p className="mt-2 text-indigo-100">팀 리플렉션 확인 및 피드백</p>
          </Link>
          <Link
            href="/coach/coaching-logs/new"
            className="block rounded-lg border-2 border-indigo-600 p-6 text-center text-indigo-600 hover:bg-indigo-50"
          >
            <h3 className="text-xl font-semibold">코칭 로그 작성</h3>
            <p className="mt-2 text-indigo-500">새로운 코칭 세션 기록</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
