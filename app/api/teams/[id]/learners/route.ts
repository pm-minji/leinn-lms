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

    // Check if learner already exists for this user
    const { data: existingLearner } = await adminClient
      .from('learners')
      .select('id, team_id')
      .eq('user_id', user_id)
      .single();

    if (existingLearner) {
      // Update existing learner's team
      const { error: updateError } = await adminClient
        .from('learners')
        .update({
          team_id: teamId,
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLearner.id);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update learner' }, { status: 500 });
      }
    } else {
      // Create new learner
      const { error: insertError } = await adminClient
        .from('learners')
        .insert({
          user_id,
          team_id: teamId,
          active: true,
          joined_at: new Date().toISOString(),
        });

      if (insertError) {
        return NextResponse.json({ error: 'Failed to add learner' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding learner to team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}