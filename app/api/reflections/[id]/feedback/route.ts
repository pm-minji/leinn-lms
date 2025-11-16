import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { feedback } = await request.json();

    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ error: 'Feedback content is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get reflection to verify it exists and is in correct status
    const { data: reflection, error: reflectionError } = await adminClient
      .from('reflections')
      .select('id, status')
      .eq('id', id)
      .single();

    if (reflectionError || !reflection) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    if (reflection.status !== 'ai_feedback_done' && reflection.status !== 'coach_feedback_done') {
      return NextResponse.json({ error: 'Reflection is not ready for coach feedback' }, { status: 400 });
    }

    // Update reflection with coach feedback
    const { error: updateError } = await adminClient
      .from('reflections')
      .update({
        coach_feedback: feedback,
        status: 'coach_feedback_done',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving coach feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}