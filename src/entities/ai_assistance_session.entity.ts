import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';
import { User } from './user.entity';
import { AiAssistanceSession as AiAssistanceSessionType } from '@/ai_assistance_session/schemas/ai_assistance_session.schema';

@Entity('ai_assistance_sessions')
export class AiAssistanceSession implements AiAssistanceSessionType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'question_id' })
  question_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'session_id', length: 36 })
  session_id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  // Relationships
  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
