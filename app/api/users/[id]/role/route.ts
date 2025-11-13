import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/api/error-handler';
import { NextResponse } from 'next/server';
import { updateUserRole } from '@/lib/services/user-service';
import { z } from 'zod';

const roleUpdateSchema = z.object({
  role: z.enum(['learner', 'coach', 'admin'], {
    errorMap: () => ({ message: '유효한 역할을 선택해주세요' }),
  }),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Only admins can change user roles
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    // Prevent admin from changing their own role
    if (user.id === id) {
      return NextResponse.json(
        { error: '자신의 역할은 변경할 수 없습니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = roleUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { role } = validationResult.data;

    await updateUserRole(id, role);

    // Get updated user data
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}
