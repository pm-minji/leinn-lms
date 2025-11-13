import { UserRole } from '@/types/auth';

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

export function isCoach(userRole: UserRole): boolean {
  return userRole === 'coach' || userRole === 'admin';
}

export function isLearner(userRole: UserRole): boolean {
  return userRole === 'learner';
}

export function canAccessRoute(
  userRole: UserRole,
  route: string
): boolean {
  // Admin can access everything
  if (isAdmin(userRole)) return true;

  // Coach routes
  if (route.startsWith('/coach')) {
    return isCoach(userRole);
  }

  // Admin routes
  if (route.startsWith('/admin')) {
    return isAdmin(userRole);
  }

  // Learner routes (default)
  if (route.startsWith('/learner') || route.startsWith('/reflections')) {
    return true;
  }

  return true;
}
