'use client';

import { StatusBadge } from '@/components/ui/StatusBadge';

interface CoachFeedbackSectionProps {
  coachFeedback: string | null;
  status: 'submitted' | 'ai_feedback_done' | 'ai_feedback_pending' | 'coach_feedback_done';
}

export function CoachFeedbackSection({
  coachFeedback,
  status,
}: CoachFeedbackSectionProps) {
  if (coachFeedback) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-blue-900">코치 피드백</h2>
          <StatusBadge status={status} />
        </div>
        <div className="whitespace-pre-wrap text-blue-800">
          {coachFeedback}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">코치 피드백</h2>
        <StatusBadge status={status} />
      </div>
      <div className="text-center">
        <p className="text-gray-500">코치 피드백을 기다리고 있습니다</p>
        <p className="mt-2 text-sm text-gray-400">
          코치가 리플렉션을 검토한 후 피드백을 작성할 예정입니다
        </p>
      </div>
    </div>
  );
}
