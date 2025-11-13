export type UserRole = 'learner' | 'coach' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
}
