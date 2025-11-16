import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'learner';
}

/**
 * Get authenticated user with role information
 * Uses admin client to bypass RLS for user role lookup
 */
export async function getAuthenticatedUser(): Promise<{
  user: AuthenticatedUser | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        user: null,
        error: '인증이 필요합니다',
      };
    }

    // Use admin client to get user role (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (userError || !userData) {
      return {
        user: null,
        error: '사용자 정보를 찾을 수 없습니다',
      };
    }

    return {
      user: {
        id: authUser.id,
        email: authUser.email!,
        role: userData.role as 'admin' | 'coach' | 'learner',
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return {
      user: null,
      error: '사용자 인증 중 오류가 발생했습니다',
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser, requiredRole: 'admin' | 'coach' | 'learner'): boolean {
  if (requiredRole === 'admin') {
    return user.role === 'admin';
  }
  if (requiredRole === 'coach') {
    return user.role === 'admin' || user.role === 'coach';
  }
  if (requiredRole === 'learner') {
    return user.role === 'admin' || user.role === 'coach' || user.role === 'learner';
  }
  return false;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: AuthenticatedUser, roles: ('admin' | 'coach' | 'learner')[]): boolean {
  return roles.some(role => hasRole(user, role));
}