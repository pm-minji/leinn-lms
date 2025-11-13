import { z } from 'zod';

export const promptSchema = z.object({
  name: z
    .string()
    .min(1, '프롬프트 이름을 입력해주세요')
    .max(100, '프롬프트 이름은 100자 이내로 입력해주세요'),
  description: z
    .string()
    .min(1, '프롬프트 설명을 입력해주세요')
    .max(500, '프롬프트 설명은 500자 이내로 입력해주세요'),
  content: z
    .string()
    .min(10, '프롬프트 내용은 최소 10자 이상이어야 합니다')
    .max(10000, '프롬프트 내용은 10000자 이내로 입력해주세요'),
  version: z.string().optional(),
});

export const promptUpdateSchema = promptSchema.partial();

export type PromptInput = z.infer<typeof promptSchema>;
export type PromptUpdateInput = z.infer<typeof promptUpdateSchema>;
