import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';

// Base skill category schema - complete skill category entity
export const SkillCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(255).optional(),
  slug: z.string().min(1, 'Slug is required').max(50),
  father_skill_category_id: z.number().optional(),
});

// Skill category list data schema - for listing operations
export const SkillCategoryListDataSchema = SkillCategorySchema;

// Skill category create schema - for creation operations
export const SkillCategoryCreateSchema = SkillCategorySchema.omit({
  id: true,
});

// Skill category update schema - for update operations
export const SkillCategoryUpdateSchema = SkillCategorySchema.partial().omit({
  id: true,
});

// Response schemas
export const SkillCategoryListResponseSchema = z.object({
  data: z.array(SkillCategoryListDataSchema),
});

export const SkillCategoryDetailResponseSchema = z.object({
  data: SkillCategoryListDataSchema,
});

// OpenAPI schemas
export const skillCategoryListResponseOpenapi: any = zodToOpenAPI(SkillCategoryListResponseSchema);
export const skillCategoryCreateOpenapi: any = zodToOpenAPI(SkillCategoryCreateSchema);
export const skillCategoryUpdateOpenapi: any = zodToOpenAPI(SkillCategoryUpdateSchema);
export const skillCategoryDetailResponseOpenapi: any = zodToOpenAPI(SkillCategoryDetailResponseSchema);

// Type exports
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type SkillCategoryListData = z.infer<typeof SkillCategoryListDataSchema>;
export type SkillCategoryCreate = z.infer<typeof SkillCategoryCreateSchema>;
export type SkillCategoryUpdate = z.infer<typeof SkillCategoryUpdateSchema>;
export type SkillCategoryListResponse = z.infer<typeof SkillCategoryListResponseSchema>;
export type SkillCategoryDetailResponse = z.infer<typeof SkillCategoryDetailResponseSchema>;
