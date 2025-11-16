import { redirect } from "next/navigation";
import { getAuthenticatedUser, hasRole } from "@/lib/auth/user-utils";
import { QuickTeamCreate } from "@/components/admin/QuickTeamCreate";

export default async function NewTeamPage() {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  if (!hasRole(user, 'admin')) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 팀 생성</h1>
        <p className="mt-1 text-sm text-gray-600">
          새로운 학습 팀을 생성합니다
        </p>
      </div>

      <QuickTeamCreate />
    </div>
  );
}