import Link from 'next/link';
import { Database } from '@/types/supabase';
import { StatusBadge } from '@/components/ui/StatusBadge';

type CoachingLog = Database['public']['Tables']['coaching_logs']['Row'] & {
  learners?: {
    id: string;
    users: {
      name: string;
      email: string;
    };
  } | null;
  teams?: {
    id: string;
    name: string;
  } | null;
};

interface CoachingLogCardProps {
  log: CoachingLog;
}

export function CoachingLogCard({ log }: CoachingLogCardProps) {
  const sessionDate = new Date(log.session_date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const followUpDate = log.follow_up_date
    ? new Date(log.follow_up_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const isUpcoming = log.follow_up_date && log.status === 'open'
    ? new Date(log.follow_up_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : false;

  const sessionTypeLabels: Record<string, string> = {
    '1:1': '1:1 코칭',
    'team': '팀 코칭',
    'weekly': '주간 코칭',
  };

  return (
    <Link
      href={`/coaching-logs/${log.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{log.title}</h3>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {sessionTypeLabels[log.session_type] || log.session_type}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">세션 날짜: {sessionDate}</p>
        </div>
        <StatusBadge status={log.status === 'open' ? 'submitted' : 'coach_feedback_done'} />
      </div>

      <div className="mt-4">
        {log.learners && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">학습자:</span> {log.learners.users.name}
          </p>
        )}
        {log.teams && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">팀:</span> {log.teams.name}
          </p>
        )}
      </div>

      {log.notes && (
        <div className="mt-3">
          <p className="line-clamp-2 text-sm text-gray-600">{log.notes}</p>
        </div>
      )}

      {log.next_actions && (
        <div className="mt-3 rounded-md bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-900">다음 액션</p>
          <p className="mt-1 line-clamp-2 text-sm text-blue-800">
            {log.next_actions}
          </p>
        </div>
      )}

      {followUpDate && (
        <div className={`mt-3 rounded-md p-3 ${isUpcoming ? 'bg-orange-50' : 'bg-gray-50'}`}>
          <p className={`text-xs font-medium ${isUpcoming ? 'text-orange-900' : 'text-gray-900'}`}>
            후속 일정
          </p>
          <p className={`mt-1 text-sm ${isUpcoming ? 'text-orange-800' : 'text-gray-700'}`}>
            {followUpDate}
            {isUpcoming && ' (다가오는 일정)'}
          </p>
        </div>
      )}
    </Link>
  );
}
