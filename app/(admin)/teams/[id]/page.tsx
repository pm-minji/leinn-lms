import { createClient } from '@/lib/supabase/server';
import { TeamForm } from '@/components/admin/TeamForm';
import { notFound } from 'next/navigation';

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !team) {
    notFound();
  }

  // Get team statistics
  const { count: learnerCount } = await supabase
    .from('learners')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', id)
    .eq('active', true);

  const { count: coachCount } = await supabase
    .from('coach_teams')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">팀 상세</h1>
        <p className="mt-1 text-sm text-gray-500">
          팀 정보를 수정합니다
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">학습자 수</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {learnerCount || 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">담당 코치 수</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {coachCount || 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">생성일</div>
          <div className="mt-2 text-lg font-semibold text-gray-900">
            {new Date(team.created_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">팀 정보 수정</h2>
        <TeamForm team={team} />
      </div>
    </div>
  );
}
