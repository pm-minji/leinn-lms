import { createClient } from '@/lib/supabase/server';
import { UserRoleForm } from '@/components/admin/UserRoleForm';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function UsersPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Get all users
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  const getRoleBadgeStatus = (role: string) => {
    switch (role) {
      case 'admin':
        return 'done';
      case 'coach':
        return 'active';
      case 'learner':
        return 'open';
      default:
        return 'inactive';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'learner':
        return '학습자';
      case 'coach':
        return '코치';
      case 'admin':
        return '관리자';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          사용자의 역할을 관리합니다
        </p>
      </div>

      {!users || users.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">등록된 사용자가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const isCurrentUser = currentUser?.id === user.id;

            return (
              <div
                key={user.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.name}
                      </h3>
                      {isCurrentUser && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          본인
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          현재 역할:
                        </span>
                        <StatusBadge
                          status={getRoleBadgeStatus(user.role)}
                          label={getRoleLabel(user.role)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          가입일:
                        </span>
                        <span className="text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      {user.updated_at !== user.created_at && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            최종 수정:
                          </span>
                          <span className="text-sm text-gray-900">
                            {new Date(user.updated_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-900">
                      역할 변경
                    </h4>
                    <UserRoleForm
                      userId={user.id}
                      currentRole={user.role}
                      userName={user.name}
                      isCurrentUser={isCurrentUser}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
