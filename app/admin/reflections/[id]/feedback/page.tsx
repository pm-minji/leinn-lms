import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser, hasRole } from "@/lib/auth/user-utils";
import { CoachFeedbackForm } from "@/components/admin/CoachFeedbackForm";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import Link from "next/link";

export default async function ReflectionFeedbackPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  if (!hasRole(user, 'coach')) {
    redirect("/");
  }

  const adminClient = createAdminClient();

  // Get reflection with all details
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

  if (reflection.status !== 'ai_feedback_done' && reflection.status !== 'coach_feedback_done') {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/admin/reflections" className="text-blue-600 hover:underline">
            ← 리플렉션 목록으로 돌아가기
          </Link>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h1 className="text-lg font-semibold text-yellow-800">피드백 작성 불가</h1>
          <p className="mt-2 text-sm text-yellow-600">
            AI 분석이 완료된 후에 피드백을 작성할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // Get learner and team info
  let learnerInfo = null;
  let teamInfo = null;

  if (reflection.learner_id) {
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
  }

  if (reflection.team_id) {
    const { data: team } = await adminClient
      .from("teams")
      .select("id, name")
      .eq("id", reflection.team_id)
      .single();

    teamInfo = team;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/reflections/${reflection.id}`} className="text-blue-600 hover:underline">
          ← 리플렉션 상세보기로 돌아가기
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-10rem)]">
        {/* Left Column - Reflection Content & AI Analysis */}
        <div className="lg:overflow-y-auto lg:pr-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Reflection Header */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 sticky top-0 z-10 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              {reflection.title}
            </h1>
            
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              {learnerInfo && (
                <div>
                  <span className="font-medium">학습자:</span> {learnerInfo.users.name}
                </div>
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
            </div>
          </div>

          {/* Reflection Content */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">리플렉션 내용</h2>
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer content={reflection.content} />
            </div>
          </div>

          {/* AI Analysis */}
          {(reflection.ai_summary || reflection.ai_risks || reflection.ai_actions) && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-blue-900">AI 분석 결과</h2>
              
              {reflection.ai_summary && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-blue-900">📋 분석 요약</h3>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer content={reflection.ai_summary} />
                    </div>
                  </div>
                </div>
              )}

              {reflection.ai_risks && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-blue-900">⚠️ 주의사항</h3>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer content={reflection.ai_risks} />
                    </div>
                  </div>
                </div>
              )}

              {reflection.ai_actions && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-blue-900">💡 코칭 제안</h3>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer content={reflection.ai_actions} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 스크롤 여백 */}
          <div className="h-8"></div>
        </div>

        {/* Right Column - Coach Feedback Form */}
        <div className="lg:overflow-y-auto lg:pl-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <CoachFeedbackForm 
            reflectionId={reflection.id}
            existingFeedback={reflection.coach_feedback}
            learnerName={learnerInfo?.users?.name || '알 수 없는 사용자'}
            aiSummary={reflection.ai_summary}
            aiRisks={reflection.ai_risks}
            aiActions={reflection.ai_actions}
          />
        </div>
      </div>
    </div>
  );
}