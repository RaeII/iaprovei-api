import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { SkillCategory } from './skill_category.entity';
import { DifficultyLevel } from './question.entity';

@Entity('study_trail_performance')
@Index('idx_study_trail_performance_user_skill_category', ['user_id', 'skill_category_id'])
@Index('idx_study_trail_performance_difficulty', ['difficulty_level'])
export class StudyTrailPerformance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'skill_category_id' })
  skill_category_id: number;

  @Column({
    name: 'difficulty_level',
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty_level: DifficultyLevel;

  @Column({ name: 'total_questions_answered', default: 0 })
  total_questions_answered: number;

  @Column({ name: 'correct_answers', default: 0 })
  correct_answers: number;

  @Column({ name: 'incorrect_answers', default: 0 })
  incorrect_answers: number;

  @Column({ name: 'success_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  success_rate: number;

  @Column({ name: 'average_response_time', type: 'decimal', precision: 10, scale: 2, default: 0 })
  average_response_time: number;

  @Column({ name: 'consecutive_correct_answers', default: 0 })
  consecutive_correct_answers: number;

  @Column({ name: 'consecutive_incorrect_answers', default: 0 })
  consecutive_incorrect_answers: number;

  @Column({ name: 'performance_trend', type: 'decimal', precision: 5, scale: 2, default: 0 })
  performance_trend: number; // Positive = improving, Negative = declining

  @Column({ name: 'last_activity_date', type: 'date', nullable: true })
  last_activity_date: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => SkillCategory)
  @JoinColumn({ name: 'skill_category_id' })
  skill_category: SkillCategory;
}
