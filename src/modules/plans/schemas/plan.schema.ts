import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';

// Base plan schema - entidade completa
export const PlanSchema = z.object({
  id: z.number(),
  id_pagbank: z.string(),
  title: z.string(),
  description: z.string(),
  description_topics: z.string().optional(),
  price: z.number(),
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
  title: true,
  description: true,
  description_topics: true,
  price: true,
  is_active: true,
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
