import { getAuthenticatedUser } from '@/lib/auth/user-utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return NextResponse.json({
        status: 'error',
        message: error || '인증되지 않은 사용자',
        authenticated: false,
      });
    }

    return NextResponse.json({
      status: 'ok',
      message: '시스템이 정상적으로 작동 중입니다',
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: '시스템 오류가 발생했습니다',
      authenticated: false,
    }, { status: 500 });
  }
}