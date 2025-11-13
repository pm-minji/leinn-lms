import { StatusBadge } from '@/components/ui/StatusBadge';
import { Database } from '@/types/supabase';
import { AIFeedbackPanel } from './AIFeedbackPanel';

type Reflection = Database['public']['Tables']['reflections']['Row'];

interface ReflectionReviewProps {
  reflection: Reflection & {
    learners?: {
      users: {
        name: string;
        email: string;
      };
    };
  };
  learnerName?: string;
}

export function ReflectionReview({
  reflection,
  learnerName,
}: ReflectionReviewProps) {
  const createdDate = new Date(reflection.created_at).toLocaleDateString(
    'ko-KR',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const weekStart = new Date(reflection.week_start).toLocaleDateString(
    'ko-KR',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  const displayName =
    learnerName ||
    (reflection.learners?.users?.name ?? '알 수 없는 학습자');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 text-sm text-gray-500">
            학습자: {displayName}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {reflection.title}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>주차: {weekStart}</span>
            <span>작성일: {createdDate}</span>
          </div>
        </div>
        <StatusBadge status={reflection.status} />
      </div>

      {/* AI Feedback Panel - Only visible to coaches */}
      <AIFeedbackPanel
        aiSummary={reflection.ai_summary}
        aiRisks={reflection.ai_risks}
        aiActions={reflection.ai_actions}
      />

      {/* Reflection Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          리플렉션 내용
        </h2>
        <div className="whitespace-pre-wrap text-gray-700">
          {reflection.content}
        </div>
      </div>

      {/* Coach Feedback Section */}
      {reflection.coach_feedback ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-blue-900">
            코치 피드백
          </h2>
          <div className="whitespace-pre-wrap text-blue-800">
            {reflection.coach_feedback}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-orange-900">
            코치 피드백
          </h2>
          <p className="text-center text-orange-700">
            아직 피드백이 작성되지 않았습니다
          </p>
          <p className="mt-2 text-center text-sm text-orange-600">
            AI 분석 결과를 참고하여 피드백을 작성하세요
          </p>
        </div>
      )}
    </div>
  );
}
