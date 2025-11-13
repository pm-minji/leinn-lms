import { z } from 'zod';

export const coachingLogSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  session_date: z.string().min(1, '세션 날짜를 선택해주세요'),
  session_type: z.enum(['1:1', 'team', 'weekly'], {
    errorMap: () => ({ message: '세션 유형을 선택해주세요' }),
  }),
  learner_id: z.string().nullable().optional(),
  team_id: z.string().nullable().optional(),
  notes: z
    .string()
    .min(10, '메모는 최소 10자 이상 입력해주세요')
    .max(5000, '메모는 최대 5000자까지 입력 가능합니다'),
  next_actions: z.string().max(2000, '다음 액션은 최대 2000자까지 입력 가능합니다').optional(),
  follow_up_date: z.string().nullable().optional(),
  status: z.enum(['open', 'done']).default('open'),
}).refine(
  (data) => {
    // At least one of learner_id or team_id must be provided
    return data.learner_id || data.team_id;
  },
  {
    message: '학습자 또는 팀을 선택해주세요',
    path: ['learner_id'],
  }
);

export type CoachingLogFormData = z.infer<typeof coachingLogSchema>;
