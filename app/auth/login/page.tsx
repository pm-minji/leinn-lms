import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    const adminClient = createAdminClient();
    const { data: userData } = await adminClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role === 'admin') {
      redirect('/admin/dashboard');
    } else if (userData?.role === 'coach') {
      redirect('/coach/dashboard');
    } else if (userData?.role === 'learner') {
      redirect('/learner/dashboard');
    } else {
      // No role assigned, redirect to home to create user
      redirect('/');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">LEINN LMS</h1>
          <p className="mt-2 text-sm text-gray-600">
            팀 기반 창업 교육 플랫폼
          </p>
        </div>
        <div className="mt-8">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
