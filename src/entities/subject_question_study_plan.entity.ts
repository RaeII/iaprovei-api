import { Entity, ManyToOne, JoinColumn, Index, PrimaryColumn } from 'typeorm';
import { Subject } from './subject.entity';
import { Question } from './question.entity';

@Entity('subject_question_study_plan')
@Index('fk_subject_question_plan_subjects1_idx', ['subjects_id'])
@Index('fk_subject_question_plan_questions1_idx', ['questions_id'])
export class SubjectQuestionStudyPlan {
  @PrimaryColumn({ name: 'subjects_id' })
  subjects_id: number;

  @PrimaryColumn({ name: 'questions_id' })
  questions_id: number;

  // Relations
  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjects_id' })
  subject: Subject;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questions_id' })
  question: Question;
}
