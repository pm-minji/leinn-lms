import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';

interface Activity {
  id: string;
  type: 'reflection_submitted' | 'feedback_completed' | 'user_joined' | 'team_created' | 'ai_analysis_completed';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const activities: Activity[] = [];

    // Get recent reflections (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentReflections } = await adminClient
      .from('reflections')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        learners (
          users (
            name,
            email
          )
        )
      `)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Process reflections
    if (recentReflections) {
      for (const reflection of recentReflections) {
        // Reflection submitted
        activities.push({
          id: `reflection_${reflection.id}_submitted`,
          type: 'reflection_submitted',
          title: '새 리플렉션 제출',
          description: `${reflection.learners?.users?.name || '학습자'}님이 "${reflection.title}" 리플렉션을 제출했습니다`,
          timestamp: reflection.created_at,
          user: reflection.learners?.users ? {
            name: reflection.learners.users.name,
            email: reflection.learners.users.email
          } : undefined,
          metadata: {
            reflectionId: reflection.id,
            reflectionTitle: reflection.title
          }
        });

        // AI analysis completed
        if (reflection.status === 'ai_feedback_done' || reflection.status === 'coach_feedback_done') {
          activities.push({
            id: `reflection_${reflection.id}_ai_completed`,
            type: 'ai_analysis_completed',
            title: 'AI 분석 완료',
            description: `"${reflection.title}" 리플렉션의 AI 분석이 완료되었습니다`,
            timestamp: reflection.updated_at,
            metadata: {
              reflectionId: reflection.id,
              reflectionTitle: reflection.title
            }
          });
        }

        // Coach feedback completed
        if (reflection.status === 'coach_feedback_done') {
          activities.push({
            id: `reflection_${reflection.id}_feedback_completed`,
            type: 'feedback_completed',
            title: '코치 피드백 완료',
            description: `"${reflection.title}" 리플렉션에 코치 피드백이 작성되었습니다`,
            timestamp: reflection.updated_at,
            metadata: {
              reflectionId: reflection.id,
              reflectionTitle: reflection.title
            }
          });
        }
      }
    }

    // Get recent users (last 7 days)
    const { data: recentUsers } = await adminClient
      .from('users')
      .select('id, name, email, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentUsers) {
      for (const newUser of recentUsers) {
        activities.push({
          id: `user_${newUser.id}_joined`,
          type: 'user_joined',
          title: '새 사용자 가입',
          description: `${newUser.name}님이 시스템에 가입했습니다`,
          timestamp: newUser.created_at,
          user: {
            name: newUser.name,
            email: newUser.email
          }
        });
      }
    }

    // Get recent teams (last 7 days)
    const { data: recentTeams } = await adminClient
      .from('teams')
      .select('id, name, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentTeams) {
      for (const team of recentTeams) {
        activities.push({
          id: `team_${team.id}_created`,
          type: 'team_created',
          title: '새 팀 생성',
          description: `"${team.name}" 팀이 생성되었습니다`,
          timestamp: team.created_at,
          metadata: {
            teamId: team.id,
            teamName: team.name
          }
        });
      }
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return top 10 activities
    return NextResponse.json(activities.slice(0, 10));

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}