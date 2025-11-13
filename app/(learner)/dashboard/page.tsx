import { LearnerDashboard } from '@/components/dashboard/LearnerDashboard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single();

  // Get learner record
  const { data: learner } = await supabase
    .from('learners')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // Get reflections
  const { data: reflections } = await supabase
    .from('reflections')
    .select('*')
    .eq('learner_id', learner?.id || '')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <LearnerDashboard
        reflections={reflections || []}
        userName={userProfile?.name || user.email?.split('@')[0] || '사용자'}
      />
    </div>
  );
}
