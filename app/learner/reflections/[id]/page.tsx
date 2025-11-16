import { ReflectionDetail } from '@/components/reflections/ReflectionDetail';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function ReflectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get learner record
  const { data: learner } = await supabase
    .from('learners')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!learner) {
    notFound();
  }

  // Get reflection
  const { data: reflection } = await supabase
    .from('reflections')
    .select('*')
    .eq('id', id)
    .eq('learner_id', learner.id)
    .single();

  if (!reflection) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <Link
          href="/learner/reflections"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>
      <ReflectionDetail reflection={reflection} />
    </div>
  );
}
