import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { DataNotFoundException } from '@/domain/shared/exceptions/data-not-found.exception';
import { QuestionQuery, QuestionFilter, QuestionListResponse, QuestionDetailedListResponse, QuestionStatsListResponse, QuestionDetail, QuestionEagerDetail } from './schemas/question.schema';
import { createPaginationMeta, generateOffset } from '@/utils/query-utils';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>
  ) {}

  /**
   * Retrieve all questions with pagination and filtering
   * Optimized for performance by selecting only necessary fields
   */
  async findAll(query: QuestionQuery): Promise<QuestionListResponse> {
    const { page, limit, sort_by, sort_order, include_inactive, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters, include_inactive);

    // Select only basic fields for performance
    queryBuilder.select(['question.id', 'question.affirmation', 'question.question_type', 'question.difficulty_level', 'question.exam_board', 'question.exam_year']);

    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`question.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('question.created_at', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [questions, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: questions.map(question => ({
        id: question.id,
        affirmation: question.affirmation,
        question_type: question.question_type,
        difficulty_level: question.difficulty_level,
        exam_board: question.exam_board,
        exam_year: question.exam_year,
      })),
      meta,
    };
  }

  /**
   * Retrieve questions with detailed information
   * Used when full question data is needed
   */
  async findAllDetailed(query: QuestionQuery): Promise<QuestionDetailedListResponse> {
    const { page, limit, sort_by, sort_order, include_inactive, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters, include_inactive);

    // Apply sorting
    if (sort_by) {
      queryBuilder.orderBy(`question.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('question.created_at', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [questions, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: questions,
      meta,
    };
  }

  /**
   * Retrieve questions with statistics only
   * Optimized for analytics and performance tracking
   */
  async findAllStats(query: QuestionQuery): Promise<QuestionStatsListResponse> {
    const { page, limit, sort_by, sort_order, include_inactive, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters, include_inactive);

    // Select only statistics fields for performance
    queryBuilder.select(['question.id', 'question.total_attempts', 'question.correct_attempts', 'question.success_rate', 'question.complexity_score']);

    // Apply sorting with stats-specific defaults
    if (sort_by) {
      queryBuilder.orderBy(`question.${sort_by}`, sort_order);
    } else {
      queryBuilder.orderBy('question.success_rate', sort_order);
    }

    // Apply pagination
    const offset = generateOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    const [questions, total] = await queryBuilder.getManyAndCount();

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: questions.map(question => ({
        id: question.id,
        total_attempts: question.total_attempts,
        correct_attempts: question.correct_attempts,
        success_rate: question.success_rate,
        complexity_score: question.complexity_score,
      })),
      meta,
    };
  }

  /**
   * Retrieve a single question by ID with full details
   * Includes related subject information
   */
  async findOne(id: number): Promise<QuestionDetail> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['subject'],
    });

    if (!question) {
      throw new DataNotFoundException(`Question with id "${id}"`, 'Questão', QuestionService.name);
    }

    return {
      ...question,
      subject: question.subject
        ? {
            id: question.subject.id,
            name: question.subject.name,
          }
        : undefined,
    };
  }

  /**
   * Retrieve a single question by ID with full details
   * Includes related subject and contest information
   */
  async findOneEager(id: number): Promise<QuestionEagerDetail> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['subject', 'subject.contest'],
    });

    if (!question) {
      throw new DataNotFoundException(`Question with id "${id}"`, 'Questão', QuestionService.name);
    }

    return {
      ...question,
      subject: question.subject
        ? {
            id: question.subject.id,
            name: question.subject.name,
          }
        : undefined,
      contest: question.subject?.contest ? question.subject?.contest : undefined,
    };
  }

  /**
   * Retrieve questions by subject ID
   * Optimized for subject-specific question retrieval
   */
  async findBySubject(subjectId: number, query: Omit<QuestionQuery, 'subject_id'>): Promise<QuestionListResponse> {
    return this.findAll({ ...query, subject_id: subjectId });
  }

  /**
   * Count questions by filters
   * Performance-optimized count operation
   */
  async count(filters: QuestionFilter = {}): Promise<number> {
    const queryBuilder = this.createBaseQueryBuilder(filters, filters.is_active === false);
    return queryBuilder.getCount();
  }

  /**
   * Check if a question exists by ID
   * Lightweight existence check
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.questionsRepository.count({ where: { id } });
    return count > 0;
  }

  /**
   * Create base query builder with common filtering logic
   * Follows DRY principle and enables consistent filtering
   */
  private createBaseQueryBuilder(filters: QuestionFilter, includeInactive: boolean): SelectQueryBuilder<Question> {
    const queryBuilder = this.questionsRepository.createQueryBuilder('question');

    // Apply filters
    if (!includeInactive) {
      queryBuilder.where('question.is_active = :isActive', { isActive: true });
    }

    if (filters.subject_id) {
      queryBuilder.andWhere('question.subject_id = :subjectId', { subjectId: filters.subject_id });
    }

    if (filters.question_type) {
      queryBuilder.andWhere('question.question_type = :questionType', { questionType: filters.question_type });
    }

    if (filters.difficulty_level) {
      queryBuilder.andWhere('question.difficulty_level = :difficultyLevel', {
        difficultyLevel: filters.difficulty_level,
      });
    }

    if (filters.exam_board) {
      queryBuilder.andWhere('question.exam_board = :examBoard', { examBoard: filters.exam_board });
    }

    if (filters.exam_year) {
      queryBuilder.andWhere('question.exam_year = :examYear', { examYear: filters.exam_year });
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('question.is_active = :isActive', { isActive: filters.is_active });
    }

    return queryBuilder;
  }
}
