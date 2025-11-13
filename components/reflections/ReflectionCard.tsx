import { StatusBadge } from '@/components/ui/StatusBadge';
import { Database } from '@/types/supabase';
import Link from 'next/link';

type Reflection = Database['public']['Tables']['reflections']['Row'];

interface ReflectionCardProps {
  reflection: Reflection;
}

export function ReflectionCard({ reflection }: ReflectionCardProps) {
  const date = new Date(reflection.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      href={`/reflections/${reflection.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
            {reflection.title}
          </h3>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">{date}</p>
        </div>
        <StatusBadge status={reflection.status} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
        {reflection.content}
      </p>
      {reflection.coach_feedback && (
        <div className="mt-3 rounded-md bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-900">코치 피드백</p>
          <p className="mt-1 line-clamp-2 text-sm text-blue-800">
            {reflection.coach_feedback}
          </p>
        </div>
      )}
    </Link>
  );
}
