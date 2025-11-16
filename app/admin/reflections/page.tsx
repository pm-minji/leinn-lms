import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser, hasRole } from "@/lib/auth/user-utils";
import Link from "next/link";

export default async function AdminReflectionsPage() {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Allow both coach and admin to access
  if (!hasRole(user, 'coach')) {
    redirect("/");
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get or create coach data for coach functionality
  let { data: coachData } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!coachData && hasRole(user, 'coach')) {
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

  if (!coachData) {
    redirect("/");
  }

  // Get reflections using admin client to bypass RLS
  let reflectionsQuery = adminClient
    .from("reflections")
    .select(`
      id,
      title,
      content,
      status,
      created_at,
      week_start,
      ai_summary,
      coach_feedback,
      learner_id,
      team_id
    `)
    .order("created_at", { ascending: false });

  // If coach (not admin), filter by assigned teams
  if (user.role === "coach") {
    const { data: assignedTeams } = await supabase
      .from("coach_teams")
      .select("team_id")
      .eq("coach_id", coachData.id);

    const teamIds = assignedTeams?.map(t => t.team_id) || [];
    if (teamIds.length > 0) {
      reflectionsQuery = reflectionsQuery.in("team_id", teamIds);
    } else {
      // No assigned teams, show empty result
      reflectionsQuery = reflectionsQuery.eq("id", "00000000-0000-0000-0000-000000000000");
    }
  }

  const { data: reflections } = await reflectionsQuery;

  // Get learner and team info separately for each reflection
  const enrichedReflections = await Promise.all(
    (reflections || []).map(async (reflection) => {
      const [learnerResult, teamResult] = await Promise.all([
        adminClient
          .from("learners")
          .select(`
            id,
            users (
              id,
              name,
              email
            )
          `)
          .eq("id", reflection.learner_id)
          .single(),
        reflection.team_id
          ? adminClient
              .from("teams")
              .select("id, name")
              .eq("id", reflection.team_id)
              .single()
          : Promise.resolve({ data: null })
      ]);

      return {
        ...reflection,
        learners: learnerResult.data,
        teams: teamResult.data
      };
    })
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'ai_feedback_pending':
        return 'bg-blue-100 text-blue-800';
      case 'ai_feedback_done':
        return 'bg-orange-100 text-orange-800';
      case 'coach_feedback_done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return '제출됨';
      case 'ai_feedback_pending':
        return 'AI 분석 중';
      case 'ai_feedback_done':
        return '피드백 대기';
      case 'coach_feedback_done':
        return '완료';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">리플렉션 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          학습자들이 제출한 리플렉션을 확인하고 피드백을 제공하세요
        </p>
      </div>

      {enrichedReflections && enrichedReflections.length > 0 ? (
        <div className="space-y-6">
          {enrichedReflections.map((reflection: any) => (
            <div
              key={reflection.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reflection.title}
                    </h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(reflection.status)}`}>
                      {getStatusLabel(reflection.status)}
                    </span>
                  </div>
                  
                  <div className="mb-3 text-sm text-gray-600">
                    <span className="font-medium">{reflection.learners?.users?.name || '알 수 없는 사용자'}</span>
                    {reflection.teams && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{reflection.teams.name}</span>
                      </>
                    )}
                    <span className="mx-2">•</span>
                    <span>주차: {new Date(reflection.week_start).toLocaleDateString('ko-KR')}</span>
                    <span className="mx-2">•</span>
                    <span>제출일: {new Date(reflection.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 line-clamp-3">
                      {reflection.content.substring(0, 200)}
                      {reflection.content.length > 200 && '...'}
                    </p>
                  </div>

                  {reflection.ai_summary && (
                    <div className="mb-4 rounded-md bg-blue-50 p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">AI 요약</h4>
                      <p className="text-sm text-blue-800">{reflection.ai_summary}</p>
                    </div>
                  )}

                  {reflection.coach_feedback && (
                    <div className="mb-4 rounded-md bg-green-50 p-3">
                      <h4 className="text-sm font-medium text-green-900 mb-1">코치 피드백</h4>
                      <p className="text-sm text-green-800">{reflection.coach_feedback}</p>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Link
                    href={`/admin/reflections/${reflection.id}`}
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    상세보기
                  </Link>
                  
                  {reflection.status === 'submitted' && (
                    <span className="inline-flex items-center rounded-md bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-800">
                      🤖 AI 분석 필요
                    </span>
                  )}
                  
                  {reflection.status === 'ai_feedback_pending' && (
                    <span className="inline-flex items-center rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800">
                      ⏳ AI 분석 중...
                    </span>
                  )}
                  
                  {reflection.status === 'ai_feedback_done' && (
                    <Link
                      href={`/admin/reflections/${reflection.id}/feedback`}
                      className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
                    >
                      ✍️ 피드백 작성
                    </Link>
                  )}
                  
                  {reflection.status === 'coach_feedback_done' && (
                    <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
                      ✅ 완료
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">제출된 리플렉션이 없습니다.</p>
          {user.role === "coach" && (
            <p className="mt-2 text-sm text-gray-400">
              할당된 팀이 없거나 팀에서 아직 리플렉션을 제출하지 않았습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}