'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface PromptPreviewProps {
  content: string;
  variables?: {
    reflection_content?: string;
    learner_name?: string;
    team_name?: string;
  };
}

export function PromptPreview({ content, variables }: PromptPreviewProps) {
  const replaceVariables = (text: string) => {
    if (!variables) return text;

    let result = text;
    if (variables.reflection_content) {
      result = result.replace(/{reflection_content}/g, variables.reflection_content);
    }
    if (variables.learner_name) {
      result = result.replace(/{learner_name}/g, variables.learner_name);
    }
    if (variables.team_name) {
      result = result.replace(/{team_name}/g, variables.team_name);
    }
    return result;
  };

  const previewContent = replaceVariables(content);

  return (
    <Card>
      <CardHeader>
        <CardTitle>프롬프트 미리보기</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-gray-50 p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
            {previewContent || '프롬프트 내용을 입력하면 여기에 미리보기가 표시됩니다.'}
          </pre>
        </div>
        {variables && (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-medium text-blue-900">사용된 변수:</p>
            <ul className="mt-2 space-y-1 text-xs text-blue-800">
              {variables.reflection_content && (
                <li>• reflection_content: {variables.reflection_content}</li>
              )}
              {variables.learner_name && (
                <li>• learner_name: {variables.learner_name}</li>
              )}
              {variables.team_name && <li>• team_name: {variables.team_name}</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
