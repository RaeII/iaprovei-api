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
import { StudyTrail } from './study_trail.entity';
import { StudyTrailStopQuestion } from './study_trail_stop_question.entity';
import { DifficultyLevel } from './question.entity';

export enum StudyTrailStopStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum StudyTrailStopType {
  LESSON = 'lesson',
  PRACTICE = 'practice',
  CHALLENGE = 'challenge',
  REVIEW = 'review',
}

@Entity('study_trail_stops')
export class StudyTrailStop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'study_trail_id' })
  study_trail_id: number;

  @Column({ name: 'position_order' })
  position_order: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'stop_type',
    type: 'enum',
    enum: StudyTrailStopType,
    default: StudyTrailStopType.PRACTICE,
  })
  stop_type: StudyTrailStopType;

  @Column({
    name: 'difficulty_level',
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty_level: DifficultyLevel;

  @Column({
    type: 'enum',
    enum: StudyTrailStopStatus,
    default: StudyTrailStopStatus.LOCKED,
  })
  status: StudyTrailStopStatus;

  @Column({ name: 'total_questions', default: 10 })
  total_questions: number;

  @Column({ name: 'questions_answered', default: 0 })
  questions_answered: number;

  @Column({ name: 'correct_answers', default: 0 })
  correct_answers: number;

  @Column({ name: 'success_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  success_rate: number;

  @Column({ name: 'xp_reward', default: 10 })
  xp_reward: number;

  @Column({ name: 'xp_earned', default: 0 })
  xp_earned: number;

  @Column({ name: 'estimated_duration_minutes', default: 15 })
  estimated_duration_minutes: number;

  @Column({ name: 'actual_duration_minutes', default: 0 })
  actual_duration_minutes: number;

  @Column({ name: 'minimum_success_rate', type: 'decimal', precision: 5, scale: 2, default: 70.0 })
  minimum_success_rate: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at: Date;

  // Relationships
  @ManyToOne(() => StudyTrail, studyTrail => studyTrail.stops)
  @JoinColumn({ name: 'study_trail_id' })
  study_trail: StudyTrail;

  @OneToMany(() => StudyTrailStopQuestion, stopQuestion => stopQuestion.study_trail_stop)
  questions: StudyTrailStopQuestion[];
}
