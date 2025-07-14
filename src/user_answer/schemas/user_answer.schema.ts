import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';
import { PaginationMetaSchema, PaginationSchema } from '@/domain/shared/schemas/pagination.schema';

// Base user answer schema - complete user answer entity (for internal use only)
export const UserAnswerSchema = z.object({
  id: z.number(),
  users_id: z.number(),
  question_id: z.number(),
  option_id: z.number(),
  is_correct: z.boolean(),
  response_time: z.number().min(0).default(0),
  session_id: z.string().min(1, 'Session ID is required').max(36),
  used_hint: z.boolean().default(false),
  confidence_level: z.number().min(0).max(9.99).default(0),
  difficulty_at_time: z.number().min(0).max(9.99).default(0),
  answared_at: z.date(),
});

// User answer basic schema - for listing user answers (excludes session_id)
export const UserAnswerBasicSchema = UserAnswerSchema.pick({
  id: true,
  users_id: true,
  question_id: true,
  option_id: true,
  is_correct: true,
  answared_at: true,
});

// User answer performance schema - for analytics (excludes session_id)
export const UserAnswerPerformanceSchema = UserAnswerSchema.pick({
  id: true,
  users_id: true,
  question_id: true,
  is_correct: true,
  response_time: true,
  confidence_level: true,
  difficulty_at_time: true,
  used_hint: true,
});

// User answer session schema - for session tracking (excludes session_id from response)
export const UserAnswerSessionSchema = UserAnswerSchema.pick({
  id: true,
  users_id: true,
  is_correct: true,
  response_time: true,
  answared_at: true,
});

// For creating user answers - excludes auto-generated and system-determined fields, including session_id
export const UserAnswerCreateSchema = UserAnswerSchema.omit({
  id: true,
  is_correct: true, // System determines this based on chosen option
  answared_at: true,
  session_id: true, // System generates this from JWT - cannot be sent by frontend
});

// For updating user answers - all fields optional except required ones (excludes session_id)
export const UserAnswerUpdateSchema = UserAnswerSchema.partial().omit({
  id: true,
  answared_at: true,
  session_id: true, // Session ID cannot be updated
});

// For user answer filtering and search (session_id only available for internal queries)
export const UserAnswerFilterSchema = z.object({
  users_id: z.coerce.number().optional(),
  question_id: z.coerce.number().optional(),
  option_id: z.coerce.number().optional(),
  is_correct: z.coerce.boolean().optional(),
  used_hint: z.coerce.boolean().optional(),
  confidence_level_min: z.coerce.number().min(0).max(9.99).optional(),
  confidence_level_max: z.coerce.number().min(0).max(9.99).optional(),
  difficulty_at_time_min: z.coerce.number().min(0).max(9.99).optional(),
  difficulty_at_time_max: z.coerce.number().min(0).max(9.99).optional(),
  answered_after: z.coerce.date().optional(),
  answered_before: z.coerce.date().optional(),
});

// Internal filter schema that includes session_id for internal service operations
export const UserAnswerInternalFilterSchema = UserAnswerFilterSchema.extend({
  session_id: z.string().optional(),
});

// Query parameters schema for retrieve operations (excludes session_id)
export const UserAnswerQuerySchema = UserAnswerFilterSchema.merge(PaginationSchema).extend({
  sort_by: z.enum(['id', 'answared_at', 'response_time', 'confidence_level', 'difficulty_at_time']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).default('DESC'),
});

// User answer with relationships schema (excludes session_id)
const UserAnswerDetailSchema = UserAnswerSchema.omit({ session_id: true }).extend({
  user: z
    .object({
      id: z.number(),
      username: z.string(),
      full_name: z.string(),
    })
    .optional(),
  question: z
    .object({
      id: z.number(),
      affirmation: z.string(),
      difficulty_level: z.string(),
    })
    .optional(),
  option: z
    .object({
      id: z.number(),
      option_text: z.string(),
      option_letter: z.string(),
    })
    .optional(),
});

// List response schemas for different user answer views (all exclude session_id)
export const UserAnswerListResponseSchema = z.object({
  data: z.array(UserAnswerBasicSchema),
  meta: PaginationMetaSchema,
});

export const UserAnswerDetailedListResponseSchema = z.object({
  data: z.array(UserAnswerSchema.omit({ session_id: true })),
  meta: PaginationMetaSchema,
});

export const UserAnswerPerformanceListResponseSchema = z.object({
  data: z.array(UserAnswerPerformanceSchema),
  meta: PaginationMetaSchema,
});

export const UserAnswerSessionListResponseSchema = z.object({
  data: z.array(UserAnswerSessionSchema),
  meta: PaginationMetaSchema,
});

// Single user answer response schema (excludes session_id)
export const UserAnswerDetailResponseSchema = z.object({
  data: UserAnswerDetailSchema,
});

// User answer create response schema - includes correctness validation and correct answers (excludes session_id)
export const UserAnswerCreateResponseSchema = z.object({
  data: z.object({
    user_answer: UserAnswerSchema.omit({ session_id: true }),
    is_correct: z.boolean(),
    correct_options: z.array(
      z.object({
        id: z.number(),
        option_text: z.string(),
        option_letter: z.string().optional(),
      })
    ),
  }),
});

export const UserAnswerCountResponseSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export const UserAnswerStatsResponseSchema = z.object({
  data: z.object({
    total_answers: z.number(),
    correct_answers: z.number(),
    incorrect_answers: z.number(),
    success_rate: z.number(),
    average_response_time: z.number(),
    average_confidence_level: z.number(),
  }),
});

// OpenAPI schemas
export const userAnswerCreateOpenapi: any = zodToOpenAPI(UserAnswerCreateSchema);
export const userAnswerUpdateOpenapi: any = zodToOpenAPI(UserAnswerUpdateSchema);
export const userAnswerResponseOpenapi: any = zodToOpenAPI(UserAnswerSchema.omit({ session_id: true }));
export const userAnswerBasicOpenapi: any = zodToOpenAPI(UserAnswerBasicSchema);
export const userAnswerPerformanceOpenapi: any = zodToOpenAPI(UserAnswerPerformanceSchema);
export const userAnswerFilterOpenapi: any = zodToOpenAPI(UserAnswerFilterSchema);
export const userAnswerQueryOpenapi: any = zodToOpenAPI(UserAnswerQuerySchema);
export const userAnswerListResponseOpenapi: any = zodToOpenAPI(UserAnswerListResponseSchema);
export const userAnswerDetailedListResponseOpenapi: any = zodToOpenAPI(UserAnswerDetailedListResponseSchema);
export const userAnswerPerformanceListResponseOpenapi: any = zodToOpenAPI(UserAnswerPerformanceListResponseSchema);
export const userAnswerSessionListResponseOpenapi: any = zodToOpenAPI(UserAnswerSessionListResponseSchema);
export const userAnswerDetailResponseOpenapi: any = zodToOpenAPI(UserAnswerDetailResponseSchema);
export const userAnswerCreateResponseOpenapi: any = zodToOpenAPI(UserAnswerCreateResponseSchema);
export const userAnswerCountResponseOpenapi: any = zodToOpenAPI(UserAnswerCountResponseSchema);
export const userAnswerStatsResponseOpenapi: any = zodToOpenAPI(UserAnswerStatsResponseSchema);

// Type exports - inferred from Zod schemas
export type UserAnswer = z.infer<typeof UserAnswerSchema>;
export type UserAnswerBasic = z.infer<typeof UserAnswerBasicSchema>;
export type UserAnswerPerformance = z.infer<typeof UserAnswerPerformanceSchema>;
export type UserAnswerSession = z.infer<typeof UserAnswerSessionSchema>;
export type UserAnswerCreate = z.infer<typeof UserAnswerCreateSchema>;
export type UserAnswerUpdate = z.infer<typeof UserAnswerUpdateSchema>;
export type UserAnswerFilter = z.infer<typeof UserAnswerFilterSchema>;
export type UserAnswerInternalFilter = z.infer<typeof UserAnswerInternalFilterSchema>;
export type UserAnswerQuery = z.infer<typeof UserAnswerQuerySchema>;
export type UserAnswerDetail = z.infer<typeof UserAnswerDetailSchema>;
export type UserAnswerListResponse = z.infer<typeof UserAnswerListResponseSchema>;
export type UserAnswerDetailedListResponse = z.infer<typeof UserAnswerDetailedListResponseSchema>;
export type UserAnswerPerformanceListResponse = z.infer<typeof UserAnswerPerformanceListResponseSchema>;
export type UserAnswerSessionListResponse = z.infer<typeof UserAnswerSessionListResponseSchema>;
export type UserAnswerDetailResponse = z.infer<typeof UserAnswerDetailResponseSchema>;
export type UserAnswerCreateResponse = z.infer<typeof UserAnswerCreateResponseSchema>;
export type UserAnswerCountResponse = z.infer<typeof UserAnswerCountResponseSchema>;
export type UserAnswerStatsResponse = z.infer<typeof UserAnswerStatsResponseSchema>;
