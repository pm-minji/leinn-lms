import { z } from 'zod';

export const coachFeedbackSchema = z.object({
  coach_feedback: z
    .string()
    .min(10, '피드백은 최소 10자 이상 입력해주세요')
    .max(5000, '피드백은 최대 5000자까지 입력 가능합니다'),
});

export type CoachFeedbackFormData = z.infer<typeof coachFeedbackSchema>;
