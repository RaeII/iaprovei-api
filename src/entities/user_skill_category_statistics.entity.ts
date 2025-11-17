import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { SkillCategory } from './skill_category.entity';
import { UserSkillCategoryStatistics as UserSkillCategoryStatisticsType } from '@/modules/statistics/schemas/statistics.schema';

@Entity('user_skill_category_statistics')
@Index('idx_user_skill_category_statistics_user_skill_date', ['users_id', 'skill_category_id', 'statistics_date'])
@Index('idx_user_skill_category_statistics_user_date', ['users_id', 'statistics_date'])
@Index('idx_user_skill_category_statistics_skill_date', ['skill_category_id', 'statistics_date'])
export class UserSkillCategoryStatistics implements UserSkillCategoryStatisticsType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'users_id' })
  users_id: number;

  @Column({ name: 'skill_category_id' })
  skill_category_id: number;

  @Column({ name: 'statistics_date', type: 'date' })
  statistics_date: Date;

  @Column({ name: 'total_questions_answered', default: 0 })
  total_questions_answered: number;

  @Column({ name: 'correct_answers', default: 0 })
  correct_answers: number;

  @Column({ name: 'incorrect_answers', default: 0 })
  incorrect_answers: number;

  @Column({ name: 'success_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  success_rate: number;

  @Column({ name: 'error_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  error_rate: number;

  @Column({ name: 'average_response_time', type: 'decimal', precision: 10, scale: 2, default: 0 })
  average_response_time: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ name: 'questions_available', default: 0 })
  questions_available: number;

  @Column({ name: 'completion_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completion_percentage: number;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'users_id' })
  user: User;

  @ManyToOne(() => SkillCategory)
  @JoinColumn({ name: 'skill_category_id' })
  skill_category: SkillCategory;
}
