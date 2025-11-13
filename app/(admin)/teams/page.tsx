import { createClient } from '@/lib/supabase/server';
import { TeamList } from '@/components/admin/TeamList';
import Link from 'next/link';

export default async function TeamsPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">팀 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            팀을 생성하고 관리합니다
          </p>
        </div>
        <Link
          href="/admin/teams/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          새 팀 생성
        </Link>
      </div>

      <TeamList teams={teams || []} />
    </div>
  );
}
