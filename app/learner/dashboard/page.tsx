import { LearnerDashboard } from '@/components/dashboard/LearnerDashboard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile with role
  const adminClient = createAdminClient();
  const { data: userProfile } = await adminClient
    .from('users')
    .select('name, role')
    .eq('id', user.id)
    .single();

  // Allow both learner and admin to access
  if (userProfile?.role !== 'learner' && userProfile?.role !== 'admin') {
    redirect('/');
  }

  // Get learner record with team info
  const { data: learner, error: learnerError } = await adminClient
    .from('learners')
    .select(`
      id,
      team_id,
      joined_at,
      active,
      teams (
        id,
        name,
        active,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .single();

  console.log('Dashboard learner query:', { learner, learnerError, userId: user.id, userRole: userProfile?.role });

  // Create learner record if it doesn't exist and user is a learner
  if (!learner && userProfile?.role === 'learner') {
    console.log('Creating learner record for dashboard user:', user.id);
    
    const { data: newLearner, error: createError } = await adminClient
      .from('learners')
      .insert({
        user_id: user.id,
        active: true,
        joined_at: new Date().toISOString()
      })
      .select(`
        id,
        team_id,
        joined_at,
        active
      `)
      .single();

    console.log('Learner creation result:', { newLearner, createError });

    if (!createError && newLearner) {
      console.log('Redirecting to profile after learner creation');
      redirect('/learner/profile');
    }
  }

  if (!learner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-3xl font-bold">학습자 대시보드</h1>
        <p className="text-gray-600">
          학습자 프로필이 설정되지 않았습니다. 관리자에게 문의하세요.
        </p>
      </div>
    );
  }

  // Get reflections
  const { data: reflections } = await adminClient
    .from('reflections')
    .select('*')
    .eq('learner_id', learner.id)
    .order('created_at', { ascending: false });

  // Get team members if learner has a team
  let teamMembers: any[] = [];
  let teamCoaches: any[] = [];
  if (learner.team_id) {
    // Get team learners
    const { data: teammates } = await adminClient
      .from('learners')
      .select(`
        id,
        user_id,
        joined_at,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('team_id', learner.team_id)
      .eq('active', true)
      .neq('user_id', user.id);

    teamMembers = teammates || [];

    // Get team coaches
    const { data: coaches } = await adminClient
      .from('coach_teams')
      .select(`
        id,
        coaches (
          id,
          user_id,
          users (
            id,
            name,
            email,
            avatar_url
          )
        )
      `)
      .eq('team_id', learner.team_id);

    teamCoaches = coaches || [];
  }

  // Get available teams for team selection (if not assigned)
  let availableTeams: any[] = [];
  if (!learner.team_id) {
    const { data: teams } = await adminClient
      .from('teams')
      .select('id, name, description, active')
      .eq('active', true)
      .order('name');

    availableTeams = teams || [];
  }

  // Always redirect learners to their profile page (unified experience)
  redirect('/learner/profile');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <LearnerDashboard
        reflections={reflections || []}
        userName={userProfile?.name || user?.email?.split('@')[0] || '사용자'}
        learner={learner}
        teamMembers={teamMembers}
        teamCoaches={teamCoaches}
        availableTeams={availableTeams}
      />
    </div>
  );
}
