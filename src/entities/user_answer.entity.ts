import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Question } from './question.entity';
import { QuestionOption } from './question_option.entity';
import { UserAnswer as UserAnswerType } from '@/user_answer/schemas/user_answer.schema';

@Entity('user_answers')
export class UserAnswer implements UserAnswerType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'users_id' })
  users_id: number;

  @Column({ name: 'question_id' })
  question_id: number;

  @Column({ name: 'option_id' })
  option_id: number;

  @Column({ name: 'is_correct', type: 'tinyint' })
  is_correct: boolean;

  @Column({ name: 'response_time', default: 0 })
  response_time: number;

  @Column({ name: 'session_id', length: 45 })
  session_id: string;

  @Column({ name: 'used_hint', type: 'tinyint', default: 0 })
  used_hint: boolean;

  @Column({ name: 'confidence_level', type: 'decimal', precision: 3, scale: 2, default: 0 })
  confidence_level: number;

  @Column({ name: 'difficulty_at_time', type: 'decimal', precision: 3, scale: 2, default: 0 })
  difficulty_at_time: number;

  @CreateDateColumn({ name: 'answared_at', type: 'timestamp' })
  answared_at: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'users_id' })
  user: User;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => QuestionOption)
  @JoinColumn({ name: 'option_id' })
  option: QuestionOption;
}
