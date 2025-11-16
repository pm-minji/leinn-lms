import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; learnerId: string }> }
) {
  try {
    const { id: teamId, learnerId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Check if learner exists and belongs to the team
    const { data: existingLearner } = await adminClient
      .from('learners')
      .select('id, team_id')
      .eq('id', learnerId)
      .eq('team_id', teamId)
      .single();

    if (!existingLearner) {
      return NextResponse.json({ error: 'Learner not found in this team' }, { status: 404 });
    }

    // Remove learner from team (set team_id to null and deactivate)
    const { error: updateError } = await adminClient
      .from('learners')
      .update({
        team_id: null,
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', learnerId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to remove learner from team' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing learner from team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}