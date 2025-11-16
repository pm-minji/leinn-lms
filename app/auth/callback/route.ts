import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=${error.message}`);
    }

    if (data.user) {
      // Check if user exists in public.users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', data.user.id)
        .single();

      if (!existingUser) {
        // Create user in public.users table with default role
        const defaultRole = data.user.email === 'joon@pm-minji.com' ? 'admin' : 'learner';

        const adminClient = createAdminClient();
        const { error: userInsertError } = await adminClient.from('users').insert({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Unknown User',
          role: defaultRole,
          avatar_url: data.user.user_metadata?.avatar_url || null,
        });

        if (userInsertError) {
          console.error('Failed to create user:', userInsertError);

          // Check if user already exists (duplicate key error)
          const { data: existingUserCheck } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (!existingUserCheck) {
            // Critical error: cannot create user
            return NextResponse.redirect(`${origin}/auth/login?error=Failed to create user profile`);
          }
          // User exists, continue with the flow
        }

        // If admin, also create coach and learner records for testing
        if (defaultRole === 'admin') {
          // Create coach record
          await adminClient.from('coaches').insert({
            user_id: data.user.id,
            active: true,
            created_at: new Date().toISOString(),
          });

          // Create learner record
          await adminClient.from('learners').insert({
            user_id: data.user.id,
            team_id: null,
            active: true,
            joined_at: new Date().toISOString(),
          });
        } else if (defaultRole === 'learner') {
          // Create learner record for regular learners
          await adminClient.from('learners').insert({
            user_id: data.user.id,
            team_id: null,
            active: true,
            joined_at: new Date().toISOString(),
          });
        }
      }

      // Redirect based on role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (userData?.role === 'admin') {
        return NextResponse.redirect(`${origin}/admin/dashboard`);
      } else if (userData?.role === 'coach') {
        return NextResponse.redirect(`${origin}/coach/dashboard`);
      } else {
        return NextResponse.redirect(`${origin}/learner/dashboard`);
      }
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/`);
}
