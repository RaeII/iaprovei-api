import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserAnswer } from '@/entities/user_answer.entity';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { UserAnswerCreate, UserAnswerQuery, UserAnswerFilter, UserAnswerInternalFilter, UserAnswerListResponse, UserAnswerDetailedListResponse, UserAnswerPerformanceListResponse, UserAnswerSessionListResponse, UserAnswerDetail, UserAnswerCountResponse, UserAnswerStatsResponse, UserAnswerCreateResponse } from './schemas/user_answer.schema';
import { createPaginationMeta, generateOffset } from '@/common/utils/query-utils';
import { QuestionOptionService } from '@/modules/question_option/question_option.service';
import { QuestionService } from '@/modules/question/question.service';

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectRepository(UserAnswer)
    private userAnswersRepository: Repository<UserAnswer>,
    private questionOptionService: QuestionOptionService,
    private questionService: QuestionService
  ) {}

  /**
   * Create a new user answer
   * Validates the chosen option and determines correctness automatically
   * Session ID is provided by the controller decorator
   * Returns both the user answer and correct answer information
   */
  async create(createUserAnswerDto: UserAnswerCreate, sessionId: string): Promise<UserAnswerCreateResponse> {
    // Get the chosen option to validate it exists and check correctness
    const chosenOption = await this.questionOptionService.findOneInternal(createUserAnswerDto.option_id);

    // Get all correct options for this question to return in response
    const correctOptionsResponse = await this.questionOptionService.findCorrectByQuestion(chosenOption.question_id);

    // Create the user answer with system-determined correctness and provided session_id
    const newUserAnswer = this.userAnswersRepository.create({
      ...createUserAnswerDto,
      session_id: sessionId, // Session ID provided by controller decorator
      is_correct: chosenOption.is_correct, // System determines this based on the chosen option
      answared_at: new Date(),
    });

    const savedUserAnswer = await this.userAnswersRepository.save(newUserAnswer);

    // Remove session_id from the response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { session_id: _, ...userAnswerResponse } = savedUserAnswer;

    // Initialize response data
    const responseData: any = {
      user_answer: userAnswerResponse,
      is_correct: chosenOption.is_correct,
      correct_options: correctOptionsResponse.data.map(option => ({
        id: option.id,
        option_text: option.option_text,
        option_letter: option.option_letter,
      })),
    };

    return { data: responseData };
  }

  /**
   * Retrieve user answers with pagination and filtering (basic view)
   * Optimized for performance by selecting only essential fields
   */
  async findAll(query: UserAnswerQuery, userId?: number): Promise<UserAnswerListResponse> {
    const { page, limit, sort_by, sort_order, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters);
    if (userId) {
      queryBuilder.where('userAnswer.users_id = :userId', { userId });
    }

    // Select only basic fields for performance
    queryBuilder.select(['userAnswer.id', 'userAnswer.users_id', 'userAnswer.question_id', 'userAnswer.option_id', 'userAnswer.is_correct', 'userAnswer.answared_at']);

    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`userAnswer.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('userAnswer.answared_at', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [userAnswers, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: userAnswers.map(answer => ({
        id: answer.id,
        users_id: answer.users_id,
        question_id: answer.question_id,
        option_id: answer.option_id,
        is_correct: answer.is_correct,
        answared_at: answer.answared_at,
      })),
      meta,
    };
  }

  /**
   * Retrieve user answers with all details
   * Includes all fields for comprehensive analysis (excludes session_id from response)
   */
  async findAllDetailed(query: UserAnswerQuery): Promise<UserAnswerDetailedListResponse> {
    const { page, limit, sort_by, sort_order, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters);

    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`userAnswer.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('userAnswer.answared_at', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [userAnswers, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    // Remove session_id from each answer before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sanitizedAnswers = userAnswers.map(({ session_id: _, ...answer }) => answer);

    return {
      data: sanitizedAnswers,
      meta,
    };
  }

  /**
   * Retrieve user answers for performance analysis
   * Optimized for analytics and performance tracking
   */
  async findAllPerformance(query: UserAnswerQuery, userId: number): Promise<UserAnswerPerformanceListResponse> {
    const { page, limit, sort_by, sort_order, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters);

    // Select performance-relevant fields
    queryBuilder.select(['userAnswer.id', 'userAnswer.users_id', 'userAnswer.question_id', 'userAnswer.is_correct', 'userAnswer.response_time', 'userAnswer.confidence_level', 'userAnswer.difficulty_at_time', 'userAnswer.used_hint']);
    queryBuilder.where('userAnswer.users_id = :userId', { userId });
    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`userAnswer.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('userAnswer.response_time', 'ASC'); // Default to fastest responses first
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [userAnswers, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: userAnswers.map(answer => ({
        id: answer.id,
        users_id: answer.users_id,
        question_id: answer.question_id,
        is_correct: answer.is_correct,
        response_time: answer.response_time,
        confidence_level: answer.confidence_level,
        difficulty_at_time: answer.difficulty_at_time,
        used_hint: answer.used_hint,
      })),
      meta,
    };
  }

  /**
   * Retrieve user answers by session
   * Optimized for session tracking and progress monitoring (excludes session_id from response)
   */
  async findAllBySession(query: UserAnswerQuery, userId: number): Promise<UserAnswerSessionListResponse> {
    const { page, limit, sort_by, sort_order, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters);

    // Select session-relevant fields (excluding session_id from selection)
    queryBuilder.select(['userAnswer.id', 'userAnswer.users_id', 'userAnswer.is_correct', 'userAnswer.response_time', 'userAnswer.answared_at']);
    queryBuilder.where('userAnswer.users_id = :userId', { userId });
    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`userAnswer.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('userAnswer.answared_at', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [userAnswers, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: userAnswers.map(answer => ({
        id: answer.id,
        users_id: answer.users_id,
        is_correct: answer.is_correct,
        response_time: answer.response_time,
        answared_at: answer.answared_at,
      })),
      meta,
    };
  }

  /**
   * Retrieve single user answer with full details and relationships (excludes session_id)
   */
  async findOne(id: number): Promise<UserAnswerDetail> {
    const userAnswer = await this.userAnswersRepository.findOne({
      where: { id },
      relations: ['user', 'question', 'option'],
      select: {
        user: {
          id: true,
          username: true,
          full_name: true,
        },
        question: {
          id: true,
          affirmation: true,
          difficulty_level: true,
        },
        option: {
          id: true,
          option_text: true,
          option_letter: true,
        },
      },
    });

    if (!userAnswer) {
      throw new DataNotFoundException(`UserAnswer with id "${id}"`, 'Resposta do Usuário', UserAnswerService.name);
    }

    // Remove session_id from the response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { session_id: _, ...sanitizedAnswer } = userAnswer;
    return sanitizedAnswer;
  }

  /**
   * Get count of user answers with filtering
   */
  async count(filters: UserAnswerFilter): Promise<UserAnswerCountResponse> {
    const queryBuilder = this.createBaseQueryBuilder(filters);
    const count = await queryBuilder.getCount();

    return {
      data: { count },
    };
  }

  /**
   * Get user answer statistics
   * Optimized aggregation query for performance analytics
   */
  async getStats(filters: UserAnswerFilter, userId: number): Promise<UserAnswerStatsResponse> {
    const queryBuilder = this.createBaseQueryBuilder(filters);
    queryBuilder.where('userAnswer.users_id = :userId', { userId });

    // eslint-disable-next-line prettier/prettier
    const result = await queryBuilder
      .select([
        'COUNT(*) as total_answers',
        'SUM(CASE WHEN userAnswer.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers',
        'SUM(CASE WHEN userAnswer.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_answers',
        'AVG(userAnswer.response_time) as avg_response_time',
        'AVG(userAnswer.confidence_level) as avg_confidence_level',
      ])
      .getRawOne();

    const totalAnswers = parseInt(result.total_answers) || 0;
    const correctAnswers = parseInt(result.correct_answers) || 0;
    const incorrectAnswers = parseInt(result.incorrect_answers) || 0;
    const successRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    return {
      data: {
        total_answers: totalAnswers,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        success_rate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
        average_response_time: Math.round((parseFloat(result.avg_response_time) || 0) * 100) / 100,
        average_confidence_level: Math.round((parseFloat(result.avg_confidence_level) || 0) * 100) / 100,
      },
    };
  }

  /**
   * Gather all necessary data for AI correction request
   * Gets question with full relationship chain and all options
   * Optimized for AI service requirements with parallel API calls
   */
  async gatherAiRequestData(
    questionId: number,
    chosenOptionId?: number
  ): Promise<{
    question: any;
    all_options: any[];
    chosen_option: any;
    correct_options: any[];
  }> {
    // Run independent API calls in parallel for better performance
    // eslint-disable-next-line prettier/prettier
    const [question, allOptionsResponse, chosenOption, correctOptionsResponse] = await Promise.all([
      this.questionService.findOneEager(questionId),
      this.questionOptionService.findByQuestion(questionId),
      chosenOptionId ? this.questionOptionService.findOneInternal(chosenOptionId) : null,
      this.questionOptionService.findCorrectByQuestion(questionId),
    ]);

    return {
      question,
      all_options: allOptionsResponse.data,
      chosen_option: chosenOption,
      correct_options: correctOptionsResponse.data,
    };
  }

  /**
   * Create base query builder with common filtering logic
   * Follows DRY principle and enables consistent filtering across methods
   * Uses internal filter type to support session_id filtering when needed
   */
  private createBaseQueryBuilder(filters: UserAnswerFilter | UserAnswerInternalFilter): SelectQueryBuilder<UserAnswer> {
    const queryBuilder = this.userAnswersRepository.createQueryBuilder('userAnswer');

    // Apply filters
    if (filters.users_id) {
      queryBuilder.andWhere('userAnswer.users_id = :usersId', { usersId: filters.users_id });
    }

    if (filters.question_id) {
      queryBuilder.andWhere('userAnswer.question_id = :questionId', { questionId: filters.question_id });
    }

    if (filters.option_id) {
      queryBuilder.andWhere('userAnswer.option_id = :optionId', { optionId: filters.option_id });
    }

    if (filters.is_correct !== undefined) {
      queryBuilder.andWhere('userAnswer.is_correct = :isCorrect', { isCorrect: filters.is_correct });
    }

    // session_id filtering only available for internal operations (temporarily disabled)
    // TODO: Implement session_id filtering for internal operations when needed
    // if (this.isInternalFilter(filters) && filters.session_id) {
    //   queryBuilder.andWhere('userAnswer.session_id = :sessionId', { sessionId: filters.session_id });
    // }

    if (filters.used_hint !== undefined) {
      queryBuilder.andWhere('userAnswer.used_hint = :usedHint', { usedHint: filters.used_hint });
    }

    if (filters.confidence_level_min !== undefined) {
      queryBuilder.andWhere('userAnswer.confidence_level >= :confidenceLevelMin', {
        confidenceLevelMin: filters.confidence_level_min,
      });
    }

    if (filters.confidence_level_max !== undefined) {
      queryBuilder.andWhere('userAnswer.confidence_level <= :confidenceLevelMax', {
        confidenceLevelMax: filters.confidence_level_max,
      });
    }

    if (filters.difficulty_at_time_min !== undefined) {
      queryBuilder.andWhere('userAnswer.difficulty_at_time >= :difficultyAtTimeMin', {
        difficultyAtTimeMin: filters.difficulty_at_time_min,
      });
    }

    if (filters.difficulty_at_time_max !== undefined) {
      queryBuilder.andWhere('userAnswer.difficulty_at_time <= :difficultyAtTimeMax', {
        difficultyAtTimeMax: filters.difficulty_at_time_max,
      });
    }

    if (filters.answered_after) {
      queryBuilder.andWhere('userAnswer.answared_at >= :answeredAfter', { answeredAfter: filters.answered_after });
    }

    if (filters.answered_before) {
      queryBuilder.andWhere('userAnswer.answared_at <= :answeredBefore', { answeredBefore: filters.answered_before });
    }

    return queryBuilder;
  }
}
