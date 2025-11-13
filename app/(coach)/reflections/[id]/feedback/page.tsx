import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CoachFeedbackForm } from '@/components/coach/CoachFeedbackForm';
import { getReflectionByIdForCoach } from '@/lib/services/reflection-service';
import Link from 'next/link';

export default async function CoachFeedbackPage({
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
          href={`/coach/reflections/${params.id}`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← 리플렉션으로 돌아가기
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        코치 피드백 작성
      </h1>

      <CoachFeedbackForm reflection={reflection} learnerName={learnerName} />
    </div>
  );
}
