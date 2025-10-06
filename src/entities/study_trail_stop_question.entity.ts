import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StudyTrailStop } from './study_trail_stop.entity';
import { Question } from './question.entity';
import { QuestionOption } from './question_option.entity';

export enum QuestionAnswerStatus {
  NOT_ANSWERED = 'not_answered',
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  SKIPPED = 'skipped',
}

@Entity('study_trail_stop_questions')
export class StudyTrailStopQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'study_trail_stop_id' })
  study_trail_stop_id: number;

  @Column({ name: 'question_id' })
  question_id: number;

  @Column({ name: 'question_order' })
  question_order: number;

  @Column({ name: 'selected_option_id', nullable: true })
  selected_option_id: number;

  @Column({
    name: 'answer_status',
    type: 'enum',
    enum: QuestionAnswerStatus,
    default: QuestionAnswerStatus.NOT_ANSWERED,
  })
  answer_status: QuestionAnswerStatus;

  @Column({ name: 'response_time_seconds', default: 0 })
  response_time_seconds: number;

  @Column({ name: 'used_hint', type: 'tinyint', default: 0 })
  used_hint: boolean;

  @Column({ name: 'confidence_level', type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence_level: number;

  @Column({ name: 'xp_earned', default: 0 })
  xp_earned: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'answered_at', type: 'timestamp', nullable: true })
  answered_at: Date;

  // Relationships
  @ManyToOne(() => StudyTrailStop, studyTrailStop => studyTrailStop.questions)
  @JoinColumn({ name: 'study_trail_stop_id' })
  study_trail_stop: StudyTrailStop;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => QuestionOption, { nullable: true })
  @JoinColumn({ name: 'selected_option_id' })
  selected_option: QuestionOption;
}
