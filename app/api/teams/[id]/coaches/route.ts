import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Check if user exists
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if team exists
    const { data: existingTeam } = await adminClient
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .single();

    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if coach exists for this user, create if not
    let { data: coach } = await adminClient
      .from('coaches')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (!coach) {
      const { data: newCoach, error: coachError } = await adminClient
        .from('coaches')
        .insert({
          user_id,
          active: true,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (coachError) {
        return NextResponse.json({ error: 'Failed to create coach' }, { status: 500 });
      }

      coach = newCoach;
    }

    // Check if coach is already assigned to this team
    const { data: existingAssignment } = await adminClient
      .from('coach_teams')
      .select('id')
      .eq('coach_id', coach.id)
      .eq('team_id', teamId)
      .single();

    if (existingAssignment) {
      return NextResponse.json({ error: 'Coach is already assigned to this team' }, { status: 400 });
    }

    // Create coach-team assignment
    const { error: assignmentError } = await adminClient
      .from('coach_teams')
      .insert({
        coach_id: coach.id,
        team_id: teamId,
        created_at: new Date().toISOString(),
      });

    if (assignmentError) {
      return NextResponse.json({ error: 'Failed to assign coach to team' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding coach to team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}