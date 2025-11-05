import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';
import { PaginationMetaSchema } from '@/common/schemas/pagination.schema';

// Enum schema matching the TypeORM enum
export const UserPlanStatusSchema = z.enum(['active', 'inactive', 'cancelled']);

// Base user plan schema - complete user plan entity
export const UserPlanSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  plan_id: z.number(),
  status: UserPlanStatusSchema.nullable(),
  pagbank_subscriber_id: z.string().nullable(),
  pagbank_customer_id: z.string().nullable(),
  trial_start_at: z.date().nullable(),
  trial_end_at: z.date().nullable(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Schema for listing user plans with basic info
export const UserPlanListDataSchema = UserPlanSchema;

// Schema for detailed user plan view (same as base for now)
export const UserPlanDetailSchema = UserPlanSchema;

// For creating user plans - excludes auto-generated fields
export const UserPlanCreateSchema = UserPlanSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// For updating user plans - all fields optional except required ones
export const UserPlanUpdateSchema = UserPlanSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
  user_id: true, // Don't allow changing user_id after creation
});

// Response schemas
export const UserPlanListResponseSchema = z.object({
  data: z.array(UserPlanListDataSchema),
  meta: PaginationMetaSchema,
});

export const UserPlanDetailResponseSchema = z.object({
  data: UserPlanDetailSchema,
});

export const UserPlanCreateResponseSchema = z.object({
  data: UserPlanDetailSchema,
});

export const UserPlanUpdateResponseSchema = z.object({
  data: UserPlanDetailSchema,
});

// Query schemas for filtering and searching
export const UserPlanQuerySchema = z.object({
  user_id: z.coerce.number().optional(),
  plan_id: z.coerce.number().optional(),
  status: UserPlanStatusSchema.optional(),
  pagbank_subscriber_id: z.string().optional(),
  pagbank_customer_id: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
});

// OpenAPI schemas
export const userPlanListResponseOpenapi: any = zodToOpenAPI(UserPlanListResponseSchema);
export const userPlanDetailResponseOpenapi: any = zodToOpenAPI(UserPlanDetailResponseSchema);
export const userPlanCreateOpenapi: any = zodToOpenAPI(UserPlanCreateSchema);
export const userPlanUpdateOpenapi: any = zodToOpenAPI(UserPlanUpdateSchema);
export const userPlanCreateResponseOpenapi: any = zodToOpenAPI(UserPlanCreateResponseSchema);
export const userPlanUpdateResponseOpenapi: any = zodToOpenAPI(UserPlanUpdateResponseSchema);
export const userPlanQueryOpenapi: any = zodToOpenAPI(UserPlanQuerySchema);

// Type exports - inferred from Zod schemas
export type UserPlan = z.infer<typeof UserPlanSchema>;
export type UserPlanListData = z.infer<typeof UserPlanListDataSchema>;
export type UserPlanDetail = z.infer<typeof UserPlanDetailSchema>;
export type UserPlanCreate = z.infer<typeof UserPlanCreateSchema>;
export type UserPlanUpdate = z.infer<typeof UserPlanUpdateSchema>;
export type UserPlanListResponse = z.infer<typeof UserPlanListResponseSchema>;
export type UserPlanDetailResponse = z.infer<typeof UserPlanDetailResponseSchema>;
export type UserPlanCreateResponse = z.infer<typeof UserPlanCreateResponseSchema>;
export type UserPlanUpdateResponse = z.infer<typeof UserPlanUpdateResponseSchema>;
export type UserPlanQuery = z.infer<typeof UserPlanQuerySchema>;
export type UserPlanStatus = z.infer<typeof UserPlanStatusSchema>;
