import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ReflectionReview } from '@/components/coach/ReflectionReview';
import { getReflectionByIdForCoach } from '@/lib/services/reflection-service';
import Link from 'next/link';

export default async function CoachReflectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user info
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    redirect('/auth/login');
  }

  // Check if user is coach or admin
  if (userData.role !== 'coach' && userData.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get reflection with coach access
  const reflection = await getReflectionByIdForCoach(user.id, params.id);

  const learnerName = reflection.learners?.users?.name || '알 수 없는 학습자';

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <Link
          href="/coach/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← 대시보드로 돌아가기
        </Link>
      </div>

      <ReflectionReview reflection={reflection} learnerName={learnerName} />

      {!reflection.coach_feedback && (
        <div className="mt-6">
          <Link
            href={`/coach/reflections/${params.id}/feedback`}
            className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            피드백 작성하기
          </Link>
        </div>
      )}
    </div>
  );
}
