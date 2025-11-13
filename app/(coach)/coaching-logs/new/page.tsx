import { CoachingLogForm } from '@/components/coach/CoachingLogForm';

export default function NewCoachingLogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 코칭 로그</h1>
        <p className="mt-2 text-sm text-gray-600">
          학습자 또는 팀과의 코칭 세션을 기록하세요
        </p>
      </div>
      <CoachingLogForm />
    </div>
  );
}
