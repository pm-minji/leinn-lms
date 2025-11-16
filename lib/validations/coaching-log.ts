import { z } from 'zod';

export const coachingLogSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  session_date: z.string().min(1, '세션 날짜를 선택해주세요'),
  learner_name: z.string().optional(), // 학습자 이름 (선택사항)
  team_name: z.string().optional(),    // 팀 이름 (선택사항)
  notes: z
    .string()
    .min(10, '메모는 최소 10자 이상 입력해주세요')
    .max(5000, '메모는 최대 5000자까지 입력 가능합니다'),
  next_actions: z.string().max(2000, '다음 액션은 최대 2000자까지 입력 가능합니다').optional(),
  follow_up_date: z.string().nullable().optional(),
  status: z.enum(['open', 'done']).default('open'),
  // session_type은 서버에서 자동으로 '1:1'로 설정됨
});

export type CoachingLogFormData = z.input<typeof coachingLogSchema>;
