'use client';

import { PROMPT_CATEGORIES } from '@/lib/ai/prompt-templates';
import { useState } from 'react';

interface PromptTemplateSelectorProps {
  templates: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    variables: string[];
    template: string;
  }>;
  onSelect: (template: any) => void;
  onSkip: () => void;
}

export function PromptTemplateSelector({ templates, onSelect, onSkip }: PromptTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getCategoryInfo = (categoryId: string) => {
    return PROMPT_CATEGORIES.find(c => c.id === categoryId);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            selectedCategory === 'all'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          전체
        </button>
        {PROMPT_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Template List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">템플릿 선택</h2>
            <button
              onClick={onSkip}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              템플릿 없이 시작
            </button>
          </div>

          <div className="space-y-3">
            {filteredTemplates.map((template) => {
              const categoryInfo = getCategoryInfo(template.category);
              return (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    previewTemplate?.id === template.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setPreviewTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        {categoryInfo && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {categoryInfo.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      {template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable) => (
                            <span
                              key={variable}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-blue-100 text-blue-800"
                            >
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {previewTemplate && (
            <div className="pt-4 border-t">
              <button
                onClick={() => onSelect(previewTemplate)}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                이 템플릿으로 시작하기
              </button>
            </div>
          )}
        </div>

        {/* Template Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">템플릿 미리보기</h3>
            
            {previewTemplate ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{previewTemplate.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{previewTemplate.description}</p>
                  
                  {previewTemplate.variables.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">사용 변수:</p>
                      <div className="flex flex-wrap gap-1">
                        {previewTemplate.variables.map((variable: string) => (
                          <span
                            key={variable}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-800"
                          >
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">템플릿 내용:</p>
                  <div className="max-h-96 overflow-y-auto bg-gray-50 p-3 rounded text-xs font-mono text-gray-700 whitespace-pre-wrap">
                    {previewTemplate.template}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">템플릿을 선택하면 미리보기가 표시됩니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}