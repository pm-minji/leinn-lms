'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface NotionStyleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
  showTemplate?: boolean;
}

export function NotionStyleEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = 400,
  className = '',
  showTemplate = true,
}: NotionStyleEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



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

  if (!mounted) {
    return (
      <div className={`border border-gray-300 rounded-md p-4 ${className}`} style={{ height }}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {value.length}자 • {value.split('\n').length}줄
        </div>
        
        {!value.trim() && showTemplate && (
          <button
            type="button"
            onClick={() => onChange(reflectionTemplate)}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 border border-green-300 rounded-md hover:bg-green-200"
          >
            📝 템플릿 사용
          </button>
        )}
      </div>

      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          height={height}
          preview="live"
          hideToolbar={false}
          textareaProps={{
            placeholder,
            style: {
              fontSize: 16,
              lineHeight: 1.7,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              padding: '24px',
            },
          }}
          data-color-mode="light"
          style={{
            backgroundColor: 'white',
          }}
        />
      </div>

      <div className="text-xs text-gray-500 mt-3">
        <div className="grid grid-cols-3 gap-x-4 gap-y-1">
          <p><code>**굵게**</code></p>
          <p><code>*기울임*</code></p>
          <p><code>`코드`</code></p>
          <p><code>## 제목</code></p>
          <p><code>- 목록</code></p>
          <p><code>&gt; 인용구</code></p>
        </div>
      </div>
    </div>
  );
}