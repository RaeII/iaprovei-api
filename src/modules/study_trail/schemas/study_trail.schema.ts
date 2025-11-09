import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Base schemas
export const StudyTrailCreateSchema = z.object({
  skill_category_id: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  generation_model: z.enum(['adaptive', 'all_questions_by_difficulty']).optional().default('adaptive'),
});

export const StudyTrailUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
});

export const StudyTrailStopStartSchema = z.object({
  study_trail_id: z.number().int().positive(),
  stop_position: z.number().int().min(1).max(5),
});

export const StudyTrailStopAnswerSchema = z.object({
  study_trail_stop_id: z.number().int().positive(),
  question_id: z.number().int().positive(),
  selected_option_id: z.number().int().positive().optional(),
  response_time_seconds: z.number().min(0).optional(),
  used_hint: z.boolean().optional(),
  confidence_level: z.number().min(0).max(100).optional(),
});

export const StudyTrailStopPerformanceSchema = z.object({
  stop_id: z.number(),
  stop_name: z.string(),
  total_questions: z.number(),
  questions_answered: z.number(),
  correct_answers: z.number(),
  incorrect_answers: z.number(),
  success_rate: z.number(),
  average_response_time: z.number(),
  total_xp_earned: z.number(),
  performance_grade: z.enum(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'S']).optional(),
  is_completed: z.boolean(),
  can_retry: z.boolean(),
  next_stop_unlocked: z.boolean(),
  streak_bonus: z.number().optional(),
  speed_bonus: z.number().optional(),
  accuracy_bonus: z.number().optional(),
});

// Response schemas
export const StudyTrailSummarySchema = z.object({
  id: z.number(),
  skill_category_id: z.number(),
  skill_category_name: z.string(),
  name: z.string(),
  status: z.enum(['active', 'completed', 'paused']),
  generation_model: z.enum(['adaptive', 'all_questions_by_difficulty']),
  current_stop_position: z.number(),
  total_stops: z.number(),
  completion_percentage: z.number(),
  total_xp_earned: z.number(),
  average_performance: z.number(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

export const StudyTrailStopSummarySchema = z.object({
  id: z.number(),
  position_order: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  stop_type: z.enum(['lesson', 'practice', 'challenge', 'review']),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
  status: z.enum(['locked', 'available', 'in_progress', 'completed', 'failed']),
  total_questions: z.number(),
  questions_answered: z.number(),
  correct_answers: z.number(),
  success_rate: z.number(),
  xp_reward: z.number(),
  xp_earned: z.number(),
  estimated_duration_minutes: z.number(),
  minimum_success_rate: z.number(),
  performance: StudyTrailStopPerformanceSchema.optional(),
});

export const StudyTrailDetailsSchema = StudyTrailSummarySchema.extend({
  description: z.string().nullable(),
  stops: z.array(StudyTrailStopSummarySchema),
});

export const StudyTrailStopQuestionSchema = z.object({
  id: z.number(),
  question_id: z.number(),
  question_order: z.number(),
  answer_status: z.enum(['not_answered', 'correct', 'incorrect', 'skipped']),
  response_time_seconds: z.number(),
  used_hint: z.boolean(),
  confidence_level: z.number().nullable(),
  xp_earned: z.number(),
  question: z.object({
    id: z.number(),
    affirmation: z.string(),
    image_url: z.string().nullable(),
    question_type: z.enum(['multiple_choice', 'true_false', 'essay']),
    difficulty_level: z.enum(['easy', 'medium', 'hard']),
    learning_tip: z.string().nullable(),
    explanation: z.string().nullable(),
    question_options: z
      .array(
        z.object({
          id: z.number(),
          option_text: z.string(),
          is_correct: z.boolean(),
          explanation: z.string().nullable(),
        })
      )
      .optional(),
  }),
});

export const StudyTrailStopDetailsSchema = StudyTrailStopSummarySchema.extend({
  questions: z.array(StudyTrailStopQuestionSchema),
});

export const StudyTrailProgressSchema = z.object({
  study_trail_id: z.number(),
  current_stop: StudyTrailStopSummarySchema,
  progress_percentage: z.number(),
  total_xp_earned: z.number(),
  performance_summary: z.object({
    total_questions_answered: z.number(),
    correct_answers: z.number(),
    success_rate: z.number(),
    average_response_time: z.number(),
  }),
});

// DTOs
export class StudyTrailCreate extends createZodDto(StudyTrailCreateSchema) {}
export class StudyTrailUpdate extends createZodDto(StudyTrailUpdateSchema) {}
export class StudyTrailStopStart extends createZodDto(StudyTrailStopStartSchema) {}
export class StudyTrailStopAnswer extends createZodDto(StudyTrailStopAnswerSchema) {}

// Response types
export type StudyTrailSummary = z.infer<typeof StudyTrailSummarySchema>;
export type StudyTrailDetails = z.infer<typeof StudyTrailDetailsSchema>;
export type StudyTrailStopSummary = z.infer<typeof StudyTrailStopSummarySchema>;
export type StudyTrailStopDetails = z.infer<typeof StudyTrailStopDetailsSchema>;
export type StudyTrailStopQuestion = z.infer<typeof StudyTrailStopQuestionSchema>;
export type StudyTrailStopPerformance = z.infer<typeof StudyTrailStopPerformanceSchema>;
export type StudyTrailProgress = z.infer<typeof StudyTrailProgressSchema>;

// OpenAPI schemas (usando os schemas diretamente)
export const studyTrailCreateOpenapi = StudyTrailCreateSchema;
export const studyTrailUpdateOpenapi = StudyTrailUpdateSchema;
export const studyTrailStopStartOpenapi = StudyTrailStopStartSchema;
export const studyTrailStopAnswerOpenapi = StudyTrailStopAnswerSchema;
export const studyTrailSummaryOpenapi = StudyTrailSummarySchema;
export const studyTrailDetailsOpenapi = StudyTrailDetailsSchema;
export const studyTrailProgressOpenapi = StudyTrailProgressSchema;
