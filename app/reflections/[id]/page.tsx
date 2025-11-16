import { redirect } from 'next/navigation';

export default async function ReflectionRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Redirect to learner reflections
  redirect(`/learner/reflections/${id}`);
}