import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/api/error-handler';
import { NextResponse } from 'next/server';
import { learnerTeamAssignmentSchema } from '@/lib/validations/learner';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Only admins can assign learners to teams
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = learnerTeamAssignmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { team_id } = validationResult.data;

    // Check if learner exists
    const { data: learner, error: learnerError } = await supabase
      .from('learners')
      .select('*')
      .eq('id', id)
      .single();

    if (learnerError || !learner) {
      return NextResponse.json(
        { error: '학습자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // If team_id is provided, verify the team exists and is active
    if (team_id) {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('active')
        .eq('id', team_id)
        .single();

      if (teamError || !team) {
        return NextResponse.json(
          { error: '팀을 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      if (!team.active) {
        return NextResponse.json(
          { error: '비활성화된 팀에는 학습자를 배정할 수 없습니다' },
          { status: 400 }
        );
      }
    }

    // Update learner's team assignment
    const { data: updatedLearner, error: updateError } = await supabase
      .from('learners')
      .update({ team_id })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedLearner) {
      return NextResponse.json(
        { error: '학습자 팀 배정에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedLearner);
  } catch (error) {
    return handleApiError(error);
  }
}
