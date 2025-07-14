import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';
import { PaginationMetaSchema, PaginationSchema } from '@/domain/shared/schemas/pagination.schema';

// Base question option schema - complete question option entity
export const QuestionOptionSchema = z.object({
  id: z.number(),
  question_id: z.number(),
  option_text: z.string().min(1, 'Option text is required'),
  option_letter: z.string().length(1).optional(),
  is_correct: z.boolean().default(false),
  display_order: z.number().default(0),
  created_at: z.date(),
});

// Question option basic info schema - for listing options
export const QuestionOptionBasicSchema = QuestionOptionSchema.pick({
  id: true,
  question_id: true,
  option_text: true,
  option_letter: true,
  is_correct: true,
  display_order: true,
});

// For creating question options - excludes auto-generated fields
export const QuestionOptionCreateSchema = QuestionOptionSchema.omit({
  id: true,
  created_at: true,
});

// For updating question options - all fields optional except required ones
export const QuestionOptionUpdateSchema = QuestionOptionSchema.partial().omit({
  id: true,
  created_at: true,
});

// For question option filtering and search
export const QuestionOptionFilterSchema = z.object({
  question_id: z.coerce.number().optional(),
  is_correct: z.coerce.boolean().optional(),
  option_letter: z.string().length(1).optional(),
});

// Query parameters schema for retrieve operations
export const QuestionOptionQuerySchema = QuestionOptionFilterSchema.merge(PaginationSchema).extend({
  sort_by: z.enum(['id', 'display_order', 'option_letter', 'created_at']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).default('ASC'),
});

// List response schemas for different question option views
export const QuestionOptionListResponseSchema = z.object({
  data: z.array(QuestionOptionBasicSchema),
  meta: PaginationMetaSchema,
});

export const QuestionOptionDetailedListResponseSchema = z.object({
  data: z.array(QuestionOptionSchema),
  meta: PaginationMetaSchema,
});

// Single question option response schema
export const QuestionOptionDetailResponseSchema = z.object({
  data: QuestionOptionSchema,
});

export const QuestionOptionCountResponseSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export const QuestionOptionExistsResponseSchema = z.object({
  data: z.object({
    exists: z.boolean(),
  }),
});

// OpenAPI schemas
export const questionOptionCreateOpenapi: any = zodToOpenAPI(QuestionOptionCreateSchema);
export const questionOptionUpdateOpenapi: any = zodToOpenAPI(QuestionOptionUpdateSchema);
export const questionOptionResponseOpenapi: any = zodToOpenAPI(QuestionOptionSchema);
export const questionOptionBasicOpenapi: any = zodToOpenAPI(QuestionOptionBasicSchema);
export const questionOptionFilterOpenapi: any = zodToOpenAPI(QuestionOptionFilterSchema);
export const questionOptionQueryOpenapi: any = zodToOpenAPI(QuestionOptionQuerySchema);
export const questionOptionListResponseOpenapi: any = zodToOpenAPI(QuestionOptionListResponseSchema);
export const questionOptionDetailedListResponseOpenapi: any = zodToOpenAPI(QuestionOptionDetailedListResponseSchema);
export const questionOptionDetailResponseOpenapi: any = zodToOpenAPI(QuestionOptionDetailResponseSchema);
export const questionOptionExistsResponseOpenapi: any = zodToOpenAPI(QuestionOptionExistsResponseSchema);
export const questionOptionCountResponseOpenapi: any = zodToOpenAPI(QuestionOptionCountResponseSchema);

// Type exports - inferred from Zod schemas
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type QuestionOptionBasic = z.infer<typeof QuestionOptionBasicSchema>;
export type QuestionOptionCreate = z.infer<typeof QuestionOptionCreateSchema>;
export type QuestionOptionUpdate = z.infer<typeof QuestionOptionUpdateSchema>;
export type QuestionOptionFilter = z.infer<typeof QuestionOptionFilterSchema>;
export type QuestionOptionQuery = z.infer<typeof QuestionOptionQuerySchema>;
export type QuestionOptionListResponse = z.infer<typeof QuestionOptionListResponseSchema>;
export type QuestionOptionDetailedListResponse = z.infer<typeof QuestionOptionDetailedListResponseSchema>;
export type QuestionOptionDetailResponse = z.infer<typeof QuestionOptionDetailResponseSchema>;
export type QuestionOptionCountResponse = z.infer<typeof QuestionOptionCountResponseSchema>;
export type QuestionOptionExistsResponse = z.infer<typeof QuestionOptionExistsResponseSchema>;
