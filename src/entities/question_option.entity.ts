import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';
import { QuestionOption as QuestionOptionType } from '../modules/question_option/schemas/question_option.schema';

@Entity('question_options')
export class QuestionOption implements QuestionOptionType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'question_id' })
  question_id: number;

  @Column({ name: 'option_text', type: 'text' })
  option_text: string;

  @Column({ name: 'option_letter', length: 1, nullable: true })
  option_letter: string;

  @Column({ name: 'is_correct', type: 'tinyint', default: 0 })
  is_correct: boolean;

  @Column({ name: 'display_order', type: 'tinyint', default: 0 })
  display_order: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  // Relationship
  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
