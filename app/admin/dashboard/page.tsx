import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RecentActivities } from "@/components/admin/RecentActivities";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const adminClient = createAdminClient();
  const { data: userData } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/");
  }

  // Get statistics
  const [teamsResult, usersResult, reflectionsResult] = await Promise.all([
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("reflections").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">관리자 대시보드</h1>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">총 팀</h3>
          <p className="text-4xl font-bold text-indigo-600">
            {teamsResult.count || 0}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            총 사용자
          </h3>
          <p className="text-4xl font-bold text-indigo-600">
            {usersResult.count || 0}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            총 리플렉션
          </h3>
          <p className="text-4xl font-bold text-indigo-600">
            {reflectionsResult.count || 0}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">빠른 액세스</h2>
          <div className="space-y-3">
            <a
              href="/admin/teams"
              className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">팀 관리</h3>
              <p className="text-sm text-gray-700">팀 생성 및 관리</p>
            </a>
            <a
              href="/admin/users"
              className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">사용자 관리</h3>
              <p className="text-sm text-gray-700">사용자 역할 및 권한 관리</p>
            </a>
            <a
              href="/admin/coaches"
              className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">코치 관리</h3>
              <p className="text-sm text-gray-700">코치 팀 할당 관리</p>
            </a>
            <a
              href="/admin/ai-prompts"
              className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">AI 프롬프트 관리</h3>
              <p className="text-sm text-gray-700">AI 피드백 프롬프트 설정</p>
            </a>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">최근 활동</h2>
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}
