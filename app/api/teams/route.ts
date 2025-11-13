import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/api/error-handler';
import { getCoachTeams } from '@/lib/services/team-service';
import { NextResponse } from 'next/server';
import { teamSchema } from '@/lib/validations/team';

export async function GET() {
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

    // Admins can see all teams, coaches see their assigned teams
    if (userData.role === 'admin') {
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamsError) {
        return NextResponse.json(
          { error: '팀 목록을 불러오는데 실패했습니다' },
          { status: 500 }
        );
      }

      return NextResponse.json(teams);
    }

    // Only coaches and admins can access this endpoint
    if (userData.role !== 'coach' && userData.role !== 'admin') {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    const teams = await getCoachTeams(user.id);

    return NextResponse.json(teams);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
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

    // Only admins can create teams
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = teamSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, active } = validationResult.data;

    const { data: team, error: insertError } = await supabase
      .from('teams')
      .insert({ name, active })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: '팀 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
