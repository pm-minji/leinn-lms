'use client';

import { ReflectionCard } from './ReflectionCard';
import { Database } from '@/types/supabase';
import { useEffect, useState } from 'react';

type Reflection = Database['public']['Tables']['reflections']['Row'];

export function ReflectionList() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReflections() {
      try {
        const response = await fetch('/api/reflections');
        if (!response.ok) {
          throw new Error('리플렉션을 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setReflections(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    }

    fetchReflections();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-600">아직 작성한 리플렉션이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reflections.map((reflection) => (
        <ReflectionCard key={reflection.id} reflection={reflection} />
      ))}
    </div>
  );
}
