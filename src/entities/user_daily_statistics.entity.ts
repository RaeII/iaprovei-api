import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { UserDailyStatistics as UserDailyStatisticsType } from '@/modules/statistics/schemas/statistics.schema';

@Entity('user_daily_statistics')
@Unique('unique_user_daily_stats', ['users_id', 'statistics_date'])
@Index('idx_user_daily_statistics_user_date', ['users_id', 'statistics_date'])
@Index('idx_user_daily_statistics_date', ['statistics_date'])
export class UserDailyStatistics implements UserDailyStatisticsType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'users_id' })
  users_id: number;

  @Column({ name: 'statistics_date', type: 'date' })
  statistics_date: Date;

  @Column({ name: 'questions_answered', default: 0 })
  questions_answered: number;

  @Column({ name: 'correct_answers', default: 0 })
  correct_answers: number;

  @Column({ name: 'incorrect_answers', default: 0 })
  incorrect_answers: number;

  @Column({ name: 'success_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  success_rate: number;

  @Column({ name: 'average_response_time', type: 'decimal', precision: 10, scale: 2, default: 0 })
  average_response_time: number;

  @Column({ name: 'study_time', type: 'decimal', precision: 10, scale: 2, default: 0 })
  study_time: number;

  @Column({ name: 'streak_count', default: 0 })
  streak_count: number;

  @Column({ name: 'is_streak_day', type: 'tinyint', default: 0 })
  is_streak_day: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'users_id' })
  user: User;
}
