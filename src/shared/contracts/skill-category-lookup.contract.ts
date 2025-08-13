import { SkillCategoryListData } from '@/modules/skill_category/schemas/skill_category.schema';

export interface ISkillCategoryLookupService {
  assertExists(id: number): Promise<SkillCategoryListData>;
  findById(id: number): Promise<SkillCategoryListData | null>;
  findBySlug(slug: string): Promise<SkillCategoryListData | null>;
}
