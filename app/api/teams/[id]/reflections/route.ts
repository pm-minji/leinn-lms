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

    // Get reflections with learner info
    const { data: reflections, error: reflectionsError } = await supabase
      .from('reflections')
      .select(
        `
        *,
        learners!inner (
          id,
          users!inner (
            id,
            name,
            email
          )
        )
      `
      )
      .eq('team_id', params.id)
      .order('created_at', { ascending: false });

    if (reflectionsError) {
      throw new ApiError(500, '리플렉션 목록 조회에 실패했습니다');
    }

    return NextResponse.json(reflections);
  } catch (error) {
    return handleApiError(error);
  }
}
