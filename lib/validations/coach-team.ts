import { z } from 'zod';

export const coachTeamAssignmentSchema = z.object({
  coach_id: z.string().uuid('유효한 코치를 선택해주세요'),
  team_id: z.string().uuid('유효한 팀을 선택해주세요'),
});

export type CoachTeamAssignmentData = z.infer<typeof coachTeamAssignmentSchema>;
