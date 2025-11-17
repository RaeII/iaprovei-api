import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';
import { PaginationMetaSchema, PaginationSchema } from '@/common/schemas/pagination.schema';

// Enum schemas matching the TypeORM enums
export const SenderSchema = z.enum(['user', 'ia']);
export const MessageTypeSchema = z.enum([
  'clarification_request',
  'clarification_response',
  'correction_suggestion',
  'correction_confirmation',
  'other',
]);

// Base AI assistance message schema - complete entity
export const AiAssistanceMessageSchema = z.object({
  id: z.number(),
  assistence_sessions_id: z.string(),
  sender: SenderSchema,
  message: z.string().min(1, 'Message is required'),
  message_type: MessageTypeSchema,
  created_at: z.date(),
});

// Basic AI assistance message schema - for listing messages
export const AiAssistanceMessageBasicSchema = AiAssistanceMessageSchema.pick({
  id: true,
  sender: true,
  message: true,
  message_type: true,
  created_at: true,
});

// Message content schema - for displaying message details
export const AiAssistanceMessageContentSchema = AiAssistanceMessageSchema.pick({
  id: true,
  sender: true,
  message: true,
  message_type: true,
  created_at: true,
});

// For creating AI assistance messages - excludes auto-generated fields
export const AiAssistanceMessageCreateSchema = AiAssistanceMessageSchema.omit({
  id: true,
  created_at: true,
  assistence_sessions_id: true,
}).extend({
  question_id: z.number(),
});

// For updating AI assistance messages - all fields optional except required ones
export const AiAssistanceMessageUpdateSchema = AiAssistanceMessageSchema.partial().omit({
  id: true,
  created_at: true,
});

// For AI assistance message filtering and search
export const AiAssistanceMessageFilterSchema = z.object({
  assistence_sessions_id: z.coerce.number().optional(),
  sender: SenderSchema.optional(),
  message_type: MessageTypeSchema.optional(),
});

// Query parameters schema for retrieve operations
export const AiAssistanceMessageQuerySchema = AiAssistanceMessageFilterSchema.merge(PaginationSchema).extend({
  sort_by: z.enum(['id', 'created_at', 'sender', 'message_type']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).default('DESC'),
});

// Detailed schema with relationships
const AiAssistanceMessageDetailSchema = AiAssistanceMessageSchema.extend({
  assistanceSession: z
    .object({
      id: z.number(),
      session_id: z.string(),
      question_id: z.number(),
      user_id: z.number(),
    })
    .optional(),
});

// List response schemas
export const AiAssistanceMessageListResponseSchema = z.object({
  data: z.array(AiAssistanceMessageBasicSchema),
  meta: PaginationMetaSchema,
});

export const AiAssistanceMessageDetailedListResponseSchema = z.object({
  data: z.array(AiAssistanceMessageSchema),
  meta: PaginationMetaSchema,
});

// Single AI assistance message response schema
export const AiAssistanceMessageDetailResponseSchema = z.object({
  data: AiAssistanceMessageDetailSchema,
});

export const AiAssistanceMessageCountResponseSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export const AiAssistanceMessageExistsResponseSchema = z.object({
  data: z.object({
    exists: z.boolean(),
  }),
});

// OpenAPI schemas
export const aiAssistanceMessageCreateOpenapi: any = zodToOpenAPI(AiAssistanceMessageCreateSchema);
export const aiAssistanceMessageUpdateOpenapi: any = zodToOpenAPI(AiAssistanceMessageUpdateSchema);
export const aiAssistanceMessageResponseOpenapi: any = zodToOpenAPI(AiAssistanceMessageSchema);
export const aiAssistanceMessageBasicOpenapi: any = zodToOpenAPI(AiAssistanceMessageBasicSchema);
export const aiAssistanceMessageFilterOpenapi: any = zodToOpenAPI(AiAssistanceMessageFilterSchema);
export const aiAssistanceMessageQueryOpenapi: any = zodToOpenAPI(AiAssistanceMessageQuerySchema);
export const aiAssistanceMessageListResponseOpenapi: any = zodToOpenAPI(AiAssistanceMessageListResponseSchema);
export const aiAssistanceMessageDetailedListResponseOpenapi: any = zodToOpenAPI(
  AiAssistanceMessageDetailedListResponseSchema
);
export const aiAssistanceMessageDetailResponseOpenapi: any = zodToOpenAPI(AiAssistanceMessageDetailResponseSchema);
export const aiAssistanceMessageExistsResponseOpenapi: any = zodToOpenAPI(AiAssistanceMessageExistsResponseSchema);
export const aiAssistanceMessageCountResponseOpenapi: any = zodToOpenAPI(AiAssistanceMessageCountResponseSchema);

// Type exports - inferred from Zod schemas
export type AiAssistanceMessage = z.infer<typeof AiAssistanceMessageSchema>;
export type AiAssistanceMessageBasic = z.infer<typeof AiAssistanceMessageBasicSchema>;
export type AiAssistanceMessageContent = z.infer<typeof AiAssistanceMessageContentSchema>;
export type AiAssistanceMessageCreate = z.infer<typeof AiAssistanceMessageCreateSchema>;
export type AiAssistanceMessageUpdate = z.infer<typeof AiAssistanceMessageUpdateSchema>;
export type AiAssistanceMessageFilter = z.infer<typeof AiAssistanceMessageFilterSchema>;
export type AiAssistanceMessageQuery = z.infer<typeof AiAssistanceMessageQuerySchema>;
export type AiAssistanceMessageDetail = z.infer<typeof AiAssistanceMessageDetailSchema>;
export type AiAssistanceMessageListResponse = z.infer<typeof AiAssistanceMessageListResponseSchema>;
export type AiAssistanceMessageDetailedListResponse = z.infer<typeof AiAssistanceMessageDetailedListResponseSchema>;
export type AiAssistanceMessageDetailResponse = z.infer<typeof AiAssistanceMessageDetailResponseSchema>;
export type AiAssistanceMessageCountResponse = z.infer<typeof AiAssistanceMessageCountResponseSchema>;
export type AiAssistanceMessageExistsResponse = z.infer<typeof AiAssistanceMessageExistsResponseSchema>;
