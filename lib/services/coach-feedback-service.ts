import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasRole } from '@/lib/auth/user-utils';
import { ApiError } from '@/lib/api/error-handler';
import { logError, logInfo } from '@/lib/utils/logger';
import { CoachFeedbackFormData } from '@/lib/validations/coach-feedback';

export async function saveCoachFeedback(
  userId: string,
  reflectionId: string,
  data: CoachFeedbackFormData
) {
  const supabase = await createClient();

  // Get user role using admin client
  const adminClient = createAdminClient();
  const { data: userData, error: userError } = await adminClient
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new ApiError(404, '사용자 정보를 찾을 수 없습니다');
  }

  if (!hasRole({ id: userId, email: '', role: userData.role }, 'coach')) {
    throw new ApiError(403, '코치만 피드백을 작성할 수 있습니다');
  }

  // Get coach record
  const { data: coach, error: coachError } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (coachError || !coach) {
    throw new ApiError(404, '코치 정보를 찾을 수 없습니다');
  }

  // Get reflection with team info
  const { data: reflection, error: reflectionError } = await supabase
    .from('reflections')
    .select('id, team_id, status')
    .eq('id', reflectionId)
    .single();

  if (reflectionError || !reflection) {
    throw new ApiError(404, '리플렉션을 찾을 수 없습니다');
  }

  // Verify coach has access to this team (skip for admin)
  if (userData.role === 'coach') {
    const teamId = reflection.team_id;
    if (!teamId) {
      throw new ApiError(400, '팀 정보가 없는 리플렉션입니다');
    }

    const { data: coachTeam, error: coachTeamError } = await supabase
      .from('coach_teams')
      .select('id')
      .eq('coach_id', coach.id)
      .eq('team_id', teamId)
      .single();

    if (coachTeamError || !coachTeam) {
      throw new ApiError(403, '담당 팀의 리플렉션만 피드백을 작성할 수 있습니다');
    }
  }

  // Update reflection with coach feedback
  const { data: updatedReflection, error: updateError } = await supabase
    .from('reflections')
    .update({
      coach_feedback: data.coach_feedback,
      status: 'coach_feedback_done',
      updated_at: new Date().toISOString(),
    })
    .eq('id', reflectionId)
    .select()
    .single();

  if (updateError) {
    logError('Failed to save coach feedback', updateError as Error, {
      reflectionId,
      coachId: coach.id,
    });
    throw new ApiError(500, '피드백 저장에 실패했습니다');
  }

  logInfo('Coach feedback saved successfully', {
    reflectionId,
    coachId: coach.id,
    previousStatus: reflection.status,
    newStatus: 'coach_feedback_done',
  });

  return updatedReflection;
}
