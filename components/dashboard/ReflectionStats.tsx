'use client';

import { Database } from '@/types/supabase';

type Reflection = Database['public']['Tables']['reflections']['Row'];

interface ReflectionStatsProps {
  reflections: Reflection[];
}

export function ReflectionStats({ reflections }: ReflectionStatsProps) {
  const totalCount = reflections.length;
  const feedbackDoneCount = reflections.filter(
    (r) => r.status === 'coach_feedback_done'
  ).length;
  const pendingCount = reflections.filter(
    (r) => r.status !== 'coach_feedback_done'
  ).length;

  const stats = [
    {
      label: '전체 리플렉션',
      value: totalCount,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '피드백 완료',
      value: feedbackDoneCount,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: '피드백 대기',
      value: pendingCount,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg ${stat.bgColor} p-4 shadow-sm sm:p-6`}
        >
          <p className="text-xs font-medium text-gray-600 sm:text-sm">{stat.label}</p>
          <p className={`mt-2 text-2xl font-bold ${stat.color} sm:text-3xl`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
