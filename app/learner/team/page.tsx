import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { LearnerTeamView } from '@/components/learner/LearnerTeamView';

export default async function LearnerTeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();

  // Get learner with team info
  const { data: learner } = await adminClient
    .from('learners')
    .select(`
      id,
      team_id,
      joined_at,
      active,
      teams (
        id,
        name,
        description,
        active,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (!learner || !learner.teams) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">팀 정보</h1>
          <p className="text-gray-600 mb-6">아직 팀에 배정되지 않았습니다.</p>
          <a
            href="/learner/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            대시보드로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  // Get team members
  const { data: teamMembers } = await adminClient
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
    .eq('team_id', learner.team_id || '')
    .eq('active', true)
    .order('joined_at', { ascending: true });

  // Get team coaches
  const { data: teamCoaches } = await adminClient
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
    .eq('team_id', learner.team_id || '');

  // Get team reflections (recent ones)
  const { data: teamReflections } = await adminClient
    .from('reflections')
    .select(`
      id,
      title,
      status,
      created_at,
      week_start,
      learner_id,
      learners (
        users (
          name,
          avatar_url
        )
      )
    `)
    .eq('team_id', learner.team_id || '')
    .order('created_at', { ascending: false })
    .limit(10);

  // Redirect to profile page
  redirect('/learner/profile');
}