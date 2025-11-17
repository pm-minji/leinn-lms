import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to their role-specific dashboard
  if (user) {
    const adminClient = createAdminClient();
    const { data: userData, error: userError } = await adminClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // If user doesn't exist in public.users, create them
    if (userError || !userData) {
      const defaultRole = user.email === "joon@pm-minji.com" ? "admin" : "learner";

      try {
        const { error: userInsertError } = await adminClient.from("users").insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || 'Unknown User',
          role: defaultRole,
          avatar_url: user.user_metadata?.avatar_url || null,
        });

        if (userInsertError) {
          console.error("Failed to create user:", userInsertError);
          // If insert failed, try to fetch the user again (might already exist)
          const { data: existingUser } = await adminClient
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

          if (existingUser) {
            // User exists, redirect based on their role
            if (existingUser.role === "admin") {
              redirect("/admin/dashboard");
            } else if (existingUser.role === "coach") {
              redirect("/coach/dashboard");
            } else {
              redirect("/learner/dashboard");
            }
          } else {
            // Critical error: cannot create or fetch user
            console.error("Critical: Unable to create or fetch user profile");
            return (
              <div className="flex min-h-screen flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-600">프로필 생성 오류</h1>
                <p className="mt-4 text-gray-600">사용자 프로필을 생성할 수 없습니다. 관리자에게 문의하세요.</p>
                <Link href="/api/auth/logout" className="mt-4 text-blue-600 hover:underline">
                  로그아웃
                </Link>
              </div>
            );
          }
        }

        // Create role-specific records
        if (defaultRole === "admin") {
          // Create coach record for admin
          await adminClient.from("coaches").insert({
            user_id: user.id,
            active: true,
            created_at: new Date().toISOString(),
          });

          // Create learner record for admin (for testing purposes)
          await adminClient.from("learners").insert({
            user_id: user.id,
            team_id: null,
            active: true,
            joined_at: new Date().toISOString(),
          });

          redirect("/admin/dashboard");
        } else if (defaultRole === "learner") {
          // Create learner record for regular learners
          await adminClient.from("learners").insert({
            user_id: user.id,
            team_id: null,
            active: true,
            joined_at: new Date().toISOString(),
          });

          redirect("/learner/profile");
        }
      } catch (error) {
        console.error("Error during user setup:", error);
        return (
          <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-red-600">시스템 오류</h1>
            <p className="mt-4 text-gray-600">사용자 설정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
            <Link href="/api/auth/logout" className="mt-4 text-blue-600 hover:underline">
              로그아웃
            </Link>
          </div>
        );
      }
    }

    // Redirect based on existing user role
    if (userData?.role === "admin") {
      redirect("/admin/dashboard");
    } else if (userData?.role === "coach") {
      redirect("/coach/dashboard");
    } else if (userData?.role === "learner") {
      redirect("/learner/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <main className="w-full max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
          LEINN LMS
        </h1>
        <p className="mb-8 text-xl text-gray-700 md:text-2xl">
          학습자 리플렉션과 코칭을 위한 학습 관리 시스템
        </p>
        <p className="mb-12 text-lg text-gray-600">
          AI 기반 피드백과 코치 멘토링으로 학습 여정을 지원합니다
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className="w-full rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-700 sm:w-auto"
          >
            로그인
          </Link>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-4xl">📝</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              주간 리플렉션
            </h3>
            <p className="text-gray-600">
              매주 학습 경험을 기록하고 성찰합니다
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-4xl">🤖</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              AI 피드백
            </h3>
            <p className="text-gray-600">
              AI가 리플렉션을 분석하고 인사이트를 제공합니다
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-4xl">👥</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              코치 멘토링
            </h3>
            <p className="text-gray-600">
              전문 코치의 개인화된 피드백과 가이드
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
