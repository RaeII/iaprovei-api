import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Subject as SubjectType } from '@/modules/subject/schemas/subject.schema';
import { Contest } from './contest.entity';

@Entity('subjects')
export class Subject implements SubjectType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contest_id' })
  contest_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

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
}
