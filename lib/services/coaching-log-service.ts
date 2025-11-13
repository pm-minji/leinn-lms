import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api/error-handler';
import { logError, logInfo } from '@/lib/utils/logger';
import { CoachingLogFormData } from '@/lib/validations/coaching-log';

export async function createCoachingLog(
  userId: string,
  data: CoachingLogFormData
) {
  const supabase = await createClient();

  // Get user role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new ApiError(404, '사용자 정보를 찾을 수 없습니다');
  }

  if (userData.role !== 'coach' && userData.role !== 'admin') {
    throw new ApiError(403, '코치만 코칭 로그를 작성할 수 있습니다');
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

  // Verify coach has access to the team (skip for admin)
  if (userData.role === 'coach' && data.team_id) {
    const { data: coachTeam, error: coachTeamError } = await supabase
      .from('coach_teams')
      .select('id')
      .eq('coach_id', coach.id)
      .eq('team_id', data.team_id)
      .single();

    if (coachTeamError || !coachTeam) {
      throw new ApiError(403, '담당 팀에 대해서만 코칭 로그를 작성할 수 있습니다');
    }
  }

  // If learner_id is provided, verify it belongs to the coach's team
  if (userData.role === 'coach' && data.learner_id) {
    const { data: learner, error: learnerError } = await supabase
      .from('learners')
      .select('team_id')
      .eq('id', data.learner_id)
      .single();

    if (learnerError || !learner) {
      throw new ApiError(404, '학습자를 찾을 수 없습니다');
    }

    // Verify coach has access to learner's team
    const { data: coachTeam, error: coachTeamError } = await supabase
      .from('coach_teams')
      .select('id')
      .eq('coach_id', coach.id)
      .eq('team_id', learner.team_id)
      .single();

    if (coachTeamError || !coachTeam) {
      throw new ApiError(403, '담당 팀의 학습자에 대해서만 코칭 로그를 작성할 수 있습니다');
    }
  }

  // Create coaching log
  const { data: coachingLog, error: createError } = await supabase
    .from('coaching_logs')
    .insert({
      coach_id: coach.id,
      learner_id: data.learner_id || null,
      team_id: data.team_id || null,
      title: data.title,
      session_date: data.session_date,
      session_type: data.session_type,
      notes: data.notes,
      next_actions: data.next_actions || null,
      follow_up_date: data.follow_up_date || null,
      status: data.status || 'open',
    })
    .select()
    .single();

  if (createError) {
    logError('Failed to create coaching log', createError as Error, {
      coachId: coach.id,
      sessionType: data.session_type,
    });
    throw new ApiError(500, '코칭 로그 저장에 실패했습니다');
  }

  logInfo('Coaching log created successfully', {
    coachingLogId: coachingLog.id,
    coachId: coach.id,
    sessionType: data.session_type,
  });

  return coachingLog;
}

export async function getCoachingLogs(userId: string, filters?: {
  session_type?: string;
  status?: string;
  team_id?: string;
  learner_id?: string;
}) {
  const supabase = await createClient();

  // Get user role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new ApiError(404, '사용자 정보를 찾을 수 없습니다');
  }

  if (userData.role !== 'coach' && userData.role !== 'admin') {
    throw new ApiError(403, '코치만 코칭 로그를 조회할 수 있습니다');
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

  // Build query
  let query = supabase
    .from('coaching_logs')
    .select(`
      *,
      learners:learner_id (
        id,
        users:user_id (
          name,
          email
        )
      ),
      teams:team_id (
        id,
        name
      )
    `)
    .eq('coach_id', coach.id)
    .order('session_date', { ascending: false });

  // Apply filters
  if (filters?.session_type) {
    query = query.eq('session_type', filters.session_type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.team_id) {
    query = query.eq('team_id', filters.team_id);
  }
  if (filters?.learner_id) {
    query = query.eq('learner_id', filters.learner_id);
  }

  const { data: coachingLogs, error: logsError } = await query;

  if (logsError) {
    logError('Failed to fetch coaching logs', logsError as Error, {
      coachId: coach.id,
    });
    throw new ApiError(500, '코칭 로그 조회에 실패했습니다');
  }

  return coachingLogs;
}

export async function getCoachingLogById(userId: string, logId: string) {
  const supabase = await createClient();

  // Get user role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new ApiError(404, '사용자 정보를 찾을 수 없습니다');
  }

  if (userData.role !== 'coach' && userData.role !== 'admin') {
    throw new ApiError(403, '코치만 코칭 로그를 조회할 수 있습니다');
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

  // Get coaching log
  const { data: coachingLog, error: logError } = await supabase
    .from('coaching_logs')
    .select(`
      *,
      learners:learner_id (
        id,
        users:user_id (
          name,
          email
        )
      ),
      teams:team_id (
        id,
        name
      )
    `)
    .eq('id', logId)
    .eq('coach_id', coach.id)
    .single();

  if (logError || !coachingLog) {
    throw new ApiError(404, '코칭 로그를 찾을 수 없습니다');
  }

  return coachingLog;
}

export async function getUpcomingFollowUps(userId: string, daysAhead: number = 7) {
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

  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  // Get coaching logs with upcoming follow-up dates
  const { data: upcomingLogs, error: logsError } = await supabase
    .from('coaching_logs')
    .select(`
      *,
      learners:learner_id (
        id,
        users:user_id (
          name,
          email
        )
      ),
      teams:team_id (
        id,
        name
      )
    `)
    .eq('coach_id', coach.id)
    .eq('status', 'open')
    .not('follow_up_date', 'is', null)
    .gte('follow_up_date', today)
    .lte('follow_up_date', futureDateStr)
    .order('follow_up_date', { ascending: true });

  if (logsError) {
    logError('Failed to fetch upcoming follow-ups', logsError as Error, {
      coachId: coach.id,
    });
    throw new ApiError(500, '후속 일정 조회에 실패했습니다');
  }

  return upcomingLogs;
}
