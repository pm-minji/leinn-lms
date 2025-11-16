import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();
  const { data: userData } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // 코치와 관리자만 접근 가능
  if (userData?.role !== 'coach' && userData?.role !== 'admin') {
    redirect('/learner/profile');
  }

  // 관리자 대시보드로 리다이렉션 (통합 관리)
  redirect('/admin/dashboard');
}