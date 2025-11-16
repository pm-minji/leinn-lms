import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser, hasRole } from "@/lib/auth/user-utils";
import { UserDetailForm } from "@/components/admin/UserDetailForm";
import Link from "next/link";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  if (!hasRole(user, 'admin')) {
    redirect("/");
  }

  const adminClient = createAdminClient();

  // Get user with all related data
  const { data: userData, error: userError } = await adminClient
    .from("users")
    .select(`
      id,
      name,
      email,
      role,
      avatar_url,
      created_at,
      updated_at,
      learners (
        id,
        team_id,
        active,
        joined_at,
        teams (
          id,
          name
        )
      ),
      coaches (
        id,
        active,
        created_at,
        specialty
      )
    `)
    .eq("id", id)
    .single();

  if (userError || !userData) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/admin/users" className="text-blue-600 hover:underline">
            ← 사용자 목록으로 돌아가기
          </Link>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">사용자를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-red-600">요청하신 사용자가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  // Get available teams for assignment
  const { data: teams } = await adminClient
    .from("teams")
    .select("id, name, active")
    .eq("active", true)
    .order("name");

  // Get coach team assignments if user is a coach
  let coachTeams: any[] = [];
  if (userData.coaches && userData.coaches.length > 0) {
    const { data: assignments } = await adminClient
      .from("coach_teams")
      .select(`
        id,
        team_id,
        teams (
          id,
          name
        )
      `)
      .eq("coach_id", userData.coaches[0].id);
    
    coachTeams = assignments || [];
  }

  // Get recent reflections if user is a learner
  let recentReflections: any[] = [];
  if (userData.learners && userData.learners.length > 0) {
    const { data: reflections } = await adminClient
      .from("reflections")
      .select(`
        id,
        title,
        status,
        created_at,
        week_start
      `)
      .eq("learner_id", userData.learners[0].id)
      .order("created_at", { ascending: false })
      .limit(5);
    
    recentReflections = reflections || [];
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-blue-600 hover:underline">
          ← 사용자 목록으로 돌아가기
        </Link>
      </div>

      <UserDetailForm 
        user={userData}
        teams={teams || []}
        coachTeams={coachTeams}
        recentReflections={recentReflections}
      />
    </div>
  );
}