import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CoachTeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Allow both coach and admin
  if (userData?.role !== "coach" && userData?.role !== "admin") {
    redirect("/");
  }

  // Get coach data
  const { data: coachData } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!coachData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-3xl font-bold">팀 관리</h1>
        <p className="text-gray-600">
          코치 프로필이 설정되지 않았습니다. 관리자에게 문의하세요.
        </p>
      </div>
    );
  }

  // Get assigned teams with learner count
  const { data: teams } = await supabase
    .from("coach_teams")
    .select(
      `
      team_id,
      assigned_at,
      teams (
        id,
        name,
        active,
        created_at
      )
    `
    )
    .eq("coach_id", coachData.id)
    .order("assigned_at", { ascending: false });

  // Get learner counts for each team
  const teamIds = teams?.map((t: any) => t.teams.id) || [];
  const { data: learnerCounts } = await supabase
    .from("learners")
    .select("team_id")
    .in("team_id", teamIds)
    .eq("active", true);

  const learnerCountMap = learnerCounts?.reduce(
    (acc: any, learner: any) => {
      acc[learner.team_id] = (acc[learner.team_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">담당 팀 관리</h1>
        <Link
          href="/coach/dashboard"
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← 대시보드로 돌아가기
        </Link>
      </div>

      {teams && teams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((teamData: any) => {
            const team = teamData.teams;
            const learnerCount = learnerCountMap?.[team.id] || 0;

            return (
              <Link
                key={team.id}
                href={`/coach/coach-teams/${team.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {team.name}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      team.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {team.active ? "활성" : "비활성"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>학습자 수:</span>
                    <span className="font-semibold text-gray-900">
                      {learnerCount}명
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>할당일:</span>
                    <span className="text-gray-900">
                      {new Date(teamData.assigned_at).toLocaleDateString(
                        "ko-KR"
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-sm font-medium text-indigo-600">
                  팀 상세 보기 →
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-lg text-gray-600">할당된 팀이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-500">
            관리자에게 팀 할당을 요청하세요.
          </p>
        </div>
      )}
    </div>
  );
}
