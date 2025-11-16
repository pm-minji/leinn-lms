import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ReflectionFormData } from '@/lib/validations/reflection';
import { ApiError } from '@/lib/api/error-handler';
import { logError, logInfo } from '@/lib/utils/logger';

export async function createReflection(
  userId: string,
  data: ReflectionFormData
) {
  const supabase = await createClient();

  // Get learner record
  const { data: learner, error: learnerError } = await supabase
    .from('learners')
    .select('id, team_id')
    .eq('user_id', userId)
    .single();

  if (learnerError || !learner) {
    throw new ApiError(404, '학습자 정보를 찾을 수 없습니다');
  }

  // Create reflection
  const { data: reflection, error: reflectionError } = await supabase
    .from('reflections')
    .insert({
      learner_id: learner.id,
      team_id: learner.team_id,
      title: data.title,
      content: data.content,
      week_start: data.week_start,
      status: 'submitted',
    })
    .select()
    .single();

  if (reflectionError) {
    throw new ApiError(500, '리플렉션 저장에 실패했습니다');
  }

  logInfo('Reflection created successfully', {
    reflectionId: reflection.id,
    learnerId: learner.id,
  });

  // Trigger AI analysis asynchronously
  triggerAIAnalysis(reflection.id).catch((error) => {
    logError('AI analysis trigger failed', error as Error, {
      reflectionId: reflection.id,
    });
  });

  return reflection;
}

async function triggerAIAnalysis(reflectionId: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reflectionId }),
    });
  } catch (error) {
    logError('Failed to trigger AI analysis', error as Error, {
      reflectionId,
    });
    
    // Update status to pending if trigger fails
    const supabase = await createClient();
    await supabase
      .from('reflections')
      .update({ status: 'ai_feedback_pending' })
      .eq('id', reflectionId);

    logInfo('Updated reflection status to ai_feedback_pending', {
      reflectionId,
    });
  }
}

export async function getReflections(userId: string) {
  const supabase = await createClient();

  // Get learner record
  const { data: learner, error: learnerError } = await supabase
    .from('learners')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (learnerError || !learner) {
    throw new ApiError(404, '학습자 정보를 찾을 수 없습니다');
  }

  // Get reflections
  const { data: reflections, error: reflectionsError } = await supabase
    .from('reflections')
    .select('*')
    .eq('learner_id', learner.id)
    .order('created_at', { ascending: false });

  if (reflectionsError) {
    throw new ApiError(500, '리플렉션 조회에 실패했습니다');
  }

  return reflections;
}

export async function getReflectionById(userId: string, reflectionId: string) {
  const supabase = await createClient();

  // Get learner record
  const { data: learner, error: learnerError } = await supabase
    .from('learners')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (learnerError || !learner) {
    throw new ApiError(404, '학습자 정보를 찾을 수 없습니다');
  }

  // Get reflection
  const { data: reflection, error: reflectionError } = await supabase
    .from('reflections')
    .select('*')
    .eq('id', reflectionId)
    .eq('learner_id', learner.id)
    .single();

  if (reflectionError || !reflection) {
    throw new ApiError(404, '리플렉션을 찾을 수 없습니다');
  }

  return reflection;
}

export async function getReflectionByIdForCoach(
  userId: string,
  reflectionId: string
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

  // Get reflection with learner info
  const { data: reflection, error: reflectionError } = await supabase
    .from('reflections')
    .select(
      `
      *,
      learners!inner (
        id,
        team_id,
        users!inner (
          id,
          name,
          email
        )
      )
    `
    )
    .eq('id', reflectionId)
    .single();

  if (reflectionError || !reflection) {
    throw new ApiError(404, '리플렉션을 찾을 수 없습니다');
  }

  // If coach, verify they have access to this team
  if (userData.role === 'coach') {
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!coach) {
      throw new ApiError(404, '코치 정보를 찾을 수 없습니다');
    }

    const learnerTeamId = reflection.learners.team_id;
    if (!learnerTeamId) {
      throw new ApiError(403, '팀 정보가 없는 리플렉션입니다');
    }

    const { data: coachTeam } = await supabase
      .from('coach_teams')
      .select('id')
      .eq('coach_id', coach.id)
      .eq('team_id', learnerTeamId)
      .single();

    if (!coachTeam) {
      throw new ApiError(403, '이 리플렉션에 대한 접근 권한이 없습니다');
    }
  }

  return reflection;
}
