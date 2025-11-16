'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useState } from 'react';

interface PromptTesterProps {
  promptId: string;
}

interface TestResult {
  prompt: string;
  result: {
    summary: string;
    risks: string[];
    actions: string[];
  };
}

export function PromptTester({ promptId }: PromptTesterProps) {
  const [testContent, setTestContent] = useState('');
  const [learnerName, setLearnerName] = useState('홍길동');
  const [teamName, setTeamName] = useState('Team Alpha');
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!testContent.trim()) {
      alert('테스트할 리플렉션 내용을 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch(`/api/ai-prompts/${promptId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testContent,
          learnerName,
          teamName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to test prompt');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>테스트 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="learnerName"
              className="block text-sm font-medium text-gray-700"
            >
              학습자 이름
            </label>
            <input
              type="text"
              id="learnerName"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="teamName"
              className="block text-sm font-medium text-gray-700"
            >
              팀 이름
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="testContent"
              className="block text-sm font-medium text-gray-700"
            >
              테스트 리플렉션 내용
            </label>
            <textarea
              id="testContent"
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              rows={8}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="테스트할 리플렉션 내용을 입력하세요..."
            />
          </div>

          <Button
            onClick={handleTest}
            variant="primary"
            isLoading={loading}
            fullWidth
          >
            프롬프트 테스트
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-center text-sm text-gray-600">
              AI 분석 중...
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <ErrorMessage message={error} onRetry={handleTest} />
      )}

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용된 프롬프트</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md bg-gray-50 p-4 font-mono text-sm text-gray-800">
                {result.prompt}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI 분석 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">요약</h4>
                <p className="mt-2 text-sm text-gray-700">{result.result.summary}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900">리스크</h4>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
                  {result.result.risks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  제안 액션
                </h4>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
                  {result.result.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
