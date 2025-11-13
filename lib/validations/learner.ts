import { z } from 'zod';

export const learnerTeamAssignmentSchema = z.object({
  team_id: z.string().uuid('유효한 팀을 선택해주세요').nullable(),
});

export type LearnerTeamAssignmentData = z.infer<typeof learnerTeamAssignmentSchema>;
