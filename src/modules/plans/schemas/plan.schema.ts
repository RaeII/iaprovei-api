import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';

// Base plan schema - entidade completa
export const PlanSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nome do plano é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser um valor positivo'),
  duration_in_days: z.number().int().positive('Duração deve ser um número inteiro positivo'),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

// Schema para listagem de planos
export const PlanListDataSchema = PlanSchema;

// Schema para detalhes de um plano específico
export const PlanDetailSchema = PlanSchema;

// Schema para planos ativos (apenas campos essenciais)
export const PlanActiveSchema = PlanSchema.pick({
  id: true,
  name: true,
  description: true,
  price: true,
  duration_in_days: true,
});

// Schema para criar planos - exclui campos auto-gerados
export const PlanCreateSchema = PlanSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema para atualizar planos - todos os campos opcionais
export const PlanUpdateSchema = PlanSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schemas de resposta para API
export const PlanListResponseSchema = z.object({
  data: z.array(PlanListDataSchema),
});

export const PlanDetailResponseSchema = z.object({
  data: PlanDetailSchema,
});

// OpenAPI schemas
export const planListResponseOpenapi: any = zodToOpenAPI(PlanListResponseSchema);
export const planDetailResponseOpenapi: any = zodToOpenAPI(PlanDetailResponseSchema);
export const planCreateOpenapi: any = zodToOpenAPI(PlanCreateSchema);
export const planUpdateOpenapi: any = zodToOpenAPI(PlanUpdateSchema);

// Type exports - inferidos dos schemas Zod
export type Plan = z.infer<typeof PlanSchema>;
export type PlanListData = z.infer<typeof PlanListDataSchema>;
export type PlanDetail = z.infer<typeof PlanDetailSchema>;
export type PlanActive = z.infer<typeof PlanActiveSchema>;
export type PlanCreate = z.infer<typeof PlanCreateSchema>;
export type PlanUpdate = z.infer<typeof PlanUpdateSchema>;
export type PlanListResponse = z.infer<typeof PlanListResponseSchema>;
export type PlanDetailResponse = z.infer<typeof PlanDetailResponseSchema>;
