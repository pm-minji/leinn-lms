import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Update user
    const { data: updatedUser, error: updateError } = await adminClient
      .from('users')
      .update({
        name,
        email,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    // Handle role-specific data
    if (role === 'coach') {
      // Ensure coach record exists
      const { data: existingCoach } = await adminClient
        .from('coaches')
        .select('id')
        .eq('user_id', id)
        .single();

      if (!existingCoach) {
        await adminClient
          .from('coaches')
          .insert({
            user_id: id,
            active: true,
            created_at: new Date().toISOString(),
          });
      }
    }

    if (role === 'learner') {
      // Ensure learner record exists
      const { data: existingLearner } = await adminClient
        .from('learners')
        .select('id')
        .eq('user_id', id)
        .single();

      if (!existingLearner) {
        await adminClient
          .from('learners')
          .insert({
            user_id: id,
            active: true,
            joined_at: new Date().toISOString(),
          });
      }
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}