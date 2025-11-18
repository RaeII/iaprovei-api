import { zodToOpenAPI } from 'nestjs-zod';
import { z } from 'zod';
import { UserPlanStatusSchema } from '@/modules/user_plans/schemas/user_plan.schema';

// Enums para os schemas
export const IntervalUnitSchema = z.enum(['DAY', 'MONTH', 'YEAR']);
export const PaymentMethodSchema = z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO']);
export const PlanStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const BillingTypeSchema = z.enum(['CREDIT_CARD', 'DEBIT_CARD']);

// Schema para configuração de notificações
export const NotificationToggleSchema = z.object({
  enabled: z.boolean().optional(),
});

export const NotificationEmailSchema = z.object({
  merchant: NotificationToggleSchema.optional(),
  customer: NotificationToggleSchema.optional(),
});

export const UpdateNotificationsSchema = z.object({
  email: NotificationEmailSchema.optional(),
  url: z.string().optional(),
});

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
  reference_id: z
    .string()
    .min(1, 'Reference ID é obrigatório')
    .max(65, 'Reference ID deve ter no máximo 65 caracteres'),
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

// Schema para telefone do customer
export const CustomerPhoneSchema = z.object({
  country: z.string().min(1, 'Código do país é obrigatório'),
  area: z.string().min(1, 'Código de área é obrigatório'),
  number: z.string().min(1, 'Número do telefone é obrigatório'),
});

// Schema para endereço do customer
export const CustomerAddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  locality: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  region_code: z.string().min(2, 'Código da região é obrigatório').max(2, 'Código da região deve ter 2 caracteres'),
  postal_code: z.string().min(1, 'CEP é obrigatório'),
  country: z.string().min(3, 'Código do país é obrigatório').max(3, 'Código do país deve ter 3 caracteres'),
});

// Schema para cartão criptografado
export const CustomerCardSchema = z.object({
  encrypted: z.string().min(1, 'Dados criptografados do cartão são obrigatórios'),
});

// Schema para cartão criptografado com código de segurança (para atualização)
export const UpdateCustomerCardSchema = z.object({
  encrypted: z.string().min(1, 'Dados criptografados do cartão são obrigatórios'),
  security_code: z.number().int().min(100).max(9999, 'Código de segurança deve ter entre 3 e 4 dígitos'),
});

// Schema para informações de cobrança
export const CustomerBillingInfoSchema = z.object({
  card: CustomerCardSchema,
  type: BillingTypeSchema,
});

// Schema para atualização de informações de cobrança
export const UpdateCustomerBillingInfoSchema = z.object({
  card: UpdateCustomerCardSchema,
  type: BillingTypeSchema,
});

// Schema para criar um customer
export const CreateCustomerSchema = z.object({
  id: z.string().optional().nullable(),
  phones: z.array(CustomerPhoneSchema).min(1, 'Pelo menos um telefone é obrigatório'),
  address: CustomerAddressSchema.optional().nullable(),
  billing_info: z.array(CustomerBillingInfoSchema).min(1, 'Pelo menos uma informação de cobrança é obrigatória'),
  reference_id: z
    .string()
    .min(1, 'Reference ID é obrigatório')
    .max(65, 'Reference ID deve ter no máximo 65 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email deve ter um formato válido').max(100, 'Email deve ter no máximo 100 caracteres'),
  tax_id: z.string().min(11, 'CPF deve ter pelo menos 11 caracteres').max(14, 'CPF deve ter no máximo 14 caracteres'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD'),
});

// Schema para o plano na subscription
export const SubscriptionPlanSchema = z.object({
  id: z.string().min(1, 'ID do plano é obrigatório'),
});

// Schema para o cartão de pagamento na subscription
export const SubscriptionPaymentCardSchema = z.object({
  security_code: z.number().int().min(100).max(9999, 'Código de segurança deve ter entre 3 e 4 dígitos'),
});

// Schema para o método de pagamento na subscription
export const SubscriptionPaymentMethodSchema = z.object({
  type: PaymentMethodSchema,
  card: SubscriptionPaymentCardSchema,
});

// Schema para criar uma subscription
export const CreateSubscriptionSchema = z.object({
  plan: SubscriptionPlanSchema,
  customer: CreateCustomerSchema.optional().nullable(),
  payment_method: z.array(SubscriptionPaymentMethodSchema).min(1, 'Pelo menos um método de pagamento é obrigatório'),
  reference_id: z
    .string()
    .min(1, 'Reference ID é obrigatório')
    .max(65, 'Reference ID deve ter no máximo 65 caracteres'),
  recaptcha_token: z.string().optional(),
});

// Schema para a resposta de criação de customer
export const CustomerResponseSchema = z.object({
  id: z.string(),
  reference_id: z.string(),
  name: z.string(),
  email: z.string(),
  tax_id: z.string(),
  birth_date: z.string(),
  phones: z.array(CustomerPhoneSchema),
  address: CustomerAddressSchema.optional().nullable(),
  billing_info: z.array(CustomerBillingInfoSchema),
  created_at: z.string(),
  updated_at: z.string(),
  links: z.array(PlanLinkSchema),
});

// OpenAPI schemas
export const publicKeysResponseSchema = z.object({
  data: PublicKeysSchema,
});

export const createPlanResponseSchema = z.object({
  data: PlanResponseSchema,
});

export const createCustomerResponseSchema = z.object({
  data: CustomerResponseSchema,
});

// Schema para trial na subscription
export const SubscriptionTrialSchema = z.object({
  start_at: z.string(),
  end_at: z.string(),
});

// Schema para billing cycle na subscription
export const SubscriptionBillingCycleSchema = z.object({
  occurrence: z.number(),
});

// Schema para o plano completo na resposta da subscription
export const SubscriptionPlanResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  interval: z.object({
    length: z.number(),
    unit: z.string(),
  }),
});

// Schema para o cartão na resposta da subscription
export const SubscriptionCardResponseSchema = z.object({
  id: z.string().optional(),
  brand: z.string().optional(),
  first_digits: z.string().optional(),
  last_digits: z.string().optional(),
  exp_month: z.string().optional(),
  exp_year: z.string().optional(),
  holder: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
});

// Schema para método de pagamento na resposta da subscription
export const SubscriptionPaymentMethodResponseSchema = z.object({
  type: z.string(),
  card: SubscriptionCardResponseSchema,
});

// Schema para customer na resposta da subscription
export const SubscriptionCustomerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  address: CustomerAddressSchema.optional().nullable(),
});

// Schema para a resposta de criação de subscription
export const SubscriptionResponseSchema = z.object({
  id: z.string(),
  reference_id: z.string(),
  amount: PlanAmountSchema,
  status: UserPlanStatusSchema,
  trial: SubscriptionTrialSchema.optional(),
  plan: SubscriptionPlanResponseSchema,
  payment_method: z.array(SubscriptionPaymentMethodResponseSchema),
  next_invoice_at: z.string(),
  billing_cycle: SubscriptionBillingCycleSchema,
  pro_rata: z.boolean(),
  customer: SubscriptionCustomerResponseSchema,
  created_at: z.string(),
  updated_at: z.string(),
  split_enabled: z.boolean(),
  links: z.array(PlanLinkSchema),
});

export const createSubscriptionResponseSchema = z.object({
  data: SubscriptionResponseSchema,
});

// Schema para filtros de busca de subscriptions
export const SubscriptionStatusFilterSchema = z.enum([
  'ACTIVE',
  'EXPIRED',
  'CANCELED',
  'SUSPENDED',
  'OVERDUE',
  'TRIAL',
  'PENDING',
  'PENDING_ACTION',
]);

export const PaymentMethodTypeFilterSchema = z.enum(['BOLETO', 'CREDIT_CARD']);

export const GetSubscriptionsQuerySchema = z.object({
  reference_id: z.string().optional(),
  status: z.array(SubscriptionStatusFilterSchema).optional(),
  payment_method_type: z.array(PaymentMethodTypeFilterSchema).optional(),
  created_at_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use YYYY-MM-DD').optional(),
  created_at_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use YYYY-MM-DD').optional(),
});

// Schema para a resposta da listagem de subscriptions
export const GetSubscriptionsDataSchema = z.object({
  result_set: ResultSetSchema,
  subscriptions: z.array(SubscriptionResponseSchema),
});

export const GetSubscriptionsResponseSchema = z.object({
  data: GetSubscriptionsDataSchema,
});

export const publicKeysResponseOpenapi: any = zodToOpenAPI(publicKeysResponseSchema);
export const createPlanOpenapi: any = zodToOpenAPI(CreatePlanSchema);
export const createPlanResponseOpenapi: any = zodToOpenAPI(createPlanResponseSchema);
export const getPlansResponseOpenapi: any = zodToOpenAPI(GetPlansResponseSchema);
export const createCustomerOpenapi: any = zodToOpenAPI(CreateCustomerSchema);
export const createCustomerResponseOpenapi: any = zodToOpenAPI(createCustomerResponseSchema);
export const createSubscriptionOpenapi: any = zodToOpenAPI(CreateSubscriptionSchema);
export const createSubscriptionResponseOpenapi: any = zodToOpenAPI(createSubscriptionResponseSchema);
export const updateNotificationsOpenapi: any = zodToOpenAPI(UpdateNotificationsSchema);
export const getSubscriptionsQueryOpenapi: any = zodToOpenAPI(GetSubscriptionsQuerySchema);
export const getSubscriptionsResponseOpenapi: any = zodToOpenAPI(GetSubscriptionsResponseSchema);

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
export type CustomerPhone = z.infer<typeof CustomerPhoneSchema>;
export type CustomerAddress = z.infer<typeof CustomerAddressSchema>;
export type CustomerCard = z.infer<typeof CustomerCardSchema>;
export type UpdateCustomerCard = z.infer<typeof UpdateCustomerCardSchema>;
export type CustomerBillingInfo = z.infer<typeof CustomerBillingInfoSchema>;
export type UpdateCustomerBillingInfo = z.infer<typeof UpdateCustomerBillingInfoSchema>;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;
export type CustomerResponse = z.infer<typeof CustomerResponseSchema>;
export type CreateCustomerResponse = z.infer<typeof createCustomerResponseSchema>;
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export type SubscriptionPaymentCard = z.infer<typeof SubscriptionPaymentCardSchema>;
export type SubscriptionPaymentMethod = z.infer<typeof SubscriptionPaymentMethodSchema>;
export type CreateSubscription = z.infer<typeof CreateSubscriptionSchema>;
export type SubscriptionTrial = z.infer<typeof SubscriptionTrialSchema>;
export type SubscriptionBillingCycle = z.infer<typeof SubscriptionBillingCycleSchema>;
export type SubscriptionPlanResponse = z.infer<typeof SubscriptionPlanResponseSchema>;
export type SubscriptionCardResponse = z.infer<typeof SubscriptionCardResponseSchema>;
export type SubscriptionPaymentMethodResponse = z.infer<typeof SubscriptionPaymentMethodResponseSchema>;
export type SubscriptionCustomerResponse = z.infer<typeof SubscriptionCustomerResponseSchema>;
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
export type CreateSubscriptionResponse = z.infer<typeof createSubscriptionResponseSchema>;
export type UpdateNotifications = z.infer<typeof UpdateNotificationsSchema>;
export type SubscriptionStatusFilter = z.infer<typeof SubscriptionStatusFilterSchema>;
export type PaymentMethodTypeFilter = z.infer<typeof PaymentMethodTypeFilterSchema>;
export type GetSubscriptionsQuery = z.infer<typeof GetSubscriptionsQuerySchema>;
export type GetSubscriptionsData = z.infer<typeof GetSubscriptionsDataSchema>;
export type GetSubscriptionsResponse = z.infer<typeof GetSubscriptionsResponseSchema>;
