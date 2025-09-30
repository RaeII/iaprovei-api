import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { UserAnswer } from '@/entities/user_answer.entity';
import { Question } from '@/entities/question.entity';
import { SkillCategory } from '@/entities/skill_category.entity';
import { UserStatistics } from '@/entities/user_statistics.entity';
import { UserSkillCategoryStatistics } from '@/entities/user_skill_category_statistics.entity';
import { UserDailyStatistics } from '@/entities/user_daily_statistics.entity';
import { StatisticsFilter, SkillCategoryPerformanceStats, DailyPerformanceStats, PerformanceTrend, UserPerformanceStatsResponse, SkillCategoryPerformanceStatsListResponse, DailyPerformanceStatsListResponse, PerformanceTrendResponse, ComprehensiveUserStatsResponse } from './schemas/statistics.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(UserAnswer)
    private userAnswersRepository: Repository<UserAnswer>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(SkillCategory)
    private skillCategoriesRepository: Repository<SkillCategory>,
    @InjectRepository(UserStatistics)
    private userStatisticsRepository: Repository<UserStatistics>,
    @InjectRepository(UserSkillCategoryStatistics)
    private userSkillCategoryStatisticsRepository: Repository<UserSkillCategoryStatistics>,
    @InjectRepository(UserDailyStatistics)
    private userDailyStatisticsRepository: Repository<UserDailyStatistics>
  ) {}

  /**
   * Get comprehensive user performance statistics
   * Uses pre-calculated statistics from user_statistics table
   */
  async getUserPerformanceStats(userId: number, filters?: StatisticsFilter): Promise<UserPerformanceStatsResponse> {
    const queryBuilder = this.userStatisticsRepository.createQueryBuilder('us').where('us.users_id = :userId', { userId });

    // Apply date filters if provided
    if (filters?.date_from) {
      queryBuilder.andWhere('us.statistics_date >= :dateFrom', { dateFrom: filters.date_from });
    }
    if (filters?.date_to) {
      queryBuilder.andWhere('us.statistics_date <= :dateTo', { dateTo: filters.date_to });
    }

    // Get the latest statistics
    const userStats = await queryBuilder.orderBy('us.statistics_date', 'DESC').getOne();

    if (!userStats) {
      // Return empty stats if no statistics found
      return {
        data: {
          user_id: userId,
          total_questions_answered: 0,
          correct_answers: 0,
          incorrect_answers: 0,
          success_rate: 0,
          error_rate: 0,
          average_response_time: 0,
          total_study_time: 0,
          questions_answered_today: 0,
          questions_answered_this_week: 0,
          questions_answered_this_month: 0,
        },
      };
    }

    return {
      data: {
        user_id: userId,
        total_questions_answered: userStats.total_questions_answered,
        correct_answers: userStats.correct_answers,
        incorrect_answers: userStats.incorrect_answers,
        success_rate: userStats.success_rate,
        error_rate: userStats.error_rate,
        average_response_time: userStats.average_response_time,
        total_study_time: userStats.total_study_time,
        questions_answered_today: userStats.questions_answered_today,
        questions_answered_this_week: userStats.questions_answered_this_week,
        questions_answered_this_month: userStats.questions_answered_this_month,
      },
    };
  }

  /**
   * Get user performance statistics by skill category
   * Uses pre-calculated statistics from user_skill_category_statistics table
   */
  async getUserPerformanceBySkillCategory(userId: number, filters?: StatisticsFilter): Promise<SkillCategoryPerformanceStatsListResponse> {
    const queryBuilder = this.userSkillCategoryStatisticsRepository.createQueryBuilder('uscs').leftJoin('uscs.skill_category', 'sc').where('uscs.users_id = :userId', { userId });

    // Apply filters
    if (filters?.skill_category_id) {
      queryBuilder.andWhere('uscs.skill_category_id = :skillCategoryId', { skillCategoryId: filters.skill_category_id });
    }
    if (filters?.date_from) {
      queryBuilder.andWhere('uscs.statistics_date >= :dateFrom', { dateFrom: filters.date_from });
    }
    if (filters?.date_to) {
      queryBuilder.andWhere('uscs.statistics_date <= :dateTo', { dateTo: filters.date_to });
    }

    // Get the latest statistics for each skill category
    const skillCategoryStats = await queryBuilder.select(['uscs.skill_category_id as skill_category_id', 'sc.name as skill_category_name', 'sc.slug as skill_category_slug', 'uscs.total_questions_answered as total_questions_answered', 'uscs.correct_answers as correct_answers', 'uscs.incorrect_answers as incorrect_answers', 'uscs.success_rate as success_rate', 'uscs.error_rate as error_rate', 'uscs.average_response_time as average_response_time', 'uscs.questions_available as questions_available', 'uscs.completion_percentage as completion_percentage']).orderBy('uscs.statistics_date', 'DESC').getRawMany();

    // Group by skill category and get the latest record for each
    const latestStats = new Map();
    skillCategoryStats.forEach(stat => {
      const skillCategoryId = parseInt(stat.skill_category_id);
      if (!latestStats.has(skillCategoryId)) {
        latestStats.set(skillCategoryId, stat);
      }
    });

    const formattedStats: SkillCategoryPerformanceStats[] = Array.from(latestStats.values()).map(stat => {
      return {
        skill_category_id: parseInt(stat.skill_category_id),
        skill_category_name: stat.skill_category_name || 'Unknown Skill Category',
        skill_category_slug: stat.skill_category_slug || 'unknown-skill-category',
        total_questions_answered: parseInt(stat.total_questions_answered) || 0,
        correct_answers: parseInt(stat.correct_answers) || 0,
        incorrect_answers: parseInt(stat.incorrect_answers) || 0,
        success_rate: Math.round((parseFloat(stat.success_rate) || 0) * 100) / 100,
        error_rate: Math.round((parseFloat(stat.error_rate) || 0) * 100) / 100,
        average_response_time: Math.round((parseFloat(stat.average_response_time) || 0) * 100) / 100,
        questions_available: parseInt(stat.questions_available) || 0,
        completion_percentage: Math.round((parseFloat(stat.completion_percentage) || 0) * 100) / 100,
      };
    });

    return { data: formattedStats };
  }

  /**
   * Get daily performance statistics for a user
   * Uses pre-calculated statistics from user_daily_statistics table
   */
  async getDailyPerformanceStats(userId: number, filters?: StatisticsFilter): Promise<DailyPerformanceStatsListResponse> {
    const queryBuilder = this.userDailyStatisticsRepository.createQueryBuilder('uds').where('uds.users_id = :userId', { userId });

    // Default to last 30 days if no date range provided
    const dateFrom = filters?.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = filters?.date_to || new Date();

    queryBuilder.andWhere('uds.statistics_date >= :dateFrom', { dateFrom }).andWhere('uds.statistics_date <= :dateTo', { dateTo });

    const dailyStats = await queryBuilder.orderBy('uds.statistics_date', 'ASC').getMany();

    const formattedStats: DailyPerformanceStats[] = dailyStats.map(stat => {
      return {
        date: moment(stat.statistics_date).format('YYYY-MM-DD'), // Format as YYYY-MM-DD
        questions_answered: stat.questions_answered,
        correct_answers: stat.correct_answers,
        incorrect_answers: stat.incorrect_answers,
        success_rate: stat.success_rate,
        average_response_time: stat.average_response_time,
        study_time: stat.study_time,
      };
    });

    return { data: formattedStats };
  }

  /**
   * Get performance trend over time
   */
  async getPerformanceTrend(userId: number, filters?: StatisticsFilter): Promise<PerformanceTrendResponse> {
    const period = filters?.period || 'day';
    let groupByClause: string;
    let dateFormat: string;

    switch (period) {
      case 'week':
        groupByClause = 'YEARWEEK(ua.answared_at)';
        dateFormat = 'YEARWEEK(ua.answared_at)';
        break;
      case 'month':
        groupByClause = 'DATE_FORMAT(ua.answared_at, "%Y-%m")';
        dateFormat = 'DATE_FORMAT(ua.answared_at, "%Y-%m")';
        break;
      case 'year':
        groupByClause = 'YEAR(ua.answared_at)';
        dateFormat = 'YEAR(ua.answared_at)';
        break;
      default: // day
        groupByClause = 'DATE(ua.answared_at)';
        dateFormat = 'DATE(ua.answared_at)';
    }

    const queryBuilder = this.userAnswersRepository.createQueryBuilder('ua').where('ua.users_id = :userId', { userId });

    // Apply date filters
    if (filters?.date_from) {
      queryBuilder.andWhere('ua.answared_at >= :dateFrom', { dateFrom: filters.date_from });
    }
    if (filters?.date_to) {
      queryBuilder.andWhere('ua.answared_at <= :dateTo', { dateTo: filters.date_to });
    }

    const trendData = await queryBuilder
      .select([`${dateFormat} as period`, 'COUNT(*) as questions_answered', 'SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers', 'AVG(ua.response_time) as average_response_time'])
      .groupBy(groupByClause)
      .orderBy(`${dateFormat}`, 'ASC')
      .getRawMany();

    const formattedTrend: PerformanceTrend[] = trendData.map(data => {
      const questionsAnswered = parseInt(data.questions_answered) || 0;
      const correct = parseInt(data.correct_answers) || 0;
      const successRate = questionsAnswered > 0 ? (correct / questionsAnswered) * 100 : 0;

      return {
        period: data.period,
        success_rate: Math.round(successRate * 100) / 100,
        questions_answered: questionsAnswered,
        average_response_time: Math.round((parseFloat(data.average_response_time) || 0) * 100) / 100,
      };
    });

    return {
      data: formattedTrend,
      meta: {
        period,
        total_periods: formattedTrend.length,
      },
    };
  }

  /**
   * Get comprehensive statistics for a user
   */
  async getComprehensiveUserStats(userId: number, filters?: StatisticsFilter): Promise<ComprehensiveUserStatsResponse> {
    const [userPerformance, skillCategoryBreakdown, dailyPerformance, performanceTrend] = await Promise.all([this.getUserPerformanceStats(userId, filters), this.getUserPerformanceBySkillCategory(userId, filters), this.getDailyPerformanceStats(userId, filters), this.getPerformanceTrend(userId, filters)]);

    return {
      data: {
        user_performance: userPerformance.data,
        skill_category_breakdown: skillCategoryBreakdown.data,
        daily_performance: dailyPerformance.data,
        performance_trend: performanceTrend.data,
      },
    };
  }

  /**
   * Calculate and update daily statistics for a user
   * This method should be called whenever a user answers questions
   */
  async updateDailyStatistics(userId: number, date?: Date): Promise<UserDailyStatistics> {
    const statisticsDate = moment(date || new Date()).startOf('day');

    // Get or create daily statistics record
    let dailyStats = await this.userDailyStatisticsRepository.findOne({
      where: { users_id: userId, statistics_date: statisticsDate.toDate() },
    });

    // Calculate statistics for this date
    const dayStart = statisticsDate.toDate();
    const dayEnd = statisticsDate.clone().endOf('day').toDate();

    const dayStatsRaw = await this.userAnswersRepository.createQueryBuilder('ua').where('ua.users_id = :userId', { userId }).andWhere('ua.answared_at >= :dayStart', { dayStart }).andWhere('ua.answared_at <= :dayEnd', { dayEnd }).select(['COUNT(*) as questions_answered', 'SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers', 'SUM(CASE WHEN ua.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_answers', 'AVG(ua.response_time) as average_response_time', 'SUM(ua.response_time) as study_time']).getRawOne();

    const questionsAnswered = parseInt(dayStatsRaw.questions_answered) || 0;
    const correctAnswers = parseInt(dayStatsRaw.correct_answers) || 0;
    const incorrectAnswers = parseInt(dayStatsRaw.incorrect_answers) || 0;
    const successRate = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;

    if (dailyStats) {
      // Update existing record
      dailyStats.questions_answered = questionsAnswered;
      dailyStats.correct_answers = correctAnswers;
      dailyStats.incorrect_answers = incorrectAnswers;
      dailyStats.success_rate = Math.round(successRate * 100) / 100;
      dailyStats.average_response_time = Math.round((parseFloat(dayStatsRaw.average_response_time) || 0) * 100) / 100;
      dailyStats.study_time = Math.round((parseFloat(dayStatsRaw.study_time) || 0) * 100) / 100;
      dailyStats.is_streak_day = questionsAnswered > 0;
    } else {
      // Create new record
      dailyStats = this.userDailyStatisticsRepository.create({
        users_id: userId,
        statistics_date: statisticsDate.toDate(),
        questions_answered: questionsAnswered,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        success_rate: Math.round(successRate * 100) / 100,
        average_response_time: Math.round((parseFloat(dayStatsRaw.average_response_time) || 0) * 100) / 100,
        study_time: Math.round((parseFloat(dayStatsRaw.study_time) || 0) * 100) / 100,
        streak_count: 0, // Will be calculated separately
        is_streak_day: questionsAnswered > 0,
      });
    }

    return this.userDailyStatisticsRepository.save(dailyStats);
  }

  /**
   * Calculate and update skill category statistics for a user
   */
  async updateSkillCategoryStatistics(userId: number, skillCategoryId: number, date?: Date): Promise<UserSkillCategoryStatistics> {
    const statisticsDate = moment(date || new Date()).startOf('day');

    // Get or create skill category statistics record
    let skillCategoryStats = await this.userSkillCategoryStatisticsRepository.findOne({
      where: { users_id: userId, skill_category_id: skillCategoryId, statistics_date: statisticsDate.toDate() },
    });

    // Calculate statistics for this skill category and date
    const dayStart = statisticsDate.toDate();
    const dayEnd = statisticsDate.clone().endOf('day').toDate();

    const skillCategoryStatsRaw = await this.userAnswersRepository.createQueryBuilder('ua').leftJoin('ua.question', 'q').leftJoin('q.sub_skill_category', 'sc').where('ua.users_id = :userId', { userId }).andWhere('ua.answared_at >= :dayStart', { dayStart }).andWhere('ua.answared_at <= :dayEnd', { dayEnd }).andWhere('(q.sub_skill_category_id = :skillCategoryId OR sc.father_skill_category_id = :skillCategoryId)', { skillCategoryId }).select(['COUNT(*) as total_attempts', 'COUNT(DISTINCT ua.question_id) as unique_questions_answered', 'SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers', 'SUM(CASE WHEN ua.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_answers', 'AVG(ua.response_time) as average_response_time']).getRawOne();

    // Get total questions available for this skill category (including subcategories)
    const questionsAvailable = await this.questionsRepository.createQueryBuilder('q').leftJoin('q.sub_skill_category', 'sc').where('q.is_active = 1').andWhere('(q.sub_skill_category_id = :skillCategoryId OR sc.father_skill_category_id = :skillCategoryId)', { skillCategoryId }).getCount();

    const totalAttempts = parseInt(skillCategoryStatsRaw.total_attempts) || 0;
    const uniqueQuestionsAnswered = parseInt(skillCategoryStatsRaw.unique_questions_answered) || 0;
    const correct = parseInt(skillCategoryStatsRaw.correct_answers) || 0;
    const incorrect = parseInt(skillCategoryStatsRaw.incorrect_answers) || 0;
    const successRate = totalAttempts > 0 ? (correct / totalAttempts) * 100 : 0;
    const errorRate = totalAttempts > 0 ? (incorrect / totalAttempts) * 100 : 0;
    const completionPercentage = questionsAvailable > 0 ? (uniqueQuestionsAnswered / questionsAvailable) * 100 : 0;

    if (skillCategoryStats) {
      // Update existing record
      skillCategoryStats.total_questions_answered = uniqueQuestionsAnswered;
      skillCategoryStats.correct_answers = correct;
      skillCategoryStats.incorrect_answers = incorrect;
      skillCategoryStats.success_rate = Math.round(successRate * 100) / 100;
      skillCategoryStats.error_rate = Math.round(errorRate * 100) / 100;
      skillCategoryStats.average_response_time = Math.round((parseFloat(skillCategoryStatsRaw.average_response_time) || 0) * 100) / 100;
      skillCategoryStats.questions_available = questionsAvailable;
      skillCategoryStats.completion_percentage = Math.round(completionPercentage * 100) / 100;
    } else {
      // Create new record
      skillCategoryStats = this.userSkillCategoryStatisticsRepository.create({
        users_id: userId,
        skill_category_id: skillCategoryId,
        statistics_date: statisticsDate.toDate(),
        total_questions_answered: uniqueQuestionsAnswered,
        correct_answers: correct,
        incorrect_answers: incorrect,
        success_rate: Math.round(successRate * 100) / 100,
        error_rate: Math.round(errorRate * 100) / 100,
        average_response_time: Math.round((parseFloat(skillCategoryStatsRaw.average_response_time) || 0) * 100) / 100,
        questions_available: questionsAvailable,
        completion_percentage: Math.round(completionPercentage * 100) / 100,
      });
    }

    return this.userSkillCategoryStatisticsRepository.save(skillCategoryStats);
  }

  /**
   * Calculate and update overall user statistics
   */
  async updateUserStatistics(userId: number, date?: Date): Promise<UserStatistics> {
    const statisticsDate = moment(date || new Date()).startOf('day');

    // Get or create user statistics record
    let userStats = await this.userStatisticsRepository.findOne({
      where: { users_id: userId, statistics_date: statisticsDate.toDate() },
    });

    // Calculate overall statistics
    const overallStatsRaw = await this.userAnswersRepository.createQueryBuilder('ua').where('ua.users_id = :userId', { userId }).select(['COUNT(*) as total_questions_answered', 'SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers', 'SUM(CASE WHEN ua.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_answers', 'AVG(ua.response_time) as average_response_time', 'SUM(ua.response_time) as total_study_time']).getRawOne();

    // Calculate time-based statistics using moment.js
    const now = moment();
    const startOfDay = now.clone().startOf('day').toDate();
    const startOfWeek = now.clone().startOf('week').toDate();
    const startOfMonth = now.clone().startOf('month').toDate();

    const timeBasedStats = await Promise.all([
      // Today
      this.userAnswersRepository.createQueryBuilder('ua').where('ua.users_id = :userId', { userId }).andWhere('ua.answared_at >= :startOfDay', { startOfDay }).getCount(),
      // This week
      this.userAnswersRepository.createQueryBuilder('ua').where('ua.users_id = :userId', { userId }).andWhere('ua.answared_at >= :startOfWeek', { startOfWeek }).getCount(),
      // This month
      this.userAnswersRepository.createQueryBuilder('ua').where('ua.users_id = :userId', { userId }).andWhere('ua.answared_at >= :startOfMonth', { startOfMonth }).getCount(),
    ]);

    const totalAnswers = parseInt(overallStatsRaw.total_questions_answered) || 0;
    const correctAnswers = parseInt(overallStatsRaw.correct_answers) || 0;
    const incorrectAnswers = parseInt(overallStatsRaw.incorrect_answers) || 0;
    const successRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const errorRate = totalAnswers > 0 ? (incorrectAnswers / totalAnswers) * 100 : 0;

    if (userStats) {
      // Update existing record
      userStats.total_questions_answered = totalAnswers;
      userStats.correct_answers = correctAnswers;
      userStats.incorrect_answers = incorrectAnswers;
      userStats.success_rate = Math.round(successRate * 100) / 100;
      userStats.error_rate = Math.round(errorRate * 100) / 100;
      userStats.average_response_time = Math.round((parseFloat(overallStatsRaw.average_response_time) || 0) * 100) / 100;
      userStats.total_study_time = Math.round((parseFloat(overallStatsRaw.total_study_time) || 0) * 100) / 100;
      userStats.questions_answered_today = timeBasedStats[0];
      userStats.questions_answered_this_week = timeBasedStats[1];
      userStats.questions_answered_this_month = timeBasedStats[2];
    } else {
      // Create new record
      userStats = this.userStatisticsRepository.create({
        users_id: userId,
        statistics_date: statisticsDate.toDate(),
        total_questions_answered: totalAnswers,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        success_rate: Math.round(successRate * 100) / 100,
        error_rate: Math.round(errorRate * 100) / 100,
        average_response_time: Math.round((parseFloat(overallStatsRaw.average_response_time) || 0) * 100) / 100,
        total_study_time: Math.round((parseFloat(overallStatsRaw.total_study_time) || 0) * 100) / 100,
        questions_answered_today: timeBasedStats[0],
        questions_answered_this_week: timeBasedStats[1],
        questions_answered_this_month: timeBasedStats[2],
      });
    }

    return this.userStatisticsRepository.save(userStats);
  }

  /**
   * Update all statistics for a user (should be called after answering questions)
   */
  async updateAllStatistics(userId: number, skillCategoryId: number, date?: Date): Promise<void> {
    await Promise.all([this.updateUserStatistics(userId, date), this.updateSkillCategoryStatistics(userId, skillCategoryId, date), this.updateDailyStatistics(userId, date)]);
  }
}
