import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/api/error-handler';
import { getUpcomingFollowUps } from '@/lib/services/coaching-log-service';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get days_ahead parameter (default: 7 days)
    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get('days_ahead') || '7', 10);

    const upcomingLogs = await getUpcomingFollowUps(user.id, daysAhead);

    return NextResponse.json(upcomingLogs);
  } catch (error) {
    return handleApiError(error);
  }
}
