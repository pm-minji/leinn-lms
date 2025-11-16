'use client';

import { useState, useRef, useEffect } from 'react';
import { ProfileEditor } from '@/components/ui/ProfileEditor';

interface UserProfileMenuProps {
  user: {
    id: string;
    email?: string;
  };
}

export function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user name
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setUserName(data.name);
        }
      })
      .catch(() => {
        setUserName(user.email?.split('@')[0] || '사용자');
      });
  }, [user.email]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-blue-600">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden md:block">{userName}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            {isEditing ? (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">프로필 편집</h3>
                <ProfileEditor
                  currentName={userName}
                  currentEmail={user.email || ''}
                  userId={user.id}
                  onCancel={() => {
                    setIsEditing(false);
                    setIsOpen(false);
                  }}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  ✏️ 프로필 편집
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}