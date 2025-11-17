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
import { UserStatistics as UserStatisticsType } from '@/modules/statistics/schemas/statistics.schema';

@Entity('user_statistics')
@Index('idx_user_statistics_user_date', ['users_id', 'statistics_date'])
@Index('idx_user_statistics_date', ['statistics_date'])
export class UserStatistics implements UserStatisticsType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'users_id' })
  users_id: number;

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

  @Column({ name: 'total_study_time', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_study_time: number;

  @Column({ name: 'questions_answered_today', default: 0 })
  questions_answered_today: number;

  @Column({ name: 'questions_answered_this_week', default: 0 })
  questions_answered_this_week: number;

  @Column({ name: 'questions_answered_this_month', default: 0 })
  questions_answered_this_month: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'users_id' })
  user: User;
}
