import { createClient } from '@/lib/supabase/server';
import { PromptService } from '@/lib/services/prompt-service';
import { analyzeReflection } from '@/lib/ai/analyzer';
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

    const body = await request.json();
    const { testContent, learnerName, teamName } = body;

    if (!testContent) {
      return NextResponse.json(
        { error: 'Test content is required' },
        { status: 400 }
      );
    }

    // Get the prompt
    const prompt = await PromptService.getPromptById(id);

    // Replace variables in prompt
    let promptContent = prompt.prompt_text;
    promptContent = promptContent.replace(/{reflection_content}/g, testContent);
    promptContent = promptContent.replace(
      /{learner_name}/g,
      learnerName || '테스트 학습자'
    );
    promptContent = promptContent.replace(
      /{team_name}/g,
      teamName || '테스트 팀'
    );

    // Call AI with the test prompt
    const result = await analyzeReflection(testContent, promptContent);

    return NextResponse.json({
      prompt: promptContent,
      result,
    });
  } catch (error) {
    console.error('Error testing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to test prompt' },
      { status: 500 }
    );
  }
}
