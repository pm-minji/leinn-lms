import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/api/error-handler';
import { createCoachingLog, getCoachingLogs } from '@/lib/services/coaching-log-service';
import { coachingLogSchema } from '@/lib/validations/coaching-log';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = coachingLogSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const coachingLog = await createCoachingLog(user.id, validationResult.data);

    return NextResponse.json(coachingLog, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const sessionTypeParam = searchParams.get('session_type') || undefined;
    const statusParam = searchParams.get('status') || undefined;

    const filters = {
      session_type: sessionTypeParam && ['1:1', 'team', 'weekly'].includes(sessionTypeParam)
        ? sessionTypeParam as '1:1' | 'team' | 'weekly'
        : undefined,
      status: statusParam && ['open', 'done'].includes(statusParam)
        ? statusParam as 'open' | 'done'
        : undefined,
      team_id: searchParams.get('team_id') || undefined,
      learner_id: searchParams.get('learner_id') || undefined,
    };

    const coachingLogs = await getCoachingLogs(user.id, filters);

    return NextResponse.json(coachingLogs);
  } catch (error) {
    return handleApiError(error);
  }
}
