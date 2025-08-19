import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { UserAnswer } from '@/entities/user_answer.entity';
import { QuestionStatementText } from '@/entities/question_statement_text.entity';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { QuestionQuery, QuestionFilter, QuestionListResponse, QuestionDetailedListResponse, QuestionStatsListResponse, QuestionDetail, QuestionEagerDetail, QuestionWithUserQuestionProgressionResponse } from './schemas/question.schema';
import { createPaginationMeta, generateOffset } from '@/common/utils/query-utils';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(UserAnswer)
    private userAnswersRepository: Repository<UserAnswer>,
    @InjectRepository(QuestionStatementText)
    private questionStatementTextRepository: Repository<QuestionStatementText>
  ) {}

  /**
   * Retrieve all questions with pagination and filtering
   * Optimized for performance by selecting only necessary fields
   * Includes last user answer if userId is provided
   */
  async findAll(query: QuestionQuery, userId?: number): Promise<QuestionListResponse> {
    const { page, limit, sort_by, sort_order, include_inactive, include_options, ...filters } = query;

    const queryBuilder = this.createBaseQueryBuilder(filters, include_inactive);

    // Select only basic fields for performance (including created_at for sorting)
    queryBuilder.select(['question.id', 'question.affirmation', 'question.question_type', 'question.difficulty_level', 'question.exam_board', 'question.exam_year', 'question.created_at', 'question.statement', 'question.question_statement_text_id']);

    // Always include sub_skill_category relation to get the name
    queryBuilder.leftJoinAndSelect('question.sub_skill_category', 'subSkillCategory');

    // Conditionally include question options if requested
    if (include_options) {
      queryBuilder.leftJoinAndSelect('question.question_options', 'questionOptions');
    }

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

    // Build user progression if applicable
    let userQuestionProgression = [] as any[];
    if (userId && questions.length > 0 && query?.subject_id) {
      const lastAnsweredQuestionId = await this.getLastAnsweredQuestionIdForSubject(userId, query.subject_id);
      if (lastAnsweredQuestionId) {
        const filteredQuestions = questions[questions.length - 1].id === lastAnsweredQuestionId ? questions : questions.filter(q => q.id > lastAnsweredQuestionId);
        userQuestionProgression = filteredQuestions.map(q => {
          const tq = this.transformQuestionWithSubCategory(q);
          return {
            id: tq.id,
            affirmation: tq.affirmation,
            question_type: tq.question_type,
            difficulty_level: tq.difficulty_level,
            exam_board: tq.exam_board,
            exam_year: tq.exam_year,
            statement: tq.statement,
            question_statement_text_id: tq.question_statement_text_id,
            ...(tq.sub_skill_category_name && { sub_skill_category_name: tq.sub_skill_category_name }),
          };
        });
      } else {
        userQuestionProgression = questions.map(q => {
          const tq = this.transformQuestionWithSubCategory(q);
          return {
            id: tq.id,
            affirmation: tq.affirmation,
            question_type: tq.question_type,
            difficulty_level: tq.difficulty_level,
            exam_board: tq.exam_board,
            exam_year: tq.exam_year,
            statement: tq.statement,
            question_statement_text_id: tq.question_statement_text_id,
            ...(tq.sub_skill_category_name && { sub_skill_category_name: tq.sub_skill_category_name }),
          };
        });
      }
    }

    // Collect unique statement text IDs from both questions and progression to avoid duplicates
    const statementTextIds = Array.from(new Set([...questions.map(q => q.question_statement_text_id).filter((v): v is number => !!v), ...userQuestionProgression.map(q => q.question_statement_text_id).filter((v): v is number => !!v)]));

    // Load the statement texts for the collected IDs
    let statements_texts: Record<string, string> = {};
    if (statementTextIds.length > 0) {
      const statementRows = await this.questionStatementTextRepository.find({ where: { id: In(statementTextIds) } });
      statements_texts = statementRows.reduce<Record<string, string>>((acc, row) => {
        acc[String(row.id)] = row.text || '';
        return acc;
      }, {});
    }

    const meta = createPaginationMeta(total, page, limit);

    return {
      data: {
        questions: questions.map(q => {
          const tq = this.transformQuestionWithSubCategory(q);
          return {
            id: tq.id,
            affirmation: tq.affirmation,
            question_type: tq.question_type,
            difficulty_level: tq.difficulty_level,
            exam_board: tq.exam_board,
            exam_year: tq.exam_year,
            statement: tq.statement,
            question_statement_text_id: tq.question_statement_text_id,
            ...(tq.sub_skill_category_name && { sub_skill_category_name: tq.sub_skill_category_name }),
            ...(include_options && {
              question_options:
                tq.question_options?.map(option => ({
                  id: option.id,
                  option_text: option.option_text,
                  option_letter: option.option_letter,
                  is_correct: option.is_correct,
                  display_order: option.display_order,
                })) || [],
            }),
          };
        }),
        ...(userId && query?.subject_id && { user_question_progression: userQuestionProgression }),
        statements_texts,
      },
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
      relations: ['subject', 'subject.skill_category', 'sub_skill_category'],
    });

    if (!question) {
      throw new DataNotFoundException(`Question with id "${id}"`, 'Questão', QuestionService.name);
    }

    return this.transformQuestionWithSubCategory({
      ...question,
      subject: question.subject
        ? {
            id: question.subject.id,
            name: question.subject.skill_category?.name || '',
          }
        : undefined,
    });
  }

  /**
   * Retrieve a single question by ID with full details
   * Includes related subject and contest information
   */
  async findOneEager(id: number): Promise<QuestionEagerDetail> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['subject', 'subject.contest', 'subject.skill_category', 'sub_skill_category'],
    });

    if (!question) {
      throw new DataNotFoundException(`Question with id "${id}"`, 'Questão', QuestionService.name);
    }

    return this.transformQuestionWithSubCategory({
      ...question,
      subject: question.subject
        ? {
            id: question.subject.id,
            name: question.subject.skill_category?.name || '',
          }
        : undefined,
      contest: question.subject?.contest ? question.subject?.contest : undefined,
    });
  }

  /**
   * Retrieve questions by subject ID
   * Optimized for subject-specific question retrieval
   */
  async findBySubject(subjectId: number, query: Omit<QuestionQuery, 'subject_id'>, userId?: number): Promise<QuestionListResponse> {
    return this.findAll({ ...query, subject_id: subjectId }, userId);
  }

  // TODO: Create own select
  async findBySubjectUserProgression(subjectId: number, query: Omit<QuestionQuery, 'subject_id'>, userId?: number): Promise<QuestionWithUserQuestionProgressionResponse> {
    const questions = await this.findAll({ ...query, subject_id: subjectId }, userId);
    return {
      user_question_progression: questions.data.user_question_progression,
      // meta: questions.meta,
    };
  }

  /**
   * Count questions by filters
   * Performance-optimized count operation
   */
  async count(filters: QuestionFilter = {}): Promise<number> {
    const queryBuilder = this.createBaseQueryBuilder(filters, 0);
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
   * Get the ID of the last answered question for a specific subject by a user
   * This is more efficient than getting all answers and helps determine user progression
   */
  private async getLastAnsweredQuestionIdForSubject(userId: number, subjectId: number): Promise<number | null> {
    const result = await this.userAnswersRepository.createQueryBuilder('ua').innerJoin('ua.question', 'q').select('ua.question_id').where('ua.users_id = :userId', { userId }).andWhere('q.subject_id = :subjectId', { subjectId }).orderBy('ua.answared_at', 'ASC').limit(1).getRawOne();

    return result?.ua_question_id || null;
  }

  /**
   * Create base query builder with common filtering logic
   * Follows DRY principle and enables consistent filtering
   */
  private createBaseQueryBuilder(filters: QuestionFilter, includeInactive: number): SelectQueryBuilder<Question> {
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

    if (filters.sub_skill_category_id) {
      queryBuilder.andWhere('question.sub_skill_category_id = :subSkillCategoryId', {
        subSkillCategoryId: filters.sub_skill_category_id,
      });
    }

    return queryBuilder;
  }

  /**
   * Transform question data to include subcategory name from relation
   */
  private transformQuestionWithSubCategory(question: any): any {
    return {
      ...question,
      sub_skill_category_name: question.sub_skill_category?.name || undefined,
    };
  }
}
