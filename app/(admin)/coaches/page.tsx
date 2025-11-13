import { createClient } from '@/lib/supabase/server';
import { CoachTeamAssignment } from '@/components/admin/CoachTeamAssignment';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function CoachesPage() {
  const supabase = await createClient();

  // Get all coaches with user information
  const { data: coaches } = await supabase
    .from('coaches')
    .select(`
      id,
      user_id,
      specialty,
      active,
      created_at,
      users (
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  // Get all teams
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, active')
    .order('name');

  // Get all coach-team assignments
  const { data: coachTeams } = await supabase
    .from('coach_teams')
    .select('coach_id, team_id');

  // Create a map of coach assignments
  const coachTeamMap = new Map<string, string[]>();
  coachTeams?.forEach((ct) => {
    const existing = coachTeamMap.get(ct.coach_id) || [];
    coachTeamMap.set(ct.coach_id, [...existing, ct.team_id]);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">코치 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          코치를 팀에 할당하고 관리합니다
        </p>
      </div>

      {!coaches || coaches.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">등록된 코치가 없습니다</p>
          <p className="mt-2 text-sm text-gray-400">
            사용자 관리에서 사용자의 역할을 코치로 변경하면 코치가 생성됩니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {coaches.map((coach) => {
            const assignedTeamIds = coachTeamMap.get(coach.id) || [];
            const assignedTeams = teams?.filter((t) =>
              assignedTeamIds.includes(t.id)
            ) || [];

            return (
              <div
                key={coach.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {coach.users?.name || '이름 없음'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {coach.users?.email || '이메일 없음'}
                    </p>
                    <div className="mt-4 space-y-2">
                      {coach.specialty && coach.specialty.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            전문 분야:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {coach.specialty.map((spec, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          상태:
                        </span>
                        <StatusBadge
                          status={coach.active ? 'active' : 'inactive'}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          담당 팀 수:
                        </span>
                        <span className="text-sm text-gray-900">
                          {assignedTeams.length}개
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-900">
                      팀 할당 관리
                    </h4>
                    <CoachTeamAssignment
                      coachId={coach.id}
                      teams={teams || []}
                      assignedTeamIds={assignedTeamIds}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
