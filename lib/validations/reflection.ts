import { z } from 'zod';

export const reflectionSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z
    .string()
    .min(100, '리플렉션 내용은 최소 100자 이상이어야 합니다')
    .max(10000, '리플렉션 내용은 최대 10000자까지 입력 가능합니다'),
  week_start: z.string().min(1, '주차 시작일을 선택해주세요'),
});

export type ReflectionFormData = z.infer<typeof reflectionSchema>;
