import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; coachTeamId: string }> }
) {
  try {
    const { id: teamId, coachTeamId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Check if coach-team assignment exists
    const { data: existingAssignment } = await adminClient
      .from('coach_teams')
      .select('id, team_id')
      .eq('id', coachTeamId)
      .eq('team_id', teamId)
      .single();

    if (!existingAssignment) {
      return NextResponse.json({ error: 'Coach assignment not found in this team' }, { status: 404 });
    }

    // Remove coach-team assignment
    const { error: deleteError } = await adminClient
      .from('coach_teams')
      .delete()
      .eq('id', coachTeamId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove coach from team' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing coach from team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}