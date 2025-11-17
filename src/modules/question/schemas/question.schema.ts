import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';
import { PaginationMetaSchema, PaginationSchema } from '@/common/schemas/pagination.schema';
import { ContestIdentitySchema } from '@/modules/contest/schemas/contest.schema';
import { QuestionOptionBasicSchema } from '@/modules/question_option/schemas/question_option.schema';

// Enum schemas matching the TypeORM enums
export const QuestionTypeSchema = z.enum(['multiple_choice', 'true_false', 'essay']);
export const QuestionTypeEnumOpenapi: any = zodToOpenAPI(QuestionTypeSchema);
export const DifficultyLevelSchema = z.enum(['easy', 'medium', 'hard']);
export const DifficultyLevelEnumOpenapi: any = zodToOpenAPI(DifficultyLevelSchema);

// Base question schema - complete question entity
export const QuestionSchema = z.object({
  id: z.number(),
  subject_id: z.number(),
  affirmation: z.string().min(1, 'Question affirmation is required'),
  image_url: z.string().optional(),
  question_type: QuestionTypeSchema.default('multiple_choice'),
  exam_board: z.string().min(1, 'Exam board is required').max(100),
  exam_year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 10),
  position_title: z.string().max(255).optional(),
  difficulty_level: DifficultyLevelSchema,
  complexity_score: z.number().min(0).max(9.99).optional(),
  total_attempts: z.number().default(0),
  correct_attempts: z.number().default(0),
  success_rate: z.number().min(0).max(100).default(0),
  learning_tip: z.string().optional(),
  explanation: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
  sub_skill_category_id: z.number().optional(),
  question_statement_text_id: z.number().optional(),
  statement: z.string().max(255).optional(),
  // Virtual fields from relations
  sub_skill_category_name: z.string().optional(),
});

// Question basic info schema - for listing questions
export const QuestionBasicSchema = QuestionSchema.pick({
  id: true,
  affirmation: true,
  image_url: true,
  question_type: true,
  difficulty_level: true,
  exam_board: true,
  exam_year: true,
  statement: true,
  question_statement_text_id: true,
});

// Question with options schema - for listing questions with their options
export const QuestionWithOptionsSchema = QuestionBasicSchema.extend({
  question_options: z.array(QuestionOptionBasicSchema).optional(),
});

// Last user answer schema - for tracking user progress
export const LastUserAnswerSchema = z.object({
  id: z.number(),
  option_id: z.number(),
  is_correct: z.boolean(),
  answered_at: z.date(),
});

// // Question with last user answer schema - for showing user progress
// export const QuestionWithLastAnswerSchema = QuestionBasicSchema.extend({
//   last_user_answer: LastUserAnswerSchema.optional(),
// });

// Question with options and last answer schema - comprehensive view
export const QuestionWithOptionsAndLastAnswerSchema = QuestionBasicSchema.extend({
  question_options: z.array(QuestionOptionBasicSchema).optional(),
  last_user_answer: LastUserAnswerSchema.optional(),
});

// Question statistics schema - for performance tracking
export const QuestionStatsSchema = QuestionSchema.pick({
  id: true,
  total_attempts: true,
  correct_attempts: true,
  success_rate: true,
  complexity_score: true,
});

// Question content schema - for displaying question details
export const QuestionContentSchema = QuestionSchema.pick({
  id: true,
  subject_id: true,
  affirmation: true,
  image_url: true,
  question_type: true,
  difficulty_level: true,
  learning_tip: true,
  explanation: true,
});

// Question metadata schema - for exam and position information
export const QuestionMetadataSchema = QuestionSchema.pick({
  exam_board: true,
  exam_year: true,
  position_title: true,
  difficulty_level: true,
});

// For creating questions - excludes auto-generated fields
export const QuestionCreateSchema = QuestionSchema.omit({
  id: true,
  total_attempts: true,
  correct_attempts: true,
  success_rate: true,
  is_active: true,
  created_at: true,
  updated_at: true,
});

// For updating questions - all fields optional except required ones
export const QuestionUpdateSchema = QuestionSchema.partial().omit({
  id: true,
  created_at: true,
});

// For question filtering and search
export const QuestionFilterSchema = z.object({
  subject_id: z.coerce.number().optional(),
  sub_skill_category_id: z.coerce.number().optional(),
  question_type: QuestionTypeSchema.optional(),
  difficulty_level: DifficultyLevelSchema.optional(),
  exam_board: z.string().optional(),
  exam_year: z.coerce.number().optional(),
  is_active: z.coerce.number().optional(),
});

// Query parameters schema for retrieve operations
export const QuestionQuerySchema = QuestionFilterSchema.merge(PaginationSchema).extend({
  sort_by: z.enum(['id', 'created_at', 'exam_year', 'difficulty_level', 'success_rate']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).default('ASC'),
  include_inactive: z.coerce.number().default(0),
  include_options: z.coerce.number().default(0),
});

const QuestionDetailSchema = QuestionSchema.extend({
  subject: z
    .object({
      id: z.number(),
      name: z.string(),
      skill_category_id: z.number(),
    })
    .optional(),
});

export const QuestionEagerDetailSchema = QuestionSchema.extend({
  subject: z
    .object({
      id: z.number(),
      name: z.string(),
      contest_id: z.number(),
    })
    .optional(),
  contest: ContestIdentitySchema,
  question_statement_text: z
    .object({
      id: z.number(),
      text: z.string().optional(),
      contests_id: z.number(),
    })
    .optional(),
});

export const QuestionWithLastAnsweredQuestionSchema = z.object({
  last_answered_question_id: z.number().nullable().optional(),
});

// List response schemas for different question views
export const QuestionListResponseSchema = z.object({
  data: z
    .object({
      questions: z.array(
        z.union([QuestionBasicSchema, QuestionWithOptionsSchema, QuestionWithOptionsAndLastAnswerSchema])
      ),
    })
    .extend(QuestionWithLastAnsweredQuestionSchema.shape)
    .extend({
      statements_texts: z.record(z.string(), z.string()),
    }),
  meta: PaginationMetaSchema,
});

// List response schemas for different question views
export const QuestionWithLastAnsweredQuestionResponseSchema = QuestionWithLastAnsweredQuestionSchema;
// .extend({
//   meta: PaginationMetaSchema,
// });

export const QuestionDetailedListResponseSchema = z.object({
  data: z.array(QuestionSchema),
  meta: PaginationMetaSchema,
});

export const QuestionStatsListResponseSchema = z.object({
  data: z.array(QuestionStatsSchema),
  meta: PaginationMetaSchema,
});

// Single question response schema
export const QuestionDetailResponseSchema = z.object({
  data: QuestionDetailSchema,
});

export const QuestionCountResponseSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export const QuestionExistsResponseSchema = z.object({
  data: z.object({
    exists: z.boolean(),
  }),
});

// OpenAPI schemas
export const questionCreateOpenapi: any = zodToOpenAPI(QuestionCreateSchema);
export const questionUpdateOpenapi: any = zodToOpenAPI(QuestionUpdateSchema);
export const questionResponseOpenapi: any = zodToOpenAPI(QuestionSchema);
export const questionBasicOpenapi: any = zodToOpenAPI(QuestionBasicSchema);
export const questionWithOptionsOpenapi: any = zodToOpenAPI(QuestionWithOptionsSchema);
export const questionStatsOpenapi: any = zodToOpenAPI(QuestionStatsSchema);
export const questionFilterOpenapi: any = zodToOpenAPI(QuestionFilterSchema);
export const questionQueryOpenapi: any = zodToOpenAPI(QuestionQuerySchema);
export const questionListResponseOpenapi: any = zodToOpenAPI(QuestionListResponseSchema);
export const questionDetailedListResponseOpenapi: any = zodToOpenAPI(QuestionDetailedListResponseSchema);
export const questionStatsListResponseOpenapi: any = zodToOpenAPI(QuestionStatsListResponseSchema);
export const questionDetailResponseOpenapi: any = zodToOpenAPI(QuestionDetailResponseSchema);
export const questionExistsResponseOpenapi: any = zodToOpenAPI(QuestionExistsResponseSchema);
export const questionCountResponseOpenapi: any = zodToOpenAPI(QuestionCountResponseSchema);
export const questionWithLastAnsweredQuestionResponseOpenapi: any = zodToOpenAPI(
  QuestionWithLastAnsweredQuestionResponseSchema
);

// Type exports - inferred from Zod schemas
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionBasic = z.infer<typeof QuestionBasicSchema>;
export type QuestionWithOptions = z.infer<typeof QuestionWithOptionsSchema>;
export type LastUserAnswer = z.infer<typeof LastUserAnswerSchema>;
// export type QuestionWithLastAnswer = z.infer<typeof QuestionWithLastAnswerSchema>;
export type QuestionWithOptionsAndLastAnswer = z.infer<typeof QuestionWithOptionsAndLastAnswerSchema>;
export type QuestionWithLastAnsweredQuestionResponse = z.infer<typeof QuestionWithLastAnsweredQuestionResponseSchema>;
export type QuestionStats = z.infer<typeof QuestionStatsSchema>;
export type QuestionContent = z.infer<typeof QuestionContentSchema>;
export type QuestionMetadata = z.infer<typeof QuestionMetadataSchema>;
export type QuestionCreate = z.infer<typeof QuestionCreateSchema>;
export type QuestionUpdate = z.infer<typeof QuestionUpdateSchema>;
export type QuestionFilter = z.infer<typeof QuestionFilterSchema>;
export type QuestionQuery = z.infer<typeof QuestionQuerySchema>;
export type QuestionDetail = z.infer<typeof QuestionDetailSchema>;
export type QuestionListResponse = z.infer<typeof QuestionListResponseSchema>;
export type QuestionDetailedListResponse = z.infer<typeof QuestionDetailedListResponseSchema>;
export type QuestionStatsListResponse = z.infer<typeof QuestionStatsListResponseSchema>;
export type QuestionDetailResponse = z.infer<typeof QuestionDetailResponseSchema>;
export type QuestionCountResponse = z.infer<typeof QuestionCountResponseSchema>;
export type QuestionExistsResponse = z.infer<typeof QuestionExistsResponseSchema>;
export type QuestionEagerDetail = z.infer<typeof QuestionEagerDetailSchema>;
