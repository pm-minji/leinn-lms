import { ReflectionStats } from './ReflectionStats';
import { RecentReflections } from './RecentReflections';
import { Database } from '@/types/supabase';
import Link from 'next/link';

type Reflection = Database['public']['Tables']['reflections']['Row'];

interface LearnerDashboardProps {
  reflections: Reflection[];
  userName: string;
}

export function LearnerDashboard({
  reflections,
  userName,
}: LearnerDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {userName}님!
        </h1>
        <p className="mt-2 text-gray-600">
          이번 주 학습을 돌아보고 리플렉션을 작성해보세요
        </p>
      </div>

      <ReflectionStats reflections={reflections} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            최근 리플렉션
          </h2>
          <Link
            href="/reflections"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            전체 보기 →
          </Link>
        </div>
        <RecentReflections reflections={reflections} />
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="font-semibold text-blue-900">💡 리플렉션 작성 팁</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• 이번 주 가장 의미있었던 학습 경험을 떠올려보세요</li>
          <li>• 어려웠던 점과 그것을 어떻게 극복했는지 작성해보세요</li>
          <li>• 다음 주에 실천할 구체적인 행동을 계획해보세요</li>
        </ul>
        <Link
          href="/reflections/new"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          새 리플렉션 작성하기
        </Link>
      </div>
    </div>
  );
}rdProps {
  reflections: Reflection[];
  userName: string;
}

export function LearnerDashboard({
  reflections,
  userName,
}: LearnerDashboardProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          안녕하세요, {userName}님!
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          이번 주 학습을 돌아보고 리플렉션을 작성해보세요
        </p>
      </div>

      <ReflectionStats reflections={reflections} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
            최근 리플렉션
          </h2>
          <Link
            href="/reflections"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            전체 보기 →
          </Link>
        </div>
        <RecentReflections reflections={reflections} />
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-blue-900 sm:text-base">💡 리플렉션 작성 팁</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• 이번 주 가장 의미있었던 학습 경험을 떠올려보세요</li>
          <li>• 어려웠던 점과 그것을 어떻게 해결했는지 기록하세요</li>
          <li>• 다음 주에 시도해볼 구체적인 행동을 계획하세요</li>
        </ul>
        <Link
          href="/reflections/new"
          className="mt-4 inline-block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
        >
          새 리플렉션 작성하기
        </Link>
      </div>
    </div>
  );
}