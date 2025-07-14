import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';

// Base subject schema - complete subject entity
export const SubjectSchema = z.object({
  id: z.number(),
  contest_id: z.number(),
  name: z.string().min(1, 'Subject name is required').max(255),
  slug: z.string().min(1, 'Subject slug is required').max(255),
  description: z.string().optional(),
  display_order: z.number().min(0).default(0),
  total_questions: z.number().min(0).default(0),
  estimated_study_hours: z.number().min(1).optional(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

// Subject identity schema - for subject identification
export const SubjectIdentitySchema = SubjectSchema.pick({
  id: true,
  name: true,
  slug: true,
});

// Subject summary schema - for listing subjects
export const SubjectSummarySchema = SubjectSchema.pick({
  id: true,
  contest_id: true,
  name: true,
  slug: true,
  description: true,
  display_order: true,
  total_questions: true,
  estimated_study_hours: true,
});

// Subject details schema - for full subject information
export const SubjectDetailsSchema = SubjectSchema.pick({
  id: true,
  contest_id: true,
  name: true,
  slug: true,
  description: true,
  display_order: true,
  total_questions: true,
  estimated_study_hours: true,
  is_active: true,
  created_at: true,
  updated_at: true,
});

// For creating subjects - excludes auto-generated fields
export const SubjectCreateSchema = SubjectSchema.omit({
  id: true,
  is_active: true,
  created_at: true,
  updated_at: true,
});

// For updating subjects - all fields optional except required ones
export const SubjectUpdateSchema = SubjectSchema.partial().omit({
  id: true,
  created_at: true,
});

// OpenAPI schemas
export const subjectCreateOpenapi: any = zodToOpenAPI(SubjectCreateSchema);
export const subjectUpdateOpenapi: any = zodToOpenAPI(SubjectUpdateSchema);
export const subjectSummaryOpenapi: any = zodToOpenAPI(SubjectSummarySchema);
export const subjectDetailsOpenapi: any = zodToOpenAPI(SubjectDetailsSchema);

// Type exports - inferred from Zod schemas
export type Subject = z.infer<typeof SubjectSchema>;
export type SubjectIdentity = z.infer<typeof SubjectIdentitySchema>;
export type SubjectSummary = z.infer<typeof SubjectSummarySchema>;
export type SubjectDetails = z.infer<typeof SubjectDetailsSchema>;
export type SubjectCreate = z.infer<typeof SubjectCreateSchema>;
export type SubjectUpdate = z.infer<typeof SubjectUpdateSchema>;
