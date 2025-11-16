'use client';

import { useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  showPreview?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  rows = 12,
  className = '',
  showPreview = true,
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const reflectionTemplate = `# 이번 주 리플렉션

## 📚 학습한 내용
이번 주에 학습한 주요 내용들을 정리해보세요.

- 
- 
- 

## 💡 주요 인사이트
학습 과정에서 얻은 깨달음이나 새로운 관점을 공유해보세요.

> 

## 🎯 목표 달성도
이번 주 설정했던 목표들을 얼마나 달성했는지 평가해보세요.

**달성한 목표:**
- 

**미달성 목표 및 이유:**
- 

## 🚧 어려웠던 점
학습 과정에서 직면한 어려움이나 도전들을 기록해보세요.

1. 
2. 
3. 

## 🔄 개선 방안
어려움을 해결하기 위한 구체적인 방안을 생각해보세요.

- 
- 
- 

## 📋 다음 주 계획
다음 주에 집중할 학습 내용이나 목표를 설정해보세요.

### 우선순위 1
- **목표:** 
- **방법:** 
- **기대효과:** 

### 우선순위 2
- **목표:** 
- **방법:** 
- **기대효과:** 

## 🤔 추가 생각
기타 공유하고 싶은 생각이나 질문이 있다면 자유롭게 작성해보세요.

`;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        {showPreview && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className={`px-3 py-1 text-sm rounded-md ${
                !isPreview
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              ✏️ 편집
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={`px-3 py-1 text-sm rounded-md ${
                isPreview
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              👁️ 미리보기
            </button>
          </div>
        )}
        
        {!value.trim() && (
          <button
            type="button"
            onClick={() => onChange(reflectionTemplate)}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 border border-green-300 rounded-md hover:bg-green-200"
          >
            📝 템플릿 사용
          </button>
        )}
      </div>

      {isPreview && showPreview ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[300px]">
          <div className="text-sm text-gray-600 mb-3 pb-2 border-b border-gray-300">
            📖 미리보기
          </div>
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-gray-500 italic">내용을 입력하면 미리보기가 표시됩니다.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y"
          />
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="space-y-1">
              <p><strong>마크다운 문법:</strong></p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <p>• **굵게** 또는 *기울임*</p>
                <p>• `코드` 또는 ```코드블록```</p>
                <p>• &gt; 인용구</p>
                <p>• - 목록 또는 1. 번호목록</p>
                <p>• ## 제목 (##, ###)</p>
                <p>• [링크](URL)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{value.length}자</p>
              <p>{value.split('\n').length}줄</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}