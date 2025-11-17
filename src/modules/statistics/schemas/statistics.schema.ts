import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';
import { PaginationMetaSchema, PaginationSchema } from '@/common/schemas/pagination.schema';

// User statistics entity schema
export const UserStatisticsSchema = z.object({
  id: z.number(),
  users_id: z.number(),
  statistics_date: z.date(),
  total_questions_answered: z.number().min(0).default(0),
  correct_answers: z.number().min(0).default(0),
  incorrect_answers: z.number().min(0).default(0),
  success_rate: z.number().min(0).max(100).default(0),
  error_rate: z.number().min(0).max(100).default(0),
  average_response_time: z.number().min(0).default(0),
  total_study_time: z.number().min(0).default(0),
  questions_answered_today: z.number().min(0).default(0),
  questions_answered_this_week: z.number().min(0).default(0),
  questions_answered_this_month: z.number().min(0).default(0),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

// User skill category statistics entity schema
export const UserSkillCategoryStatisticsSchema = z.object({
  id: z.number(),
  users_id: z.number(),
  skill_category_id: z.number(),
  statistics_date: z.date(),
  total_questions_answered: z.number().min(0).default(0),
  correct_answers: z.number().min(0).default(0),
  incorrect_answers: z.number().min(0).default(0),
  success_rate: z.number().min(0).max(100).default(0),
  error_rate: z.number().min(0).max(100).default(0),
  average_response_time: z.number().min(0).default(0),
  questions_available: z.number().min(0).default(0),
  completion_percentage: z.number().min(0).max(100).default(0),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

// User daily statistics entity schema
export const UserDailyStatisticsSchema = z.object({
  id: z.number(),
  users_id: z.number(),
  statistics_date: z.date(),
  questions_answered: z.number().min(0).default(0),
  correct_answers: z.number().min(0).default(0),
  incorrect_answers: z.number().min(0).default(0),
  success_rate: z.number().min(0).max(100).default(0),
  average_response_time: z.number().min(0).default(0),
  study_time: z.number().min(0).default(0),
  streak_count: z.number().min(0).default(0),
  is_streak_day: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date().nullable(),
});

// OpenAPI schemas
export const userStatisticsOpenapi: any = zodToOpenAPI(UserStatisticsSchema);
export const userSkillCategoryStatisticsOpenapi: any = zodToOpenAPI(UserSkillCategoryStatisticsSchema);
export const userDailyStatisticsOpenapi: any = zodToOpenAPI(UserDailyStatisticsSchema);

// Type exports
export type UserStatistics = z.infer<typeof UserStatisticsSchema>;
export type UserSkillCategoryStatistics = z.infer<typeof UserSkillCategoryStatisticsSchema>;
export type UserDailyStatistics = z.infer<typeof UserDailyStatisticsSchema>;

// Derived schemas for API responses - created from base entity schemas
export const UserPerformanceStatsSchema = UserStatisticsSchema.pick({
  total_questions_answered: true,
  correct_answers: true,
  incorrect_answers: true,
  success_rate: true,
  error_rate: true,
  average_response_time: true,
  total_study_time: true,
  questions_answered_today: true,
  questions_answered_this_week: true,
  questions_answered_this_month: true,
}).extend({
  user_id: z.number(), // Alias for users_id in API responses
});

export const SkillCategoryPerformanceStatsSchema = UserSkillCategoryStatisticsSchema.pick({
  skill_category_id: true,
  total_questions_answered: true,
  correct_answers: true,
  incorrect_answers: true,
  success_rate: true,
  error_rate: true,
  average_response_time: true,
  questions_available: true,
  completion_percentage: true,
}).extend({
  skill_category_name: z.string(),
  skill_category_slug: z.string(),
});

export const DailyPerformanceStatsSchema = UserDailyStatisticsSchema.pick({
  questions_answered: true,
  correct_answers: true,
  incorrect_answers: true,
  success_rate: true,
  average_response_time: true,
  study_time: true,
}).extend({
  date: z.string(), // YYYY-MM-DD format for API responses
});

// Performance trend schema - derived from daily stats
export const PerformanceTrendSchema = UserDailyStatisticsSchema.pick({
  success_rate: true,
  questions_answered: true,
  average_response_time: true,
}).extend({
  period: z.string(), // Date or period identifier
});

// Filter schemas
export const StatisticsFilterSchema = z.object({
  user_id: z.coerce.number().optional(),
  skill_category_id: z.coerce.number().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('day'),
});

export const StatisticsQuerySchema = StatisticsFilterSchema.merge(PaginationSchema);

// Response schemas
export const UserPerformanceStatsResponseSchema = z.object({
  data: UserPerformanceStatsSchema,
});

export const SkillCategoryPerformanceStatsListResponseSchema = z.object({
  data: z.array(SkillCategoryPerformanceStatsSchema),
  meta: PaginationMetaSchema.optional(),
});

export const DailyPerformanceStatsListResponseSchema = z.object({
  data: z.array(DailyPerformanceStatsSchema),
  meta: PaginationMetaSchema.optional(),
});

export const PerformanceTrendResponseSchema = z.object({
  data: z.array(PerformanceTrendSchema),
  meta: z.object({
    period: z.string(),
    total_periods: z.number(),
  }),
});

// Comprehensive user statistics schema
export const ComprehensiveUserStatsSchema = z.object({
  user_performance: UserPerformanceStatsSchema,
  skill_category_breakdown: z.array(SkillCategoryPerformanceStatsSchema),
  daily_performance: z.array(DailyPerformanceStatsSchema),
  performance_trend: z.array(PerformanceTrendSchema),
});

export const ComprehensiveUserStatsResponseSchema = z.object({
  data: ComprehensiveUserStatsSchema,
});

// OpenAPI schemas
export const userPerformanceStatsOpenapi: any = zodToOpenAPI(UserPerformanceStatsSchema);
export const skillCategoryPerformanceStatsOpenapi: any = zodToOpenAPI(SkillCategoryPerformanceStatsSchema);
export const dailyPerformanceStatsOpenapi: any = zodToOpenAPI(DailyPerformanceStatsSchema);
export const performanceTrendOpenapi: any = zodToOpenAPI(PerformanceTrendSchema);
export const statisticsFilterOpenapi: any = zodToOpenAPI(StatisticsFilterSchema);
export const statisticsQueryOpenapi: any = zodToOpenAPI(StatisticsQuerySchema);
export const userPerformanceStatsResponseOpenapi: any = zodToOpenAPI(UserPerformanceStatsResponseSchema);
export const skillCategoryPerformanceStatsListResponseOpenapi: any = zodToOpenAPI(
  SkillCategoryPerformanceStatsListResponseSchema
);
export const dailyPerformanceStatsListResponseOpenapi: any = zodToOpenAPI(DailyPerformanceStatsListResponseSchema);
export const performanceTrendResponseOpenapi: any = zodToOpenAPI(PerformanceTrendResponseSchema);
export const comprehensiveUserStatsResponseOpenapi: any = zodToOpenAPI(ComprehensiveUserStatsResponseSchema);

// Type exports
export type UserPerformanceStats = z.infer<typeof UserPerformanceStatsSchema>;
export type SkillCategoryPerformanceStats = z.infer<typeof SkillCategoryPerformanceStatsSchema>;
export type DailyPerformanceStats = z.infer<typeof DailyPerformanceStatsSchema>;
export type PerformanceTrend = z.infer<typeof PerformanceTrendSchema>;
export type StatisticsFilter = z.infer<typeof StatisticsFilterSchema>;
export type StatisticsQuery = z.infer<typeof StatisticsQuerySchema>;
export type UserPerformanceStatsResponse = z.infer<typeof UserPerformanceStatsResponseSchema>;
export type SkillCategoryPerformanceStatsListResponse = z.infer<typeof SkillCategoryPerformanceStatsListResponseSchema>;
export type DailyPerformanceStatsListResponse = z.infer<typeof DailyPerformanceStatsListResponseSchema>;
export type PerformanceTrendResponse = z.infer<typeof PerformanceTrendResponseSchema>;
export type ComprehensiveUserStats = z.infer<typeof ComprehensiveUserStatsSchema>;
export type ComprehensiveUserStatsResponse = z.infer<typeof ComprehensiveUserStatsResponseSchema>;
