import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id, team_id } = await request.json();

    if (!user_id || !team_id) {
      return NextResponse.json({ error: 'User ID and Team ID are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Check if learner exists
    const { data: learner } = await adminClient
      .from('learners')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (!learner) {
      // Create learner if doesn't exist
      const { data: newLearner, error: createError } = await adminClient
        .from('learners')
        .insert({
          user_id,
          team_id,
          active: true,
          joined_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError) {
        return NextResponse.json({ error: 'Failed to create learner' }, { status: 500 });
      }

      return NextResponse.json({ success: true, learner: newLearner });
    } else {
      // Update existing learner
      const { error: updateError } = await adminClient
        .from('learners')
        .update({
          team_id,
          active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', learner.id);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to assign team' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

  } catch (error) {
    console.error('Error assigning learner to team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}