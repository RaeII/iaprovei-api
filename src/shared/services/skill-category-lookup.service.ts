import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { SkillCategory } from '@/entities/skill_category.entity';
import { SkillCategoryListData } from '@/modules/skill_category/schemas/skill_category.schema';
import { ISkillCategoryLookupService } from '../contracts/skill-category-lookup.contract';

@Injectable()
export class SkillCategoryLookupService implements ISkillCategoryLookupService {
  constructor(
    @InjectRepository(SkillCategory)
    private skillCategoryRepository: Repository<SkillCategory>
  ) {}

  async assertExists(id: number): Promise<SkillCategoryListData> {
    const skillCategory = await this.skillCategoryRepository.findOne({
      where: { id },
      select: ['id', 'name', 'description', 'slug', 'father_skill_category_id'],
    });

    if (!skillCategory) {
      throw new DataNotFoundException(
        `SkillCategory with id "${id}"`,
        'Categoria de Habilidade',
        SkillCategoryLookupService.name
      );
    }

    return skillCategory;
  }

  async findById(id: number): Promise<SkillCategoryListData | null> {
    return this.skillCategoryRepository.findOne({
      where: { id },
      select: ['id', 'name', 'description', 'slug', 'father_skill_category_id'],
    });
  }

  async findBySlug(slug: string): Promise<SkillCategoryListData | null> {
    return this.skillCategoryRepository.findOne({
      where: { slug },
      select: ['id', 'name', 'description', 'slug', 'father_skill_category_id'],
    });
  }
}
