import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const adminClient = createAdminClient();

    // Get admin user
    const { data: adminUser } = await adminClient
      .from('users')
      .select('id, email, role')
      .eq('email', 'joon@pm-minji.com')
      .single();

    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin user not found'
      }, { status: 404 });
    }

    // Check if coach record already exists
    const { data: existingCoach } = await adminClient
      .from('coaches')
      .select('id')
      .eq('user_id', adminUser.id)
      .single();

    if (existingCoach) {
      return NextResponse.json({
        message: 'Coach record already exists',
        coach_id: existingCoach.id
      });
    }

    // Create coach record
    const { data: newCoach, error: coachError } = await adminClient
      .from('coaches')
      .insert({
        user_id: adminUser.id,
        active: true,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (coachError) {
      return NextResponse.json({
        error: 'Failed to create coach record',
        details: coachError.message
      }, { status: 500 });
    }

    // Also create learner record if not exists
    const { data: existingLearner } = await adminClient
      .from('learners')
      .select('id')
      .eq('user_id', adminUser.id)
      .single();

    if (!existingLearner) {
      await adminClient
        .from('learners')
        .insert({
          user_id: adminUser.id,
          team_id: null,
          active: true,
          joined_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      message: 'Admin coach setup completed successfully',
      admin_user: adminUser,
      coach_id: newCoach.id
    });

  } catch (error) {
    console.error('Error setting up admin coach:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 });
  }
}