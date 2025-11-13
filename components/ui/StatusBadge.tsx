type ReflectionStatus =
  | 'submitted'
  | 'ai_feedback_done'
  | 'ai_feedback_pending'
  | 'coach_feedback_done';

type GeneralStatus = 'active' | 'inactive' | 'open' | 'done';

interface StatusBadgeProps {
  status: ReflectionStatus | GeneralStatus;
  label?: string;
}

const statusConfig: Record<ReflectionStatus | GeneralStatus, { label: string; className: string }> = {
  submitted: {
    label: '제출됨',
    className: 'bg-blue-100 text-blue-800',
  },
  ai_feedback_done: {
    label: 'AI 분석 완료',
    className: 'bg-purple-100 text-purple-800',
  },
  ai_feedback_pending: {
    label: 'AI 분석 대기',
    className: 'bg-yellow-100 text-yellow-800',
  },
  coach_feedback_done: {
    label: '코치 피드백 완료',
    className: 'bg-green-100 text-green-800',
  },
  active: {
    label: '활성',
    className: 'bg-green-100 text-green-800',
  },
  inactive: {
    label: '비활성',
    className: 'bg-gray-100 text-gray-800',
  },
  open: {
    label: '진행중',
    className: 'bg-blue-100 text-blue-800',
  },
  done: {
    label: '완료',
    className: 'bg-green-100 text-green-800',
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.className}`}
    >
      {label || config.label}
    </span>
  );
}
