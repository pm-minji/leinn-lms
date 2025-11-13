import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/api/error-handler';
import {
  createReflection,
  getReflections,
} from '@/lib/services/reflection-service';
import { reflectionSchema } from '@/lib/validations/reflection';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
    const validatedData = reflectionSchema.parse(body);

    const reflection = await createReflection(user.id, validatedData);

    return NextResponse.json(reflection, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
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

    const reflections = await getReflections(user.id);

    return NextResponse.json(reflections);
  } catch (error) {
    return handleApiError(error);
  }
}
