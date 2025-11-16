import { createClient } from '@/lib/supabase/server';
import { PromptService } from '@/lib/services/prompt-service';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const prompt = await PromptService.activatePrompt(id);

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error activating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to activate prompt' },
      { status: 500 }
    );
  }
}
