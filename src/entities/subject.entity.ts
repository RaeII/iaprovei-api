import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Subject as SubjectType } from '@/modules/subject/schemas/subject.schema';
import { Contest } from './contest.entity';
import { SkillCategory } from './skill_category.entity';

@Entity('subjects')
export class Subject implements SubjectType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contest_id' })
  contest_id: number;

  @Column({ name: 'skill_category_id' })
  skill_category_id: number;

  @Column({ name: 'display_order', type: 'tinyint', default: 0 })
  display_order: number;

  @Column({ name: 'total_questions', default: 0 })
  total_questions: number;

  @Column({ name: 'estimated_study_hours', nullable: true })
  estimated_study_hours: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  // Relationship with Contest
  @ManyToOne(() => Contest)
  @JoinColumn({ name: 'contest_id' })
  contest: Contest;

  // Relationship with SkillCategory
  @ManyToOne(() => SkillCategory)
  @JoinColumn({ name: 'skill_category_id' })
  skill_category: SkillCategory;
}
