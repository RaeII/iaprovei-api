import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Contest } from './contest.entity';
import { QuestionStatementText as QuestionStatementTextType } from '../modules/question_statement_text/schemas/question_statement_text.schema';

@Entity('question_statement_text')
export class QuestionStatementText implements QuestionStatementTextType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ name: 'contests_id' })
  contests_id: number;

  @ManyToOne(() => Contest)
  @JoinColumn({ name: 'contests_id' })
  contest: Contest;
}
