import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LearnerList } from '@/components/coach/LearnerList';
import { ReflectionCard } from '@/components/reflections/ReflectionCard';
import Link from 'next/link';

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user info
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    redirect('/auth/login');
  }

  // Check if user is coach or admin
  if (userData.role !== 'coach' && userData.role !== 'admin') {
    redirect('/dashboard');
  }

  // Verify coach has access to this team
  if (userData.role === 'coach') {
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!coach) {
      redirect('/coach/dashboard');
    }

    const { data: coachTeam } = await supabase
      .from('coach_teams')
      .select('id')
      .eq('coach_id', coach.id)
      .eq('team_id', params.id)
      .single();

    if (!coachTeam) {
      redirect('/coach/dashboard');
    }
  }

  // Get team info
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', params.id)
    .single();

  if (teamError || !team) {
    redirect('/coach/dashboard');
  }

  // Fetch learners
  const learnersResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/teams/${params.id}/learners`,
    {
      headers: {
        Cookie: `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    }
  );

  const learners = learnersResponse.ok ? await learnersResponse.json() : [];

  // Fetch recent reflections
  const reflectionsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/teams/${params.id}/reflections`,
    {
      headers: {
        Cookie: `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    }
  );

  const allReflections = reflectionsResponse.ok
    ? await reflectionsResponse.json()
    : [];
  const recentReflections = allReflections.slice(0, 6);

  const pendingCount = allReflections.filter((r: any) =>
    ['submitted', 'ai_feedback_done', 'ai_feedback_pending'].includes(r.status)
  ).length;

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="mb-8">
        <Link
          href="/coach/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← 대시보드로 돌아가기
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">{team.name}</h1>
        <p className="mt-2 text-gray-600">
          팀 학습자와 리플렉션 현황을 확인하세요
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-600">팀 학습자</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {learners.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-600">전체 리플렉션</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {allReflections.length}
          </p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <p className="text-sm font-medium text-orange-900">피드백 대기</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Learners Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">팀 학습자</h2>
        <LearnerList learners={learners} teamId={params.id} />
      </div>

      {/* Recent Reflections Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            최근 리플렉션
          </h2>
          {allReflections.length > 6 && (
            <p className="text-sm text-gray-500">
              {allReflections.length}개 중 최근 6개 표시
            </p>
          )}
        </div>
        {recentReflections.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">아직 제출된 리플렉션이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentReflections.map((reflection: any) => (
              <ReflectionCard key={reflection.id} reflection={reflection} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
