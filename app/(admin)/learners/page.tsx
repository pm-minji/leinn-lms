import { createClient } from '@/lib/supabase/server';
import { LearnerTeamAssignment } from '@/components/admin/LearnerTeamAssignment';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function LearnersPage() {
  const supabase = await createClient();

  // Get all learners with user and team information
  const { data: learners } = await supabase
    .from('learners')
    .select(`
      id,
      user_id,
      team_id,
      joined_at,
      active,
      users (
        name,
        email
      ),
      teams (
        name
      )
    `)
    .order('joined_at', { ascending: false });

  // Get all active teams for the assignment dropdown
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, active')
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">학습자 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          학습자를 팀에 배정하고 관리합니다
        </p>
      </div>

      {!learners || learners.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">등록된 학습자가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {learners.map((learner) => (
            <div
              key={learner.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow"
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {learner.users?.name || '이름 없음'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {learner.users?.email || '이메일 없음'}
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        현재 팀:
                      </span>
                      {learner.teams?.name ? (
                        <span className="text-sm text-gray-900">
                          {learner.teams.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          배정되지 않음
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        상태:
                      </span>
                      <StatusBadge
                        status={learner.active ? 'active' : 'inactive'}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        가입일:
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(learner.joined_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-900">
                    팀 배정
                  </h4>
                  <LearnerTeamAssignment
                    learnerId={learner.id}
                    currentTeamId={learner.team_id}
                    teams={teams || []}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
