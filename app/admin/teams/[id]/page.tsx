import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { TeamForm } from '@/components/admin/TeamForm';
import { TeamMemberManagement } from '@/components/admin/TeamMemberManagement';
import { RecentReflections } from '@/components/admin/RecentReflections';
import { TeamActivity } from '@/components/admin/TeamActivity';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !team) {
    notFound();
  }

  // Get team learners with user info
  const { data: learners } = await supabase
    .from('learners')
    .select(`
      id,
      user_id,
      joined_at,
      active,
      users!inner (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('team_id', id)
    .eq('active', true)
    .order('joined_at', { ascending: false });

  // Get team coaches with user info
  const { data: coaches } = await supabase
    .from('coach_teams')
    .select(`
      id,
      coach_id,
      coaches!inner (
        id,
        user_id,
        users!inner (
          id,
          name,
          email,
          avatar_url
        )
      )
    `)
    .eq('team_id', id);

  // Get available users for assignment (not already in this team)
  const assignedUserIds = [
    ...(learners?.map(l => l.user_id) || []),
    ...(coaches?.map(c => c.coaches.user_id) || [])
  ];

  const { data: availableUsers } = await adminClient
    .from('users')
    .select('id, name, email, role')
    .not('id', 'in', `(${assignedUserIds.join(',')})`)
    .order('name');

  // Get recent reflections count
  const { count: reflectionCount } = await supabase
    .from('reflections')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/teams" className="text-blue-600 hover:underline text-sm">
            ← 팀 목록으로 돌아가기
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{team.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            팀 정보 및 멤버를 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            team.active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {team.active ? '활성' : '비활성'}
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">학습자</div>
          <div className="mt-2 text-3xl font-semibold text-indigo-600">
            {learners?.length || 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">담당 코치</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {coaches?.length || 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">리플렉션</div>
          <div className="mt-2 text-3xl font-semibold text-orange-600">
            {reflectionCount || 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">생성일</div>
          <div className="mt-2 text-lg font-semibold text-gray-900">
            {new Date(team.created_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      {/* Team Settings */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">팀 설정</h2>
        <TeamForm team={team} />
      </div>

      {/* Team Members Management */}
      <TeamMemberManagement 
        teamId={id}
        learners={learners || []}
        coaches={coaches || []}
        availableUsers={availableUsers || []}
      />

      {/* Recent Reflections */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">최근 리플렉션</h2>
          <Link
            href={`/admin/reflections?team=${id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            전체보기
          </Link>
        </div>
        
        <RecentReflections teamId={id} />
      </div>

      {/* Team Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">팀 활동 현황</h2>
        <TeamActivity teamId={id} />
      </div>
    </div>
  );
}
