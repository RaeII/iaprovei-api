import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';
import { SubjectSchema } from '@/modules/subject/schemas/subject.schema';

// Enum schemas matching the TypeORM enums
export const ContestStatusSchema = z.enum(['available', 'coming_soon', 'draft']);
export const DifficultyLevelSchema = z.enum(['beginner', 'intermediary', 'advanced']);

// Base contest schema - complete contest entity
export const ContestSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Contest name is required').max(255),
  slug: z.string().min(1, 'Contest slug is required').max(255),
  description: z.string().optional(),
  institution: z.string().max(255).optional(),
  status: ContestStatusSchema.default('draft'),
  difficulty_level: DifficultyLevelSchema,
  total_questions: z.number().default(0),
  estimated_study_hours: z.number().min(1, 'Estimated study hours must be at least 1'),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

// Contest identity schema - for contest identification
export const ContestIdentitySchema = ContestSchema.pick({
  id: true,
  name: true,
  slug: true,
});

// Contest summary schema - for listing contests
export const ContestSummarySchema = ContestSchema.pick({
  id: true,
  name: true,
  slug: true,
  description: true,
  institution: true,
  status: true,
  difficulty_level: true,
  total_questions: true,
  estimated_study_hours: true,
}).extend({
  status_translated: z.string(),
  difficulty_level_translated: z.string(),
});

// Contest details schema - for full contest information
export const ContestDetailsSchema = ContestSchema.pick({
  id: true,
  name: true,
  slug: true,
  description: true,
  institution: true,
  status: true,
  difficulty_level: true,
  total_questions: true,
  estimated_study_hours: true,
  is_active: true,
  created_at: true,
  updated_at: true,
}).extend({
  status_translated: z.string(),
  difficulty_level_translated: z.string(),
});

export const ContestWithSubjectsSchema = ContestSchema.pick({
  id: true,
  name: true,
  institution: true,
  status: true,
}).extend({
  subjects: z.array(
    SubjectSchema.pick({ id: true, name: true }).extend({
      user_answer_questions_percentage: z.number().default(0), // Percentage of questions completed (0-100)
    })
  ),
});

// Query parameters for listing contests
export const ContestQuerySchema = z.object({
  status: ContestStatusSchema.optional(),
  includeInactive: z.boolean().optional(),
  fullDetails: z.boolean().optional(),
});

// Count response schema
export const ContestCountSchema = z.object({
  count: z.number(),
});

// Response wrapper schemas
export const ContestListResponseSchema = z.object({
  contests: z.array(ContestSummarySchema),
});

export const ContestDetailsResponseSchema = z.object({
  contest: ContestDetailsSchema,
});

export const ContestExistsResponseSchema = z.object({
  exists: z.boolean(),
});

// For creating contests - excludes auto-generated fields
export const ContestCreateSchema = ContestSchema.omit({
  id: true,
  is_active: true,
  created_at: true,
  updated_at: true,
});

// For updating contests - all fields optional except required ones
export const ContestUpdateSchema = ContestSchema.partial().omit({
  id: true,
  created_at: true,
});

export const ContestWithSubjectsResponseSchema = z.object({
  data: z.array(ContestWithSubjectsSchema),
});

// OpenAPI schemas
export const contestCreateOpenapi: any = zodToOpenAPI(ContestCreateSchema);
export const contestUpdateOpenapi: any = zodToOpenAPI(ContestUpdateSchema);
export const contestSummaryOpenapi: any = zodToOpenAPI(ContestSummarySchema);
export const contestDetailsOpenapi: any = zodToOpenAPI(ContestDetailsSchema);
export const contestWithSubjectsOpenapi: any = zodToOpenAPI(ContestWithSubjectsSchema);
export const contestQueryOpenapi: any = zodToOpenAPI(ContestQuerySchema);
export const contestCountOpenapi: any = zodToOpenAPI(ContestCountSchema);
export const contestListResponseOpenapi: any = zodToOpenAPI(ContestListResponseSchema);
export const contestDetailsResponseOpenapi: any = zodToOpenAPI(ContestDetailsResponseSchema);
export const contestExistsResponseOpenapi: any = zodToOpenAPI(ContestExistsResponseSchema);

// Type exports - inferred from Zod schemas
export type Contest = z.infer<typeof ContestSchema>;
export type ContestIdentity = z.infer<typeof ContestIdentitySchema>;
export type ContestWithSubjects = z.infer<typeof ContestWithSubjectsSchema>;
export type ContestWithSubjectsResponse = z.infer<typeof ContestWithSubjectsResponseSchema>;
export type ContestSummary = z.infer<typeof ContestSummarySchema>;
export type ContestDetails = z.infer<typeof ContestDetailsSchema>;
export type ContestQuery = z.infer<typeof ContestQuerySchema>;
export type ContestCount = z.infer<typeof ContestCountSchema>;
export type ContestListResponse = z.infer<typeof ContestListResponseSchema>;
export type ContestDetailsResponse = z.infer<typeof ContestDetailsResponseSchema>;
export type ContestExistsResponse = z.infer<typeof ContestExistsResponseSchema>;
export type ContestCreate = z.infer<typeof ContestCreateSchema>;
export type ContestUpdate = z.infer<typeof ContestUpdateSchema>;
