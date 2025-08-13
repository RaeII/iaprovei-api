import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SkillCategory as SkillCategoryType } from '@/modules/skill_category/schemas/skill_category.schema';

@Entity('skill_category')
export class SkillCategory implements SkillCategoryType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 50 })
  slug: string;

  @Column({ name: 'father_skill_category_id', nullable: true })
  father_skill_category_id: number;

  // Self-referencing relationship for parent category
  @ManyToOne(() => SkillCategory, skillCategory => skillCategory.children, {
    nullable: true,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'father_skill_category_id' })
  parent: SkillCategory;

  // Self-referencing relationship for child categories
  @OneToMany(() => SkillCategory, skillCategory => skillCategory.parent)
  children: SkillCategory[];
}
