import { z } from 'zod';

export const teamSchema = z.object({
  name: z.string().min(1, '팀 이름을 입력해주세요').max(100, '팀 이름은 최대 100자까지 입력 가능합니다'),
  active: z.boolean().default(true),
});

export type TeamFormData = z.infer<typeof teamSchema>;
