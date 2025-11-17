import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UniqueDataException } from '@/common/exceptions/unique-data.exception';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { SkillCategory } from '@/entities/skill_category.entity';

@Injectable()
export class SkillCategoryValidator {
  constructor(
    @InjectRepository(SkillCategory)
    private repository: Repository<SkillCategory>
  ) {}

  async assertSlugIsNotAlreadyInUse(slug: string, excludeId?: number): Promise<void> {
    const queryBuilder = this.repository
      .createQueryBuilder('skill_category')
      .where('skill_category.slug = :slug', { slug });
    if (excludeId) {
      queryBuilder.andWhere('skill_category.id != :excludeId', { excludeId });
    }

    const existingSkillCategory = await queryBuilder.getOne();
    if (existingSkillCategory) {
      throw new UniqueDataException(`Slug ${slug}`, 'Slug', SkillCategoryValidator.name);
    }
  }

  async assertExists(id: number): Promise<SkillCategory> {
    const skillCategory = await this.repository.findOne({ where: { id } });
    if (!skillCategory) {
      throw new DataNotFoundException(
        `SkillCategory with id "${id}"`,
        'Categoria de Habilidade',
        SkillCategoryValidator.name
      );
    }
    return skillCategory;
  }

  async assertParentExists(parentId: number): Promise<SkillCategory> {
    if (!parentId) return null;
    return this.assertExists(parentId);
  }
}
