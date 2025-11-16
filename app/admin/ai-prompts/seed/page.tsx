'use client';

import { useState } from 'react';

export default function SeedPromptsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/ai-prompts/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to seed prompts');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI 프롬프트 시드</h1>
        <p className="mt-2 text-sm text-gray-600">
          프로덕션 레벨의 AI 프롬프트를 데이터베이스에 업데이트합니다.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">업데이트될 프롬프트</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li><strong>리플렉션 분석 프롬프트</strong>: 학습자의 리플렉션을 분석하여 요약, 리스크, 액션 아이템을 생성</li>
            <li><strong>코치 피드백 생성 프롬프트</strong>: AI 분석 결과를 바탕으로 개인화된 코치 피드백을 생성</li>
          </ul>
        </div>

        <button
          onClick={handleSeed}
          disabled={isLoading}
          className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? '업데이트 중...' : 'AI 프롬프트 업데이트'}
        </button>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              <strong>오류:</strong> {error}
            </div>
          </div>
        )}

        {results && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">
              <strong>성공!</strong> {results.message}
            </div>
            {results.results && (
              <div className="mt-2 space-y-1">
                {results.results.map((result: any, index: number) => (
                  <div key={index} className="text-xs text-green-600">
                    • {result.name}: {result.action} - {result.status}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">📝 프로덕션 레벨 프롬프트 특징</h3>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• <strong>LEINN 교육 철학 반영</strong>: 자기주도학습과 성장 마인드셋 중심</li>
          <li>• <strong>15가지 학습 지표 분석</strong>: 깊이, 구체성, 연결성, 성장 지향성 등</li>
          <li>• <strong>위험 신호 자동 감지</strong>: 학습 동기 저하, 인지적 과부하, 사회적 고립 등</li>
          <li>• <strong>개인화된 액션 아이템</strong>: 즉시 실행, 단기 목표, 중장기 비전, 지원 요청</li>
          <li>• <strong>따뜻하고 격려적인 톤</strong>: 판단적이지 않고 성장 가능성에 초점</li>
        </ul>
      </div>
    </div>
  );
}