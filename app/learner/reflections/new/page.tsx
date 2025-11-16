import { ReflectionForm } from '@/components/reflections/ReflectionForm';

export default function NewReflectionPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">새 리플렉션 작성</h1>
        <p className="mt-2 text-sm text-gray-600">
          이번 주 학습 내용을 돌아보고 성찰해보세요
        </p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <ReflectionForm />
      </div>
    </div>
  );
}
