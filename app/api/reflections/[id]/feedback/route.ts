import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/api/error-handler';
import { saveCoachFeedback } from '@/lib/services/coach-feedback-service';
import { coachFeedbackSchema } from '@/lib/validations/coach-feedback';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = coachFeedbackSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다', details: validationResult.error },
        { status: 400 }
      );
    }

    // Save coach feedback
    const reflection = await saveCoachFeedback(
      user.id,
      params.id,
      validationResult.data
    );

    return NextResponse.json(reflection, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
