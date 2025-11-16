import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser, hasRole } from "@/lib/auth/user-utils";
import { UserManagement } from "@/components/admin/UserManagement";

export default async function AdminUsersPage() {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  if (!hasRole(user, 'admin')) {
    redirect("/");
  }

  const adminClient = createAdminClient();

  // Get all users with their roles and additional info
  const { data: users } = await adminClient
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
        teams (
          id,
          name
        )
      ),
      coaches (
        id,
        active
      )
    `)
    .order("created_at", { ascending: false });

  return <UserManagement users={users || []} />;
}