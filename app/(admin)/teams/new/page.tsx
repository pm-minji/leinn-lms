import { TeamForm } from '@/components/admin/TeamForm';

export default function NewTeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">새 팀 생성</h1>
        <p className="mt-1 text-sm text-gray-500">
          새로운 팀을 생성합니다
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <TeamForm />
      </div>
    </div>
  );
}
