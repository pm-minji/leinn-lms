import { createClient } from '@/lib/supabase/server';
import { handleApiError, ApiError } from '@/lib/api/error-handler';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Only coaches and admins can access this endpoint
    if (userData.role !== 'coach' && userData.role !== 'admin') {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    // Verify coach has access to this team
    if (userData.role === 'coach') {
      const { data: coach } = await supabase
        .from('coaches')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!coach) {
        throw new ApiError(404, '코치 정보를 찾을 수 없습니다');
      }

      const { data: coachTeam } = await supabase
        .from('coach_teams')
        .select('id')
        .eq('coach_id', coach.id)
        .eq('team_id', params.id)
        .single();

      if (!coachTeam) {
        return NextResponse.json(
          { error: '이 팀에 대한 접근 권한이 없습니다' },
          { status: 403 }
        );
      }
    }

    // Get learners with user info and recent reflection
    const { data: learners, error: learnersError } = await supabase
      .from('learners')
      .select(
        `
        id,
        user_id,
        team_id,
        joined_at,
        active,
        users!inner (
          id,
          name,
          email,
          avatar_url
        )
      `
      )
      .eq('team_id', params.id)
      .eq('active', true)
      .order('joined_at', { ascending: false });

    if (learnersError) {
      throw new ApiError(500, '학습자 목록 조회에 실패했습니다');
    }

    // Get recent reflection for each learner
    const learnersWithReflections = await Promise.all(
      learners.map(async (learner) => {
        const { data: recentReflection } = await supabase
          .from('reflections')
          .select('id, title, status, created_at')
          .eq('learner_id', learner.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { count: totalReflections } = await supabase
          .from('reflections')
          .select('*', { count: 'exact', head: true })
          .eq('learner_id', learner.id);

        const { count: pendingFeedback } = await supabase
          .from('reflections')
          .select('*', { count: 'exact', head: true })
          .eq('learner_id', learner.id)
          .in('status', ['submitted', 'ai_feedback_done', 'ai_feedback_pending']);

        return {
          ...learner,
          recent_reflection: recentReflection || null,
          total_reflections: totalReflections || 0,
          pending_feedback: pendingFeedback || 0,
        };
      })
    );

    return NextResponse.json(learnersWithReflections);
  } catch (error) {
    return handleApiError(error);
  }
}
