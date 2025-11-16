import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth/user-utils";

// Admin Dashboard Component
async function AdminDashboard({ user }: { user: any }) {
  const supabase = await createClient();
  
  // Get statistics
  const [teamsResult, usersResult, reflectionsResult] = await Promise.all([
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("reflections").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-2 text-gray-600">전체 시스템 현황을 확인하고 관리하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">총 팀</h3>
          <p className="text-4xl font-bold text-indigo-600">{teamsResult.count || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">총 사용자</h3>
          <p className="text-4xl font-bold text-indigo-600">{usersResult.count || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">총 리플렉션</h3>
          <p className="text-4xl font-bold text-indigo-600">{reflectionsResult.count || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">시스템 관리</h2>
          <div className="space-y-3">
            <a href="/dashboard/teams" className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-semibold text-gray-900">팀 관리</h3>
              <p className="text-sm text-gray-600">팀 생성, 수정, 삭제</p>
            </a>
            <a href="/dashboard/users" className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-semibold text-gray-900">사용자 관리</h3>
              <p className="text-sm text-gray-600">사용자 역할 및 권한 관리</p>
            </a>
            <a href="/dashboard/ai-prompts" className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-semibold text-gray-900">AI 프롬프트</h3>
              <p className="text-sm text-gray-600">AI 피드백 프롬프트 설정</p>
            </a>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">코칭 관리</h2>
          <div className="space-y-3">
            <a href="/dashboard/reflections" className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-semibold text-gray-900">리플렉션 관리</h3>
              <p className="text-sm text-gray-600">모든 리플렉션 확인 및 관리</p>
            </a>
            <a href="/dashboard/coaching-logs" className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-semibold text-gray-900">코칭 로그</h3>
              <p className="text-sm text-gray-600">전체 코칭 활동 모니터링</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Coach Dashboard Component
async function CoachDashboard({ user }: { user: any }) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get or create coach data
  let { data: coachData } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!coachData) {
    const { data: newCoachData } = await adminClient
      .from("coaches")
      .insert({
        user_id: user.id,
        active: true,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    coachData = newCoachData;
  }

  // Get assigned teams
  const { data: teams } = await supabase
    .from("coach_teams")
    .select(`
      team_id,
      teams (
        id,
        name,
        active
      )
    `)
    .eq("coach_id", coachData?.id || '');

  // Get pending reflections count
  const { count: pendingCount } = await supabase
    .from("reflections")
    .select("id", { count: "exact", head: true })
    .in("team_id", teams?.map((t: any) => t.teams.id) || [])
    .eq("status", "ai_feedback_done");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">코치 대시보드</h1>
        <p className="mt-2 text-gray-600">담당 팀의 학습 현황을 확인하고 코칭하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">담당 팀</h3>
          <p className="text-4xl font-bold text-indigo-600">{teams?.length || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">피드백 대기</h3>
          <p className="text-4xl font-bold text-orange-600">{pendingCount || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">이번 주 코칭</h3>
          <p className="text-4xl font-bold text-green-600">0</p>
        </div>
      </div>

      {/* My Teams */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">내 팀들</h2>
        {teams && teams.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((teamData: any) => (
              <a
                key={teamData.team_id}
                href={`/dashboard/teams/${teamData.teams.id}`}
                className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <h3 className="font-semibold text-gray-900">{teamData.teams.name}</h3>
                <p className="text-sm text-gray-600">
                  {teamData.teams.active ? "활성" : "비활성"}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">할당된 팀이 없습니다.</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <a
          href="/dashboard/reflections"
          className="block rounded-lg bg-indigo-600 p-6 text-center text-white hover:bg-indigo-700"
        >
          <h3 className="text-xl font-semibold">리플렉션 관리</h3>
          <p className="mt-2 text-indigo-100">팀 리플렉션 확인 및 피드백</p>
        </a>
        <a
          href="/dashboard/coaching-logs/new"
          className="block rounded-lg border-2 border-indigo-600 p-6 text-center text-indigo-600 hover:bg-indigo-50"
        >
          <h3 className="text-xl font-semibold">코칭 로그 작성</h3>
          <p className="mt-2 text-indigo-500">새로운 코칭 세션 기록</p>
        </a>
      </div>
    </div>
  );
}

// Learner Dashboard Component  
async function LearnerDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">학습자 대시보드</h1>
        <p className="mt-2 text-gray-600">팀 활동에 참여하고 성장하세요</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">빠른 액세스</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <a
            href="/learner/reflections/new"
            className="block rounded-lg bg-blue-600 p-6 text-center text-white hover:bg-blue-700"
          >
            <h3 className="text-xl font-semibold">리플렉션 작성</h3>
            <p className="mt-2 text-blue-100">이번 주 학습 성찰 작성</p>
          </a>
          <a
            href="/learner/reflections"
            className="block rounded-lg border-2 border-blue-600 p-6 text-center text-blue-600 hover:bg-blue-50"
          >
            <h3 className="text-xl font-semibold">내 리플렉션</h3>
            <p className="mt-2 text-blue-500">작성한 리플렉션 확인</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LEINN LMS</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">{user.email}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {user.role === "admin" ? (
          <AdminDashboard user={user} />
        ) : user.role === "coach" ? (
          <CoachDashboard user={user} />
        ) : (
          <LearnerDashboard user={user} />
        )}
      </main>
    </div>
  );
}