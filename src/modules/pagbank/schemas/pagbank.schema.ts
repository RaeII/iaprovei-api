import { zodToOpenAPI } from 'nestjs-zod';
import { z } from 'zod';

// Enums para os schemas
export const IntervalUnitSchema = z.enum(['DAY', 'MONTH', 'YEAR']);
export const PaymentMethodSchema = z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO']);
export const PlanStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

// Schema para a resposta de criação de aplicação OAuth2
export const PublicKeysSchema = z.object({
  public_key: z.string(),
  created_at: z.number(),
});

// Schema para o valor do plano
export const PlanAmountSchema = z.object({
  value: z.number().int().positive().max(999999999, 'Valor deve ter no máximo 9 caracteres'),
  currency: z.literal('BRL'),
});

// Schema para o intervalo de cobrança
export const PlanIntervalSchema = z.object({
  unit: IntervalUnitSchema,
  length: z.number().int().positive().default(1),
});

// Schema para o período de trial
export const PlanTrialSchema = z.object({
  days: z.number().int().min(0).optional(),
  enabled: z.boolean().default(false),
  hold_setup_fee: z.boolean().default(false),
});

// Schema para os links da resposta do PagBank
export const PlanLinkSchema = z.object({
  rel: z.string(),
  href: z.string().url(),
  media: z.string(),
  type: z.string(),
});

// Schema para o result_set de paginação
export const ResultSetSchema = z.object({
  total: z.number().int(),
  offset: z.number().int(),
  limit: z.number().int(),
});

// Schema para criar um plano
export const CreatePlanSchema = z.object({
  reference_id: z.string().min(1, 'Reference ID é obrigatório').max(65, 'Reference ID deve ter no máximo 65 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório').max(65, 'Nome deve ter no máximo 65 caracteres'),
  description: z.string().max(250, 'Descrição deve ter no máximo 250 caracteres').optional(),
  amount: PlanAmountSchema,
  setup_fee: z.number().int().min(0).max(999999999, 'Setup fee deve ter no máximo 9 caracteres').optional(),
  interval: PlanIntervalSchema.optional(),
  billing_cycles: z.number().int().min(0).optional(),
  trial: PlanTrialSchema.optional(),
  limit_subscriptions: z.number().int().min(0).optional(),
  payment_method: z.array(PaymentMethodSchema).optional(),
  editable: z.boolean().default(true),
});

// Schema para a resposta de criação de plano
export const PlanResponseSchema = z.object({
  id: z.string(),
  reference_id: z.string(),
  status: PlanStatusSchema,
  name: z.string(),
  description: z.string().optional(),
  amount: PlanAmountSchema,
  setup_fee: z.number().optional(),
  interval: PlanIntervalSchema.optional(),
  billing_cycles: z.number().optional(),
  trial: PlanTrialSchema.optional(),
  limit_subscriptions: z.number().optional(),
  payment_method: z.array(PaymentMethodSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  editable: z.boolean(),
  links: z.array(PlanLinkSchema),
});

// Schema para a resposta da listagem de planos
export const GetPlansDataSchema = z.object({
  result_set: ResultSetSchema,
  plans: z.array(PlanResponseSchema),
});

export const GetPlansResponseSchema = z.object({
  data: GetPlansDataSchema,
});

// OpenAPI schemas
export const publicKeysResponseSchema = z.object({
  data: PublicKeysSchema,
});

export const createPlanResponseSchema = z.object({
  data: PlanResponseSchema,
});

export const publicKeysResponseOpenapi: any = zodToOpenAPI(publicKeysResponseSchema);
export const createPlanOpenapi: any = zodToOpenAPI(CreatePlanSchema);
export const createPlanResponseOpenapi: any = zodToOpenAPI(createPlanResponseSchema);
export const getPlansResponseOpenapi: any = zodToOpenAPI(GetPlansResponseSchema);

// Type exports
export type PublicKeys = z.infer<typeof PublicKeysSchema>;
export type PublicKeysResponse = z.infer<typeof publicKeysResponseSchema>;
export type CreatePlan = z.infer<typeof CreatePlanSchema>;
export type PlanResponse = z.infer<typeof PlanResponseSchema>;
export type CreatePlanResponse = z.infer<typeof createPlanResponseSchema>;
export type ResultSet = z.infer<typeof ResultSetSchema>;
export type GetPlansData = z.infer<typeof GetPlansDataSchema>;
export type GetPlansResponse = z.infer<typeof GetPlansResponseSchema>;
export type PlanLink = z.infer<typeof PlanLinkSchema>;
export type PlanStatus = z.infer<typeof PlanStatusSchema>;
