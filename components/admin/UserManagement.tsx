'use client';

import { useState } from 'react';
import { Database } from '@/types/supabase';
import { UserInlineEditor } from './UserInlineEditor';

type User = Database['public']['Tables']['users']['Row'];

interface UserManagementProps {
  users: Array<User & {
    learners?: Array<{ id: string; team_id: string | null; active: boolean; teams: { id: string; name: string } | null }>;
    coaches?: Array<{ id: string; active: boolean }>;
  }>;
}

export function UserManagement({ users }: UserManagementProps) {
  const [filter, setFilter] = useState<'all' | 'admin' | 'coach' | 'learner'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    if (filter === 'admin') return user.role === 'admin';
    if (filter === 'coach') return user.role === 'coach' || (user.coaches?.length ?? 0) > 0;
    if (filter === 'learner') return user.role === 'learner' || (user.learners?.length ?? 0) > 0;

    return true;
  });

  const getRoleBadge = (user: User & { learners?: any[]; coaches?: any[] }) => {
    const roles = [];

    if (user.role === 'admin') roles.push('관리자');
    if (user.role === 'coach' || (user.coaches?.length ?? 0) > 0) roles.push('코치');
    if (user.role === 'learner' || (user.learners?.length ?? 0) > 0) roles.push('학습자');

    return roles.join(', ') || '역할 없음';
  };

  const getStatusInfo = (user: User & { learners?: any[]; coaches?: any[] }) => {
    const info = [];

    if (user.learners && user.learners.length > 0) {
      const learner = user.learners[0];
      if (learner.teams) {
        info.push(`팀: ${learner.teams.name}`);
      }
    }

    if (user.coaches && user.coaches.length > 0) {
      const coach = user.coaches[0];
      info.push(`코치 상태: ${coach.active ? '활성' : '비활성'}`);
    }

    return info.join(' • ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          모든 사용자를 통합 관리하고 역할을 설정하세요
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {[
            { key: 'all', label: '전체' },
            { key: 'admin', label: '관리자' },
            { key: 'coach', label: '코치' },
            { key: 'learner', label: '학습자' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filter === key
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        
        <div className="flex-1">
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">전체 사용자</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {users.length}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">관리자</div>
          <div className="mt-2 text-3xl font-semibold text-red-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">코치</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {users.filter(u => u.role === 'coach' || (u.coaches?.length ?? 0) > 0).length}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">학습자</div>
          <div className="mt-2 text-3xl font-semibold text-blue-600">
            {users.filter(u => u.role === 'learner' || (u.learners?.length ?? 0) > 0).length}
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            사용자 목록 ({filteredUsers.length}명)
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar_url}
                        alt={user.name || ''}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name || '이름 없음'}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getRoleBadge(user)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    {getStatusInfo(user) && (
                      <p className="text-xs text-gray-400 mt-1">{getStatusInfo(user)}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <UserInlineEditor user={user} />
                </div>
              </div>
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">조건에 맞는 사용자가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}