import { createAdminClient } from '@/lib/supabase/admin';

export async function updateUserRole(
  userId: string,
  newRole: 'learner' | 'coach' | 'admin'
) {
  const supabase = createAdminClient();

  // Get current user data
  const { data: currentUser, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError || !currentUser) {
    throw new Error('사용자를 찾을 수 없습니다');
  }

  const oldRole = currentUser.role;

  // Update user role
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (updateError) {
    throw new Error('사용자 역할 업데이트에 실패했습니다');
  }

  // Handle role-specific table updates
  if (newRole === 'coach' && oldRole !== 'coach') {
    // Create coach record if changing to coach
    const { error: coachError } = await supabase
      .from('coaches')
      .insert({ user_id: userId, active: true })
      .select()
      .single();

    if (coachError && coachError.code !== '23505') {
      // Ignore duplicate key error
      throw new Error('코치 레코드 생성에 실패했습니다');
    }
  }

  if (newRole === 'learner' && oldRole !== 'learner') {
    // Create learner record if changing to learner
    const { error: learnerError } = await supabase
      .from('learners')
      .insert({ user_id: userId, active: true })
      .select()
      .single();

    if (learnerError && learnerError.code !== '23505') {
      // Ignore duplicate key error
      throw new Error('학습자 레코드 생성에 실패했습니다');
    }
  }

  // Deactivate coach record if changing from coach to another role
  if (oldRole === 'coach' && newRole !== 'coach') {
    await supabase
      .from('coaches')
      .update({ active: false })
      .eq('user_id', userId);
  }

  // Deactivate learner record if changing from learner to another role
  if (oldRole === 'learner' && newRole !== 'learner') {
    await supabase
      .from('learners')
      .update({ active: false })
      .eq('user_id', userId);
  }

  return { success: true };
}
