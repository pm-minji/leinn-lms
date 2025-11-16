import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { LearnerProfile } from '@/components/learner/LearnerProfile';

export default async function LearnerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();

  // Get user profile
  const { data: userProfile } = await adminClient
    .from('users')
    .select('id, name, email, role, avatar_url, created_at')
    .eq('id', user.id)
    .single();

  if (!userProfile || (userProfile.role !== 'learner' && userProfile.role !== 'admin')) {
    redirect('/');
  }

  // Get or create learner record
  let { data: learner, error: learnerError } = await adminClient
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

  console.log('Learner query result:', { learner, learnerError });

  // Create learner record if it doesn't exist
  if (!learner && userProfile.role === 'learner') {
    console.log('Creating learner record for user:', user.id);
  console.log('User profile:', userProfile);
    
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

    if (createError) {
      console.error('Error creating learner:', createError);
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-4 text-3xl font-bold">마이페이지</h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">
              학습자 프로필 생성에 실패했습니다. 관리자에게 문의하세요.
            </p>
            <p className="text-red-600 text-sm mt-2">
              오류 상세: {createError.message}
            </p>
          </div>
        </div>
      );
    }

    console.log('Successfully created learner:', newLearner);
    learner = { ...newLearner, teams: null };
  }

  if (!learner) {
    console.log('No learner record found for user:', user.id, 'with role:', userProfile.role);
  console.log('Learner query result:', learner);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-3xl font-bold">마이페이지</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            학습자 프로필이 설정되지 않았습니다.
          </p>
          <p className="text-yellow-600 text-sm mt-2">
            사용자 ID: {user.id}<br/>
            역할: {userProfile.role}<br/>
            페이지를 새로고침하거나 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    );
  }

  // Get reflections for stats
  const { data: reflections } = await adminClient
    .from('reflections')
    .select('id, status, created_at, week_start')
    .eq('learner_id', learner.id)
    .order('created_at', { ascending: false });

  // Get team members if learner has a team
  let teamMembers: any[] = [];
  let teamCoaches: any[] = [];
  let currentTeam: any = null;

  if (learner.team_id) {
    // Get team info directly
    const { data: teamInfo } = await adminClient
      .from('teams')
      .select('id, name, active, created_at')
      .eq('id', learner.team_id)
      .single();

    currentTeam = teamInfo;

    if (teamInfo) {
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
  }

  // Get available teams for team selection
  const { data: availableTeams } = await adminClient
    .from('teams')
    .select('id, name, active')
    .eq('active', true)
    .order('name');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <LearnerProfile
        user={userProfile}
        learner={learner}
        currentTeam={currentTeam}
        teamMembers={teamMembers}
        teamCoaches={teamCoaches}
        availableTeams={availableTeams || []}
        reflections={reflections || []}
      />
    </div>
  );
}