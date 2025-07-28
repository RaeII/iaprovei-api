import { z } from 'zod';
import { PaginationMetaSchema, PaginationSchema } from '@/common/schemas/pagination.schema';

// Base AI assistance session schema - complete entity
export const AiAssistanceSessionSchema = z.object({
  id: z.string().uuid(),
  question_id: z.number(),
  user_id: z.number(),
  session_id: z.string().min(1, 'Session ID is required').max(36),
  created_at: z.date(),
});

// Basic AI assistance session schema - for listing sessions
export const AiAssistanceSessionBasicSchema = AiAssistanceSessionSchema.pick({
  id: true,
  question_id: true,
  user_id: true,
  session_id: true,
  created_at: true,
});

// For creating AI assistance sessions - excludes auto-generated fields
export const AiAssistanceSessionCreateSchema = AiAssistanceSessionSchema.omit({
  id: true,
  created_at: true,
});

// For updating AI assistance sessions - all fields optional except required ones
export const AiAssistanceSessionUpdateSchema = AiAssistanceSessionSchema.partial().omit({
  id: true,
  created_at: true,
});

// For AI assistance session filtering and search
export const AiAssistanceSessionFilterSchema = z.object({
  question_id: z.coerce.number().optional(),
  user_id: z.coerce.number().optional(),
  session_id: z.string().optional(),
});

// Query parameters schema for retrieve operations
export const AiAssistanceSessionQuerySchema = AiAssistanceSessionFilterSchema.merge(PaginationSchema).extend({
  sort_by: z.enum(['id', 'created_at', 'question_id', 'user_id']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).default('DESC'),
});

// Detailed schema with relationships
const AiAssistanceSessionDetailSchema = AiAssistanceSessionSchema.extend({
  question: z
    .object({
      id: z.number(),
      affirmation: z.string(),
      question_type: z.string(),
      difficulty_level: z.string(),
    })
    .optional(),
  user: z
    .object({
      id: z.number(),
      username: z.string(),
    })
    .optional(),
});

// List response schemas
export const AiAssistanceSessionListResponseSchema = z.object({
  data: z.array(AiAssistanceSessionBasicSchema),
  meta: PaginationMetaSchema,
});

export const AiAssistanceSessionDetailedListResponseSchema = z.object({
  data: z.array(AiAssistanceSessionSchema),
  meta: PaginationMetaSchema,
});

// Single AI assistance session response schema
export const AiAssistanceSessionDetailResponseSchema = z.object({
  data: AiAssistanceSessionDetailSchema,
});

export const AiAssistanceSessionCountResponseSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export const AiAssistanceSessionExistsResponseSchema = z.object({
  data: z.object({
    exists: z.boolean(),
  }),
});

// Type exports - inferred from Zod schemas
export type AiAssistanceSession = z.infer<typeof AiAssistanceSessionSchema>;
export type AiAssistanceSessionBasic = z.infer<typeof AiAssistanceSessionBasicSchema>;
export type AiAssistanceSessionCreate = z.infer<typeof AiAssistanceSessionCreateSchema>;
// export type AiAssistanceSessionUpdate = z.infer<typeof AiAssistanceSessionUpdateSchema>;
// export type AiAssistanceSessionFilter = z.infer<typeof AiAssistanceSessionFilterSchema>;
// export type AiAssistanceSessionQuery = z.infer<typeof AiAssistanceSessionQuerySchema>;
// export type AiAssistanceSessionDetail = z.infer<typeof AiAssistanceSessionDetailSchema>;
// export type AiAssistanceSessionListResponse = z.infer<typeof AiAssistanceSessionListResponseSchema>;
// export type AiAssistanceSessionDetailedListResponse = z.infer<typeof AiAssistanceSessionDetailedListResponseSchema>;
// export type AiAssistanceSessionDetailResponse = z.infer<typeof AiAssistanceSessionDetailResponseSchema>;
// export type AiAssistanceSessionCountResponse = z.infer<typeof AiAssistanceSessionCountResponseSchema>;
// export type AiAssistanceSessionExistsResponse = z.infer<typeof AiAssistanceSessionExistsResponseSchema>;
