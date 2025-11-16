import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: error || '인증되지 않은 사용자',
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      permissions: {
        hasAdminRole: hasRole(user, 'admin'),
        hasCoachRole: hasRole(user, 'coach'),
        hasLearnerRole: hasRole(user, 'learner'),
      },
      explanation: {
        admin_should_have_all: 'Admin should have admin, coach, and learner permissions',
        coach_should_have_coach_learner: 'Coach should have coach and learner permissions',
        learner_should_have_learner_only: 'Learner should have learner permission only',
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '시스템 오류가 발생했습니다',
      details: (error as Error).message,
    }, { status: 500 });
  }
}