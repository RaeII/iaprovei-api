import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillCategory } from '@/entities/skill_category.entity';
import { SkillCategoryValidator } from './skill_category.validator';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { createPaginationMeta, generateOffset } from '@/common/utils/query-utils';
import { SkillCategoryListData, SkillCategoryListDataSchema } from './schemas/skill_category.schema';
import { Pagination, PaginationMeta } from '@/common/schemas/pagination.schema';

@Injectable()
export class SkillCategoryService {
  constructor(
    @InjectRepository(SkillCategory)
    private skillCategoryRepository: Repository<SkillCategory>,
    private skillCategoryValidator: SkillCategoryValidator
  ) {}

  // Helper method to get select fields automatically from schema
  private getSelectFields(): (keyof SkillCategory)[] {
    const keys = Object.keys(SkillCategoryListDataSchema.shape) as (keyof SkillCategory)[];
    return keys;
  }

  async findAll(pagination?: Pagination): Promise<{ data: SkillCategoryListData[]; meta?: PaginationMeta }> {
    const selectFields = this.getSelectFields();

    if (pagination) {
      const { page, limit } = pagination;
      const offset = generateOffset(page, limit);

      const [data, total] = await this.skillCategoryRepository.findAndCount({
        select: selectFields,
        take: limit,
        skip: offset,
        order: { name: 'ASC' },
      });

      const meta = createPaginationMeta(total, page, limit);
      return { data, meta };
    }

    const data = await this.skillCategoryRepository.find({
      select: selectFields,
      order: { name: 'ASC' },
    });

    return { data };
  }

  async findOne(id: number): Promise<SkillCategoryListData> {
    const skillCategory = await this.skillCategoryRepository.findOne({
      where: { id },
      select: this.getSelectFields(),
    });

    if (!skillCategory) {
      throw new DataNotFoundException(`SkillCategory with id "${id}"`, 'Categoria de Habilidade', SkillCategoryService.name);
    }

    return skillCategory;
  }

  async findBySlug(slug: string): Promise<SkillCategoryListData> {
    const skillCategory = await this.skillCategoryRepository.findOne({
      where: { slug },
      select: this.getSelectFields(),
    });

    if (!skillCategory) {
      throw new DataNotFoundException(`SkillCategory with slug "${slug}"`, 'Categoria de Habilidade', SkillCategoryService.name);
    }

    return skillCategory;
  }

  async findChildren(parentId: number, pagination?: Pagination): Promise<{ data: SkillCategoryListData[]; meta?: PaginationMeta }> {
    // Validate parent exists
    await this.skillCategoryValidator.assertExists(parentId);

    const selectFields = this.getSelectFields();

    if (pagination) {
      const { page, limit } = pagination;
      const offset = generateOffset(page, limit);

      const [data, total] = await this.skillCategoryRepository.findAndCount({
        where: { father_skill_category_id: parentId },
        select: selectFields,
        take: limit,
        skip: offset,
        order: { name: 'ASC' },
      });

      const meta = createPaginationMeta(total, page, limit);
      return { data, meta };
    }

    const data = await this.skillCategoryRepository.find({
      where: { father_skill_category_id: parentId },
      select: selectFields,
      order: { name: 'ASC' },
    });

    return { data };
  }

  async findRootCategories(pagination?: Pagination): Promise<{ data: SkillCategoryListData[]; meta?: PaginationMeta }> {
    const selectFields = this.getSelectFields();

    if (pagination) {
      const { page, limit } = pagination;
      const offset = generateOffset(page, limit);

      const [data, total] = await this.skillCategoryRepository.findAndCount({
        where: { father_skill_category_id: null },
        select: selectFields,
        take: limit,
        skip: offset,
        order: { name: 'ASC' },
      });

      const meta = createPaginationMeta(total, page, limit);
      return { data, meta };
    }

    const data = await this.skillCategoryRepository.find({
      where: { father_skill_category_id: null },
      select: selectFields,
      order: { name: 'ASC' },
    });

    return { data };
  }

  async searchByName(name: string, pagination?: Pagination): Promise<{ data: SkillCategoryListData[]; meta?: PaginationMeta }> {
    const selectFields = this.getSelectFields();

    if (pagination) {
      const { page, limit } = pagination;
      const offset = generateOffset(page, limit);

      const [data, total] = await this.skillCategoryRepository
        .createQueryBuilder('skill_category')
        .select(selectFields.map(field => `skill_category.${String(field)}`))
        .where('skill_category.name LIKE :name', { name: `%${name}%` })
        .orderBy('skill_category.name', 'ASC')
        .take(limit)
        .skip(offset)
        .getManyAndCount();

      const meta = createPaginationMeta(total, page, limit);
      return { data, meta };
    }

    const data = await this.skillCategoryRepository
      .createQueryBuilder('skill_category')
      .select(selectFields.map(field => `skill_category.${String(field)}`))
      .where('skill_category.name LIKE :name', { name: `%${name}%` })
      .orderBy('skill_category.name', 'ASC')
      .getMany();

    return { data };
  }
}
