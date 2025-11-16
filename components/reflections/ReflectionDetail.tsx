'use client';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { CoachFeedbackSection } from './CoachFeedbackSection';
import { Database } from '@/types/supabase';

type Reflection = Database['public']['Tables']['reflections']['Row'];

interface ReflectionDetailProps {
  reflection: Reflection;
}

export function ReflectionDetail({ reflection }: ReflectionDetailProps) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
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

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          리플렉션 내용
        </h2>
        <MarkdownRenderer content={reflection.content} />
      </div>

      {/* AI feedback is intentionally hidden from learners */}
      {/* Only coach feedback is shown to learners */}
      <CoachFeedbackSection
        coachFeedback={reflection.coach_feedback}
        status={reflection.status}
      />
    </div>
  );
}
