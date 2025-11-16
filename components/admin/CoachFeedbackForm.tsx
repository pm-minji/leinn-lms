'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotionStyleEditor } from '@/components/ui/NotionStyleEditor';

interface CoachFeedbackFormProps {
  reflectionId: string;
  existingFeedback?: string | null;
  learnerName: string;
  aiSummary?: string | null;
  aiRisks?: string | null;
  aiActions?: string | null;
}

export function CoachFeedbackForm({ 
  reflectionId, 
  existingFeedback, 
  learnerName,
  aiSummary,
  aiRisks,
  aiActions
}: CoachFeedbackFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(existingFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError('피드백 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/reflections/${reflectionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '피드백 저장에 실패했습니다');
      }

      router.push(`/admin/reflections/${reflectionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTemplate = () => {
    const template = `# ${learnerName}님 주간 피드백

## 🎯 이번 주 하이라이트

${learnerName}님의 리플렉션에서 특히 인상 깊었던 부분이나 성장이 돋보인 지점을 구체적으로 언급해주세요.

${aiSummary ? `\n**AI 분석 참고사항:**\n> ${aiSummary}\n` : ''}

## 💪 확인된 강점

이번 주 리플렉션을 통해 발견한 ${learnerName}님의 강점들:

- **[구체적 강점 1]:** 어떤 부분에서 이 강점이 드러났는지 설명
- **[구체적 강점 2]:** 실제 사례나 행동을 바탕으로 언급
- **[구체적 강점 3]:** 이전 대비 성장한 부분이 있다면 포함

## 🚀 성장 기회

더 발전시킬 수 있는 영역을 **기회**의 관점에서 제시:

**[영역 1: 예시 - 시간 관리]**
- 현재 상황: 
- 개선 방향: 
- 기대 효과: 

**[영역 2: 예시 - 팀 협업]**
- 현재 상황: 
- 개선 방향: 
- 기대 효과: 

${aiRisks ? `\n**주의 깊게 살펴볼 점:**\n> ${aiRisks}\n` : ''}

## 📋 다음 주 실행 계획

구체적이고 실현 가능한 액션 아이템:

### 🎯 핵심 우선순위
**목표:** [구체적인 목표]
**실행 방법:** [단계별 방법]
**성공 지표:** [어떻게 확인할 것인가]
**예상 소요 시간:** [현실적인 시간 배분]

### 🔄 지속적 개선
**목표:** [습관화할 내용]
**실행 방법:** [일상에 통합하는 방법]
**체크 포인트:** [언제, 어떻게 점검할 것인가]

### 🧪 새로운 시도
**실험할 것:** [새롭게 도전해볼 내용]
**기간:** [실험 기간]
**학습 목표:** [이 실험을 통해 얻고자 하는 것]

${aiActions ? `\n**AI 제안사항 참고:**\n> ${aiActions}\n` : ''}

## 💬 코치 메시지

${learnerName}님께,

[개인적이고 격려적인 메시지를 작성해주세요. 학습자의 노력을 인정하고, 앞으로의 성장에 대한 기대와 지지를 표현해주세요.]

다음 1:1 세션에서는 [구체적으로 논의하고 싶은 주제]에 대해 더 깊이 이야기해보면 좋겠습니다.

언제든 궁금한 점이나 도움이 필요한 부분이 있으면 연락주세요! 🌟

---
**코치:** [코치명]  
**피드백 작성일:** ${new Date().toLocaleDateString('ko-KR')}`;
    
    setFeedback(template);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">코치 피드백 작성</h2>
        <button
          type="button"
          onClick={generateTemplate}
          className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200"
        >
          📝 템플릿 사용
        </button>
      </div>

      <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
        💡 <strong>템플릿 사용 팁:</strong> "템플릿 사용" 버튼을 클릭하면 구조화된 피드백 양식이 생성됩니다.
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            피드백 내용 (실시간 마크다운)
          </label>
          <NotionStyleEditor
            value={feedback}
            onChange={setFeedback}
            placeholder="학습자에게 전달할 피드백을 작성해주세요..."
            height={500}
            showTemplate={false}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          취소
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !feedback.trim()}
          className={`px-6 py-2 text-sm font-medium text-white rounded-md ${
            isSubmitting || !feedback.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? '저장 중...' : existingFeedback ? '피드백 수정' : '피드백 제출'}
        </button>
      </div>
    </div>
  );
}