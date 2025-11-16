'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AIAnalysisButtonProps {
  reflectionId: string;
}

export function AIAnalysisButton({ reflectionId }: AIAnalysisButtonProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`/api/reflections/${reflectionId}/ai-analysis`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 분석에 실패했습니다');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-end space-y-2">
      <button
        onClick={handleAnalysis}
        disabled={isAnalyzing}
        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
          isAnalyzing
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isAnalyzing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            AI 분석 중...
          </>
        ) : (
          <>
            🤖 AI 분석 시작
          </>
        )}
      </button>
      {error && (
        <div className="text-sm text-red-600 max-w-xs text-right">
          {error}
        </div>
      )}
    </div>
  );
}