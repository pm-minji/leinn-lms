import { getAuthenticatedUser } from '@/lib/auth/user-utils';
import { updateUserRole } from '@/lib/services/user-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: error || '인증되지 않은 사용자',
        step: 'authentication'
      });
    }

    return NextResponse.json({
      success: true,
      message: '사용자 인증 성공',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      step: 'authentication'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '시스템 오류가 발생했습니다',
      details: (error as Error).message,
      step: 'authentication'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: error || '인증되지 않은 사용자',
        step: 'authentication'
      });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: '관리자만 역할을 변경할 수 있습니다',
        step: 'authorization'
      }, { status: 403 });
    }

    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json({
        success: false,
        error: 'userId와 newRole이 필요합니다',
        step: 'validation'
      }, { status: 400 });
    }

    await updateUserRole(userId, newRole);

    return NextResponse.json({
      success: true,
      message: '사용자 역할 변경 성공',
      userId,
      newRole,
      step: 'role_update'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '역할 변경 중 오류가 발생했습니다',
      details: (error as Error).message,
      step: 'role_update'
    }, { status: 500 });
  }
}