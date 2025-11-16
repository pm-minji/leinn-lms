import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error || !user) {
      return NextResponse.json(
        { error: error || '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Only admins can disable RLS
    if (!hasRole(user, 'admin')) {
      return NextResponse.json(
        { error: '관리자만 RLS를 비활성화할 수 있습니다' },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // SQL commands to disable RLS
    const disableRlsCommands = [
      // Drop all existing policies first
      `DROP POLICY IF EXISTS "Learners can view own reflections" ON reflections;`,
      `DROP POLICY IF EXISTS "Learners can insert own reflections" ON reflections;`,
      `DROP POLICY IF EXISTS "Learners can update own reflections" ON reflections;`,
      `DROP POLICY IF EXISTS "Learners can view own profile" ON learners;`,
      
      `DROP POLICY IF EXISTS "Coaches can view team reflections" ON reflections;`,
      `DROP POLICY IF EXISTS "Coaches can update team reflections" ON reflections;`,
      `DROP POLICY IF EXISTS "Coaches can view team learners" ON learners;`,
      `DROP POLICY IF EXISTS "Coaches can view own coaching logs" ON coaching_logs;`,
      `DROP POLICY IF EXISTS "Coaches can insert own coaching logs" ON coaching_logs;`,
      `DROP POLICY IF EXISTS "Coaches can update own coaching logs" ON coaching_logs;`,
      `DROP POLICY IF EXISTS "Coaches can view assigned teams" ON teams;`,
      
      `DROP POLICY IF EXISTS "Admins have full access to users" ON users;`,
      `DROP POLICY IF EXISTS "Admins have full access to teams" ON teams;`,
      `DROP POLICY IF EXISTS "Admins have full access to coaches" ON coaches;`,
      `DROP POLICY IF EXISTS "Admins have full access to learners" ON learners;`,
      `DROP POLICY IF EXISTS "Admins have full access to coach_teams" ON coach_teams;`,
      `DROP POLICY IF EXISTS "Admins have full access to ai_prompt_templates" ON ai_prompt_templates;`,
      `DROP POLICY IF EXISTS "Admins can view all reflections" ON reflections;`,
      `DROP POLICY IF EXISTS "Admins can view all coaching logs" ON coaching_logs;`,
      
      `DROP POLICY IF EXISTS "Users can view own record" ON users;`,
      `DROP POLICY IF EXISTS "Users can update own record" ON users;`,
      
      // Disable RLS on all tables
      `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE teams DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE coaches DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE learners DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE coach_teams DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE reflections DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE coaching_logs DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE okrs DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE peer_reviews DISABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE ai_prompt_templates DISABLE ROW LEVEL SECURITY;`,
    ];

    const results = [];
    for (const command of disableRlsCommands) {
      try {
        const { error } = await adminClient.rpc('exec_sql', { sql: command });
        if (error) {
          console.warn(`Warning executing: ${command}`, error);
        }
        results.push({ command, success: !error, error: error?.message });
      } catch (err) {
        console.warn(`Error executing: ${command}`, err);
        results.push({ command, success: false, error: (err as Error).message });
      }
    }

    return NextResponse.json({
      message: 'RLS 비활성화 완료',
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      }
    });

  } catch (error) {
    console.error('Error disabling RLS:', error);
    return NextResponse.json(
      { error: 'RLS 비활성화 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}