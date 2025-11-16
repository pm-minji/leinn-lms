import { redirect } from "next/navigation";

export default async function CoachesPage() {
  // Redirect to unified user management
  redirect("/admin/users");
}
