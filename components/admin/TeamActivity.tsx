import { createAdminClient } from '@/lib/supabase/admin';

interface TeamActivityProps {
  teamId: string;
}

export async function TeamActivity({ teamId }: TeamActivityProps) {
  const adminClient = createAdminClient();

  // Get activity statistics
  const [
    { count: totalReflections },
    { count: thisWeekReflections },
    { count: pendingFeedback },
    { data: recentActivity }
  ] = await Promise.all([
    adminClient
      .from('reflections')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId),
    
    adminClient
      .from('reflections')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    
    adminClient
      .from('reflections')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('status', 'ai_feedback_done'),
    
    adminClient
      .from('reflections')
      .select(`
        id,
        title,
        status,
        created_at,
        learners (
          users (
            name
          )
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  const activityStats = [
    {
      label: '전체 리플렉션',
      value: totalReflections || 0,
      color: 'text-blue-600'
    },
    {
      label: '이번 주 제출',
      value: thisWeekReflections || 0,
      color: 'text-green-600'
    },
    {
      label: '피드백 대기',
      value: pendingFeedback || 0,
      color: 'text-orange-600'
    }
  ];

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return '📝';
      case 'ai_feedback_pending':
        return '🤖';
      case 'ai_feedback_done':
        return '⏳';
      case 'coach_feedback_done':
        return '✅';
      default:
        return '📄';
    }
  };

  const getActivityMessage = (reflection: any) => {
    const userName = reflection.learners?.users?.name || '알 수 없는 사용자';
    switch (reflection.status) {
      case 'submitted':
        return `${userName}님이 리플렉션을 제출했습니다`;
      case 'ai_feedback_pending':
        return `${userName}님의 리플렉션을 AI가 분석 중입니다`;
      case 'ai_feedback_done':
        return `${userName}님의 리플렉션에 AI 분석이 완료되었습니다`;
      case 'coach_feedback_done':
        return `${userName}님의 리플렉션에 코치 피드백이 완료되었습니다`;
      default:
        return `${userName}님의 리플렉션 활동`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Stats */}
      <div className="grid grid-cols-3 gap-4">
        {activityStats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-500">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Timeline */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">최근 활동</h3>
        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-lg">
                  {getActivityIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {getActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">최근 활동이 없습니다.</p>
        )}
      </div>
    </div>
  );
}