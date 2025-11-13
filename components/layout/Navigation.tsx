'use client';

import { useAuth } from '@/lib/auth/hooks';
import { UserRole } from '@/types/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole>('learner');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch user role from database
      fetch('/api/users/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.role) {
            setUserRole(data.role);
          }
        })
        .catch(() => {
          // Default to learner if fetch fails
          setUserRole('learner');
        });
    }
  }, [user]);

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${
      isActive(path)
        ? 'border-blue-500 text-gray-900'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
    }`;

  const mobileLinkClass = (path: string) =>
    `block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors ${
      isActive(path)
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
    }`;

  const learnerLinks = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/reflections', label: '리플렉션' },
  ];

  const coachLinks = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/teams', label: '팀 관리' },
    { href: '/reflections', label: '리플렉션' },
    { href: '/coaching-logs', label: '코칭 로그' },
  ];

  const adminLinks = [
    { href: '/teams', label: '팀 관리' },
    { href: '/users', label: '사용자 관리' },
    { href: '/learners', label: '학습자 관리' },
    { href: '/coaches', label: '코치 관리' },
  ];

  const links =
    userRole === 'learner'
      ? learnerLinks
      : userRole === 'coach'
        ? coachLinks
        : adminLinks;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                LEINN LMS
              </Link>
            </div>
            {/* Desktop menu */}
            <div className="ml-6 hidden space-x-8 sm:flex">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {/* User info */}
            <div className="hidden sm:block">
              <span className="mr-4 text-sm text-gray-700">
                {user.email}
              </span>
            </div>
            {/* Sign out button */}
            <button
              onClick={signOut}
              className="hidden rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:block"
            >
              로그아웃
            </button>
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">메뉴 열기</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={mobileLinkClass(link.href)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            <div className="flex items-center px-4">
              <div className="text-sm font-medium text-gray-800">{user.email}</div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
