import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/api/error-handler';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';
import { NextResponse } from 'next/server';
import { coachTeamAssignmentSchema } from '@/lib/validations/coach-team';

export async function POST(request: Request) {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return NextResponse.json(
        { error: error || '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Only admins can assign coaches to teams
    if (!hasRole(user, 'admin')) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = coachTeamAssignmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { coach_id, team_id } = validationResult.data;

    // Verify coach exists and is active
    const supabase = await createClient();
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .select('active')
      .eq('id', coach_id)
      .single();

    if (coachError || !coach) {
      return NextResponse.json(
        { error: '코치를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (!coach.active) {
      return NextResponse.json(
        { error: '비활성화된 코치는 팀에 할당할 수 없습니다' },
        { status: 400 }
      );
    }

    // Verify team exists and is active
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
        { error: '비활성화된 팀에는 코치를 할당할 수 없습니다' },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabase
      .from('coach_teams')
      .select('id')
      .eq('coach_id', coach_id)
      .eq('team_id', team_id)
      .single();

    if (existingAssignment) {
      return NextResponse.json(
        { error: '이미 해당 팀에 할당된 코치입니다' },
        { status: 400 }
      );
    }

    // Create coach-team assignment
    const { data: assignment, error: insertError } = await supabase
      .from('coach_teams')
      .insert({ coach_id, team_id })
      .select()
      .single();

    if (insertError || !assignment) {
      return NextResponse.json(
        { error: '코치 팀 할당에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return NextResponse.json(
        { error: error || '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Only admins can remove coach-team assignments
    if (!hasRole(user, 'admin')) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const coach_id = searchParams.get('coach_id');
    const team_id = searchParams.get('team_id');

    if (!coach_id || !team_id) {
      return NextResponse.json(
        { error: 'coach_id와 team_id가 필요합니다' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error: deleteError } = await supabase
      .from('coach_teams')
      .delete()
      .eq('coach_id', coach_id)
      .eq('team_id', team_id);

    if (deleteError) {
      return NextResponse.json(
        { error: '코치 팀 할당 해제에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
