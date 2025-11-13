interface AIFeedbackPanelProps {
  aiSummary: string | null;
  aiRisks: string | null;
  aiActions: string | null;
}

export function AIFeedbackPanel({
  aiSummary,
  aiRisks,
  aiActions,
}: AIFeedbackPanelProps) {
  const hasAnyFeedback = aiSummary || aiRisks || aiActions;

  if (!hasAnyFeedback) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          🤖 AI 분석 결과
        </h2>
        <p className="text-center text-gray-500">
          AI 분석이 아직 완료되지 않았습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-purple-900">
          🤖 AI 분석 결과
        </h2>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
          코치 전용
        </span>
      </div>

      <p className="text-sm text-purple-700">
        이 정보는 코치만 볼 수 있으며, 학습자에게는 표시되지 않습니다.
        AI 분석을 참고하여 개인화된 피드백을 작성하세요.
      </p>

      {aiSummary && (
        <div className="rounded-md bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">📝 요약</h3>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {aiSummary}
          </p>
        </div>
      )}

      {aiRisks && (
        <div className="rounded-md bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-red-900">⚠️ 리스크</h3>
          <p className="whitespace-pre-wrap text-sm text-red-700">{aiRisks}</p>
        </div>
      )}

      {aiActions && (
        <div className="rounded-md bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-green-900">
            ✅ 제안 액션
          </h3>
          <p className="whitespace-pre-wrap text-sm text-green-700">
            {aiActions}
          </p>
        </div>
      )}
    </div>
  );
}
