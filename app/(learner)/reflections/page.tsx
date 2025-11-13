import { ReflectionList } from '@/components/reflections/ReflectionList';
import Link from 'next/link';

export default function ReflectionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">내 리플렉션</h1>
          <p className="mt-2 text-sm text-gray-600">
            작성한 리플렉션을 확인하고 코치 피드백을 받아보세요
          </p>
        </div>
        <Link
          href="/reflections/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 sm:w-auto"
        >
          새 리플렉션 작성
        </Link>
      </div>
      <ReflectionList />
    </div>
  );
}
