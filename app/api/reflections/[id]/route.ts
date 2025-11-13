import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/api/error-handler';
import {
  getReflectionById,
  getReflectionByIdForCoach,
} from '@/lib/services/reflection-service';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // If coach or admin, use coach access (includes AI feedback)
    if (userData?.role === 'coach' || userData?.role === 'admin') {
      const reflection = await getReflectionByIdForCoach(user.id, params.id);
      return NextResponse.json(reflection);
    }

    // Otherwise, use learner access (excludes AI feedback)
    const reflection = await getReflectionById(user.id, params.id);
    return NextResponse.json(reflection);
  } catch (error) {
    return handleApiError(error);
  }
}
