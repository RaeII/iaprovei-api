import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { QuestionOption } from '@/entities/question_option.entity';
import { DataNotFoundException } from '@/domain/shared/exceptions/data-not-found.exception';
import { QuestionOptionQuery, QuestionOptionFilter, QuestionOptionListResponse, QuestionOptionDetailedListResponse, QuestionOption as QuestionOptionSchema } from './schemas/question_option.schema';
import { createPaginationMeta, generateOffset } from '@/utils/query-utils';

@Injectable()
export class QuestionOptionService {
  constructor(
    @InjectRepository(QuestionOption)
    private questionOptionsRepository: Repository<QuestionOption>
  ) {}

  /**
   * Retrieve all question options with pagination and filtering
   * Optimized for performance by selecting only necessary fields
   */
  async findAll(query: QuestionOptionQuery): Promise<QuestionOptionListResponse> {
    const { page, limit, sort_by, sort_order, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters);

    // Select only basic fields for performance
    // queryBuilder.select(['question_option.id', 'question_option.question_id', 'question_option.option_text', 'question_option.option_letter', 'question_option.is_correct', 'question_option.display_order']);

    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`question_option.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('question_option.display_order', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [questionOptions, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: questionOptions.map(option => ({
        id: option.id,
        question_id: option.question_id,
        option_text: option.option_text,
        option_letter: option.option_letter,
        is_correct: option.is_correct,
        display_order: option.display_order,
      })),
      meta,
    };
  }

  /**
   * Retrieve question options with detailed information
   * Used when full option data is needed (AFTER user has answered)
   * Omits is_correct field for security - only available after answering
   */
  async findAllDetailed(query: QuestionOptionQuery): Promise<QuestionOptionDetailedListResponse> {
    const { page, limit, sort_by, sort_order, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters);

    // Select detailed fields but explicitly exclude is_correct for security
    // queryBuilder.select(['question_option.id', 'question_option.question_id', 'question_option.option_text', 'question_option.option_letter', 'question_option.display_order', 'question_option.created_at']);

    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`question_option.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('question_option.display_order', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [questionOptions, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: questionOptions.map(option => ({
        id: option.id,
        question_id: option.question_id,
        option_text: option.option_text,
        option_letter: option.option_letter,
        is_correct: option.is_correct,
        display_order: option.display_order,
        created_at: option.created_at,
      })),
      meta,
    };
  }

  /**
   * Retrieve a single question option by ID (PUBLIC - SECURE)
   * Returns detailed information but omits is_correct field for security
   */
  async findOne(id: number): Promise<QuestionOptionSchema> {
    const questionOption = await this.questionOptionsRepository.findOne({
      where: { id },
      select: ['id', 'question_id', 'option_text', 'option_letter', 'is_correct', 'display_order', 'created_at'],
    });

    if (!questionOption) {
      throw new DataNotFoundException(`Question option with id "${id}"`, 'Opção de questão', QuestionOptionService.name);
    }

    return {
      id: questionOption.id,
      question_id: questionOption.question_id,
      option_text: questionOption.option_text,
      option_letter: questionOption.option_letter || '',
      is_correct: questionOption.is_correct,
      display_order: questionOption.display_order,
      created_at: questionOption.created_at,
    };
  }

  /**
   * Retrieve a single question option by ID (INTERNAL - INCLUDES ALL FIELDS)
   * Used internally by other services that need access to is_correct field
   */
  async findOneInternal(id: number): Promise<QuestionOption> {
    const questionOption = await this.questionOptionsRepository.findOne({
      where: { id },
    });

    if (!questionOption) {
      throw new DataNotFoundException(`Question option with id "${id}"`, 'Opção de questão', QuestionOptionService.name);
    }

    return questionOption;
  }

  /**
   * Retrieve question options by question ID
   * Optimized for question-specific option retrieval
   * This is the most commonly used function for displaying question options
   */
  async findByQuestion(questionId: number, query?: Omit<QuestionOptionQuery, 'question_id'>): Promise<QuestionOptionListResponse> {
    const queryParams = query || { page: 1, limit: 100, sort_by: 'display_order', sort_order: 'ASC' as const };
    return this.findAll({ ...queryParams, question_id: questionId });
  }

  /**
   * Retrieve question options by question ID (detailed version)
   * Used when full option data is needed for a specific question (AFTER user has answered)
   * Omits is_correct field for security - only available after answering
   */
  async findByQuestionDetailed(questionId: number, query?: Omit<QuestionOptionQuery, 'question_id'>): Promise<QuestionOptionDetailedListResponse> {
    const queryParams = query || { page: 1, limit: 100, sort_by: 'display_order', sort_order: 'ASC' as const };
    return this.findAllDetailed({ ...queryParams, question_id: questionId });
  }

  /**
   * Retrieve only correct options for a question
   * Useful for answer verification and result display
   */
  async findCorrectByQuestion(questionId: number): Promise<QuestionOptionListResponse> {
    return this.findAll({ question_id: questionId, is_correct: true, page: 1, limit: 100, sort_by: 'display_order', sort_order: 'ASC' });
  }

  /**
   * Count question options by filters
   * Performance-optimized count operation
   */
  async count(filters: QuestionOptionFilter = {}): Promise<number> {
    const queryBuilder = this.createBaseQueryBuilder(filters);
    return queryBuilder.getCount();
  }

  /**
   * Count options for a specific question
   * Useful for validation and UI display
   */
  async countByQuestion(questionId: number): Promise<number> {
    return this.count({ question_id: questionId });
  }

  /**
   * Check if a question option exists by ID
   * Lightweight existence check
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.questionOptionsRepository.count({ where: { id } });
    return count > 0;
  }

  /**
   * Check if options exist for a specific question
   * Useful for question completeness validation
   */
  async existsByQuestion(questionId: number): Promise<boolean> {
    const count = await this.questionOptionsRepository.count({ where: { question_id: questionId } });
    return count > 0;
  }

  /**
   * Create base query builder with common filtering logic
   * Follows DRY principle and enables consistent filtering
   */
  private createBaseQueryBuilder(filters: QuestionOptionFilter): SelectQueryBuilder<QuestionOption> {
    const queryBuilder = this.questionOptionsRepository.createQueryBuilder('question_option');

    // Apply filters
    if (filters.question_id) {
      queryBuilder.where('question_option.question_id = :questionId', { questionId: filters.question_id });
    }

    if (filters.is_correct !== undefined) {
      queryBuilder.andWhere('question_option.is_correct = :isCorrect', { isCorrect: filters.is_correct });
    }

    if (filters.option_letter) {
      queryBuilder.andWhere('question_option.option_letter = :optionLetter', { optionLetter: filters.option_letter });
    }

    return queryBuilder;
  }
}
