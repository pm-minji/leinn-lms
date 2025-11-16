import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

interface RecentReflectionsProps {
  teamId: string;
}

export async function RecentReflections({ teamId }: RecentReflectionsProps) {
  const adminClient = createAdminClient();

  const { data: reflections } = await adminClient
    .from('reflections')
    .select(`
      id,
      title,
      status,
      created_at,
      week_start,
      learner_id,
      learners (
        users (
          name,
          avatar_url
        )
      )
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'ai_feedback_pending':
        return 'bg-blue-100 text-blue-800';
      case 'ai_feedback_done':
        return 'bg-orange-100 text-orange-800';
      case 'coach_feedback_done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return '제출됨';
      case 'ai_feedback_pending':
        return 'AI 분석 중';
      case 'ai_feedback_done':
        return '피드백 대기';
      case 'coach_feedback_done':
        return '완료';
      default:
        return status;
    }
  };

  if (!reflections || reflections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">아직 제출된 리플렉션이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reflections.map((reflection: any) => (
        <div key={reflection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {reflection.learners?.users?.avatar_url ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={reflection.learners.users.avatar_url}
                  alt={reflection.learners?.users?.name || ''}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    {reflection.learners?.users?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {reflection.title}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{reflection.learners?.users?.name}</span>
                <span>•</span>
                <span>{new Date(reflection.week_start).toLocaleDateString('ko-KR')}</span>
                <span>•</span>
                <span>{new Date(reflection.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(reflection.status)}`}>
              {getStatusLabel(reflection.status)}
            </span>
            <Link
              href={`/admin/reflections/${reflection.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              보기
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}