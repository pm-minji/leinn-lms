import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasRole } from '@/lib/auth/user-utils';
import { ApiError } from '@/lib/api/error-handler';
import { logError, logInfo } from '@/lib/utils/logger';
import { CoachingLogFormData } from '@/lib/validations/coaching-log';
import type { Database } from '@/types/supabase';

type SessionType = Database['public']['Tables']['coaching_logs']['Row']['session_type'];
type CoachingLogStatus = Database['public']['Tables']['coaching_logs']['Row']['status'];

export async function createCoachingLog(
  userId: string,
  data: CoachingLogFormData
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

  // 단순화된 접근: 코치는 자유롭게 코칭 로그를 작성할 수 있음
  // 학습자 이름과 팀 이름은 텍스트로 저장되므로 별도 검증 불필요

  // Create coaching log - 학습자/팀 이름을 메모에 포함
  let notesWithContext = data.notes;
  if (data.learner_name || data.team_name) {
    const contextInfo = [];
    if (data.learner_name) contextInfo.push(`학습자: ${data.learner_name}`);
    if (data.team_name) contextInfo.push(`팀: ${data.team_name}`);
    notesWithContext = `${contextInfo.join(', ')}\n\n${data.notes}`;
  }

  const { data: coachingLog, error: createError } = await supabase
    .from('coaching_logs')
    .insert({
      coach_id: coach.id,
      learner_id: null, // 더 이상 필수가 아님
      team_id: null,    // 더 이상 필수가 아님
      title: data.title,
      session_date: data.session_date,
      session_type: '1:1', // 기본값 설정
      notes: notesWithContext,
      next_actions: data.next_actions || null,
      follow_up_date: data.follow_up_date || null,
      status: data.status || 'open',
    })
    .select()
    .single();

  if (createError) {
    console.error('Failed to create coaching log:', createError);
    logError('Failed to create coaching log', createError as Error, {
      coachId: coach.id,
    });
    throw new ApiError(500, `코칭 로그 저장에 실패했습니다: ${createError.message}`);
  }

  logInfo('Coaching log created successfully', {
    coachingLogId: coachingLog.id,
    coachId: coach.id,
    sessionType: coachingLog.session_type,
  });

  return coachingLog;
}

export async function getCoachingLogs(userId: string, filters?: {
  session_type?: SessionType;
  status?: CoachingLogStatus;
  team_id?: string;
  learner_id?: string;
}) {
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
