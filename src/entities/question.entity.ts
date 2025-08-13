import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Subject } from './subject.entity';
import { SkillCategory } from './skill_category.entity';
import { Question as QuestionType } from '@/modules/question/schemas/question.schema';
import { QuestionOption } from './question_option.entity';

export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  ESSAY = 'essay',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('questions')
export class Question implements QuestionType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subject_id' })
  subject_id: number;

  @Column({ type: 'text' })
  affirmation: string;

  @Column({
    name: 'question_type',
    type: 'enum',
    enum: QuestionTypeEnum,
    default: QuestionTypeEnum.MULTIPLE_CHOICE,
  })
  question_type: QuestionTypeEnum;

  @Column({ name: 'exam_board', length: 100 })
  exam_board: string;

  @Column({ name: 'exam_year' })
  exam_year: number;

  @Column({ name: 'position_title', length: 255, nullable: true })
  position_title: string;

  @Column({
    name: 'difficulty_level',
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty_level: DifficultyLevel;

  @Column({ name: 'complexity_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  complexity_score: number;

  @Column({ name: 'total_attempts', default: 0 })
  total_attempts: number;

  @Column({ name: 'correct_attempts', default: 0 })
  correct_attempts: number;

  @Column({ name: 'success_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  success_rate: number;

  @Column({ name: 'learning_tip', type: 'text', nullable: true })
  learning_tip: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ name: 'sub_subject_category_id', nullable: true })
  sub_subject_category_id: number;

  // Relations
  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => SkillCategory)
  @JoinColumn({ name: 'sub_subject_category_id' })
  sub_subject_category: SkillCategory;

  @OneToMany(() => QuestionOption, questionOption => questionOption.question)
  question_options: QuestionOption[];
}
