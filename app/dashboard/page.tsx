import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function DashboardRedirect() {
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

  // Redirect to role-specific dashboard
  if (userData?.role === 'admin') {
    redirect('/admin/dashboard');
  } else if (userData?.role === 'coach') {
    redirect('/coach/dashboard');
  } else {
    redirect('/learner/dashboard');
  }
}
