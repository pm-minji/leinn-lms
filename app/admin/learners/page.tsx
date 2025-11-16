import { redirect } from "next/navigation";

export default async function LearnersPage() {
  // Redirect to unified user management
  redirect("/admin/users");
}