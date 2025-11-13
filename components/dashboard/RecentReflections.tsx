import { ReflectionCard } from '@/components/reflections/ReflectionCard';
import { Database } from '@/types/supabase';

type Reflection = Database['public']['Tables']['reflections']['Row'];

interface RecentReflectionsProps {
  reflections: Reflection[];
}

export function RecentReflections({ reflections }: RecentReflectionsProps) {
  const recentReflections = reflections.slice(0, 3);

  if (recentReflections.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">아직 작성한 리플렉션이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentReflections.map((reflection) => (
        <ReflectionCard key={reflection.id} reflection={reflection} />
      ))}
    </div>
  );
}
