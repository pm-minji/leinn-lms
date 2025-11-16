import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'admin') && !hasRole(user, 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();

    const { data: teams, error } = await adminClient
      .from('teams')
      .select('id, name, description, active, created_at')
      .order('name');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    return NextResponse.json({ teams });

  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    console.log('Team creation auth check:', { user, authError });

    if (authError || !user) {
      console.log('Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, active = true } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { data: team, error } = await adminClient
      .from('teams')
      .insert({
        name: name.trim(),
        active
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating team:', error);
      return NextResponse.json({ 
        error: 'Failed to create team', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ team });

  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}