import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api/error-handler';

export interface TeamWithStats {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  learner_count: number;
  total_reflections: number;
  pending_feedback_count: number;
  submission_rate: number;
}

export async function getCoachTeams(userId: string): Promise<TeamWithStats[]> {
  const supabase = await createClient();

  // Get coach record
  const { data: coach, error: coachError } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (coachError || !coach) {
    throw new ApiError(404, '코치 정보를 찾을 수 없습니다');
  }

  // Get teams assigned to this coach
  const { data: coachTeams, error: coachTeamsError } = await supabase
    .from('coach_teams')
    .select('team_id')
    .eq('coach_id', coach.id);

  if (coachTeamsError) {
    throw new ApiError(500, '담당 팀 조회에 실패했습니다');
  }

  if (!coachTeams || coachTeams.length === 0) {
    return [];
  }

  const teamIds = coachTeams.map((ct) => ct.team_id);

  // Get teams with basic info
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .in('id', teamIds)
    .order('name');

  if (teamsError) {
    throw new ApiError(500, '팀 정보 조회에 실패했습니다');
  }

  // Get stats for each team
  const teamsWithStats = await Promise.all(
    teams.map(async (team) => {
      // Get learner count
      const { count: learnerCount } = await supabase
        .from('learners')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)
        .eq('active', true);

      // Get total reflections count
      const { count: totalReflections } = await supabase
        .from('reflections')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id);

      // Get pending feedback count
      const { count: pendingFeedbackCount } = await supabase
        .from('reflections')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)
        .in('status', ['submitted', 'ai_feedback_done', 'ai_feedback_pending']);

      // Calculate submission rate (reflections with coach feedback / total learners)
      const { count: completedReflections } = await supabase
        .from('reflections')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)
        .eq('status', 'coach_feedback_done');

      const submissionRate =
        learnerCount && learnerCount > 0
          ? Math.round(((completedReflections || 0) / learnerCount) * 100)
          : 0;

      return {
        ...team,
        learner_count: learnerCount || 0,
        total_reflections: totalReflections || 0,
        pending_feedback_count: pendingFeedbackCount || 0,
        submission_rate: submissionRate,
      };
    })
  );

  return teamsWithStats;
}
