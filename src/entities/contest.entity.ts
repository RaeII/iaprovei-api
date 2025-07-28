import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Contest as ContestType } from '@/modules/contest/schemas/contest.schema';
import { Subject } from './subject.entity';

export enum ContestStatus {
  AVAILABLE = 'available',
  COMING_SOON = 'coming_soon',
  DRAFT = 'draft',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIARY = 'intermediary',
  ADVANCED = 'advanced',
}

@Entity('contests')
export class Contest implements ContestType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  institution: string;

  @Column({
    type: 'enum',
    enum: ContestStatus,
    default: ContestStatus.DRAFT,
  })
  status: ContestStatus;

  @Column({
    name: 'difficulty_level',
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty_level: DifficultyLevel;

  @Column({ name: 'total_questions', default: 0 })
  total_questions: number;

  @Column({ name: 'estimated_study_hours' })
  estimated_study_hours: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  // Relationship with Subjects
  @OneToMany(() => Subject, subject => subject.contest)
  subjects: Subject[];
}
