import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function CoachReflectionDetailPage({ 
  params 
}: { 
  params: { id: string }
}) {
  const { id } = params;
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

  // Allow both coach and admin to access
  if (userData?.role !== "coach" && userData?.role !== "admin") {
    redirect("/");
  }

  // Get reflection with all details
  const { data: reflection, error } = await supabase
    .from("reflections")
    .select(`
      id,
      title,
      content,
      status,
      created_at,
      updated_at,
      week_start,
      ai_summary,
      ai_risks,
      ai_actions,
      coach_feedback,
      learners!inner (
        id,
        users!inner (
          id,
          name,
          email,
          avatar_url
        )
      ),
      teams (
        id,
        name
      )
    `)
    .eq("id", id)
    .single();

  if (error || !reflection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">리플렉션을 찾을 수 없습니다</h1>
        <Link href="/coach/reflections" className="mt-4 text-blue-600 hover:underline">
          ← 리플렉션 목록으로 돌아가기
        </Link>
      </div>
    );
  }

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/coach/reflections" className="text-blue-600 hover:underline">
          ← 리플렉션 목록으로 돌아가기
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {reflection.title}
                </h1>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(reflection.status)}`}>
                  {getStatusLabel(reflection.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">학습자:</span> {reflection.learners.users.name}
                </div>
                <div>
                  <span className="font-medium">이메일:</span> {reflection.learners.users.email}
                </div>
                {reflection.teams && (
                  <div>
                    <span className="font-medium">팀:</span> {reflection.teams.name}
                  </div>
                )}
                <div>
                  <span className="font-medium">주차:</span> {new Date(reflection.week_start).toLocaleDateString('ko-KR')}
                </div>
                <div>
                  <span className="font-medium">제출일:</span> {new Date(reflection.created_at).toLocaleDateString('ko-KR')}
                </div>
                {reflection.updated_at !== reflection.created_at && (
                  <div>
                    <span className="font-medium">수정일:</span> {new Date(reflection.updated_at).toLocaleDateString('ko-KR')}
                  </div>
                )}
              </div>
            </div>

            {reflection.status === 'ai_feedback_done' && (
              <Link
                href={`/coach/reflections/${reflection.id}/feedback`}
                className="ml-4 inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                피드백 작성
              </Link>
            )}
          </div>
        </div>

        {/* Reflection Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">리플렉션 내용</h2>
          <div className="whitespace-pre-wrap text-gray-700">
            {reflection.content}
          </div>
        </div>

        {/* AI Analysis */}
        {(reflection.ai_summary || reflection.ai_risks || reflection.ai_actions) && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-blue-900">AI 분석 결과</h2>
            
            {reflection.ai_summary && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-blue-900">요약</h3>
                <p className="text-sm text-blue-800">{reflection.ai_summary}</p>
              </div>
            )}

            {reflection.ai_risks && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-blue-900">리스크</h3>
                <p className="text-sm text-blue-800">{reflection.ai_risks}</p>
              </div>
            )}

            {reflection.ai_actions && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-blue-900">제안 액션</h3>
                <p className="text-sm text-blue-800">{reflection.ai_actions}</p>
              </div>
            )}
          </div>
        )}

        {/* Coach Feedback */}
        {reflection.coach_feedback && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-green-900">코치 피드백</h2>
            <div className="whitespace-pre-wrap text-sm text-green-800">
              {reflection.coach_feedback}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}