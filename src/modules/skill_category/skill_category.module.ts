import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillCategoryController } from './skill_category.controller';
import { SkillCategoryService } from './skill_category.service';
import { SkillCategoryValidator } from './skill_category.validator';
import { SkillCategory } from '@/entities/skill_category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SkillCategory])],
  controllers: [SkillCategoryController],
  providers: [SkillCategoryService, SkillCategoryValidator],
  exports: [SkillCategoryService, SkillCategoryValidator],
})
export class SkillCategoryModule {}
