import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { SkillCategory } from './skill_category.entity';
import { StudyTrailStop } from './study_trail_stop.entity';

export enum StudyTrailStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

export enum StudyTrailGenerationModel {
  ADAPTIVE = 'adaptive', // Original model - generates stops dynamically based on performance
  ALL_QUESTIONS_BY_DIFFICULTY = 'all_questions_by_difficulty', // New model - uses all questions ordered by difficulty
}

@Entity('study_trails')
export class StudyTrail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'skill_category_id' })
  skill_category_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: StudyTrailStatus,
    default: StudyTrailStatus.ACTIVE,
  })
  status: StudyTrailStatus;

  @Column({
    type: 'enum',
    enum: StudyTrailGenerationModel,
    default: StudyTrailGenerationModel.ADAPTIVE,
    name: 'generation_model',
  })
  generation_model: StudyTrailGenerationModel;

  @Column({ name: 'current_stop_position', default: 1 })
  current_stop_position: number;

  @Column({ name: 'total_stops', default: 5 })
  total_stops: number;

  @Column({ name: 'completion_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completion_percentage: number;

  @Column({ name: 'total_xp_earned', default: 0 })
  total_xp_earned: number;

  @Column({ name: 'average_performance', type: 'decimal', precision: 5, scale: 2, default: 0 })
  average_performance: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => SkillCategory)
  @JoinColumn({ name: 'skill_category_id' })
  skill_category: SkillCategory;

  @OneToMany(() => StudyTrailStop, studyTrailStop => studyTrailStop.study_trail)
  stops: StudyTrailStop[];
}
