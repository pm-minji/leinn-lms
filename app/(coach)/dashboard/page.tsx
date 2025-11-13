import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TeamDashboard } from '@/components/coach/TeamDashboard';
import { getCoachTeams } from '@/lib/services/team-service';

export default async function CoachDashboardPage() {
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
    .select('name, role')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    redirect('/auth/login');
  }

  // Check if user is coach or admin
  if (userData.role !== 'coach' && userData.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get coach teams
  const teams = await getCoachTeams(user.id);

  return (
    <div className="mx-auto max-w-7xl py-8">
      <TeamDashboard teams={teams} coachName={userData.name} />
    </div>
  );
}
