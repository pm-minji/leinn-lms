'use client';

import { useAuth } from './auth-provider';

export { useAuth };

export function useUser() {
  const { user } = useAuth();
  return user;
}
