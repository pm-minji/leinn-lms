import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser, hasRole } from "@/lib/auth/user-utils";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { AIAnalysisButton } from "@/components/admin/AIAnalysisButton";
import Link from "next/link";

export default async function AdminReflectionDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Allow both coach and admin to access
  if (!hasRole(user, 'coach')) {
    redirect("/");
  }

  const supabase = await createClient();

  // Get reflection with all details using admin client to bypass RLS
  const adminClient = createAdminClient();
  const { data: reflection, error: reflectionError } = await adminClient
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
      learner_id,
      team_id
    `)
    .eq("id", id)
    .single();

  let learnerInfo = null;
  let teamInfo = null;

  if (reflection) {
    // Get learner info separately
    const { data: learner } = await adminClient
      .from("learners")
      .select(`
        id,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq("id", reflection.learner_id)
      .single();

    learnerInfo = learner;

    // Get team info if exists
    if (reflection.team_id) {
      const { data: team } = await adminClient
        .from("teams")
        .select("id, name")
        .eq("id", reflection.team_id)
        .single();

      teamInfo = team;
    }
  }

  if (reflectionError || !reflection) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/admin/reflections" className="text-blue-600 hover:underline">
            ← 리플렉션 목록으로 돌아가기
          </Link>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">리플렉션을 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-red-600">요청하신 리플렉션이 존재하지 않거나 접근 권한이 없습니다.</p>
        </div>
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
    <div className="space-y-6">
      <div>
        <Link href="/admin/reflections" className="text-blue-600 hover:underline">
          ← 리플렉션 목록으로 돌아가기
        </Link>
      </div>

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
              {learnerInfo && (
                <>
                  <div>
                    <span className="font-medium">학습자:</span> {learnerInfo.users.name}
                  </div>
                  <div>
                    <span className="font-medium">이메일:</span> {learnerInfo.users.email}
                  </div>
                </>
              )}
              {teamInfo && (
                <div>
                  <span className="font-medium">팀:</span> {teamInfo.name}
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

          <div className="ml-4 flex items-center space-x-2">
            {reflection.status === 'submitted' && (
              <AIAnalysisButton reflectionId={reflection.id} />
            )}
            {reflection.status === 'ai_feedback_done' && (
              <Link
                href={`/admin/reflections/${reflection.id}/feedback`}
                className="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                피드백 작성
              </Link>
            )}
            {reflection.status === 'coach_feedback_done' && (
              <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
                ✓ 완료
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reflection Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">리플렉션 내용</h2>
        <MarkdownRenderer content={reflection.content} />
      </div>

      {/* AI Analysis */}
      {(reflection.ai_summary || reflection.ai_risks || reflection.ai_actions) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-blue-900">AI 분석 결과</h2>
          
          {reflection.ai_summary && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-blue-900">📋 분석 요약</h3>
              <div className="text-sm text-blue-800">
                <MarkdownRenderer content={reflection.ai_summary} />
              </div>
            </div>
          )}

          {reflection.ai_risks && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-blue-900">⚠️ 주의사항</h3>
              <div className="text-sm text-blue-800">
                <MarkdownRenderer content={reflection.ai_risks} />
              </div>
            </div>
          )}

          {reflection.ai_actions && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-blue-900">💡 코칭 제안</h3>
              <div className="text-sm text-blue-800">
                <MarkdownRenderer content={reflection.ai_actions} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coach Feedback */}
      {reflection.coach_feedback && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-green-900">코치 피드백</h2>
          <div className="text-sm text-green-800">
            <MarkdownRenderer content={reflection.coach_feedback} />
          </div>
        </div>
      )}
    </div>
  );
}