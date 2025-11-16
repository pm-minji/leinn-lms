import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser } from '@/lib/auth/user-utils';

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { learner_id, team_id } = await request.json();

    if (!learner_id || !team_id) {
      return NextResponse.json({ error: 'Learner ID and Team ID are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Verify that the learner belongs to the authenticated user
    const { data: learner } = await adminClient
      .from('learners')
      .select('id, user_id, team_id')
      .eq('id', learner_id)
      .eq('user_id', user.id)
      .single();

    if (!learner) {
      return NextResponse.json({ error: 'Learner not found or access denied' }, { status: 404 });
    }

    // Allow team changes - remove the restriction for already assigned learners

    // Verify that the team exists and is active
    const { data: team } = await adminClient
      .from('teams')
      .select('id, active')
      .eq('id', team_id)
      .eq('active', true)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found or inactive' }, { status: 404 });
    }

    // Update learner with team assignment
    const { error: updateError } = await adminClient
      .from('learners')
      .update({
        team_id: team_id
      })
      .eq('id', learner_id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Successfully joined team' });

  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}