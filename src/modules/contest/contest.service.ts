import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Contest, ContestStatus } from '@/entities/contest.entity';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { ContestSummary, ContestDetails, ContestWithSubjects, ContestQuery } from './schemas/contest.schema';
import { addContestTranslations } from '@/common/utils/enum-translations';

@Injectable()
export class ContestService {
  constructor(
    @InjectRepository(Contest)
    private contestsRepository: Repository<Contest>
  ) {}

  /**
   * Retrieve all contests with optional filtering and optimized for performance
   * Returns summary data by default for faster queries
   * Includes Portuguese translations for enum values
   */
  async findAll(options?: { status?: ContestStatus; include_inactive?: boolean; full_details?: boolean }) {
    const queryOptions: FindManyOptions<Contest> = {
      order: {
        created_at: 'DESC',
      },
    };

    // Performance optimization: select only needed fields if not requesting full details
    if (!options?.full_details) {
      queryOptions.select = [
        'id',
        'name',
        'slug',
        'description',
        'institution',
        'status',
        'difficulty_level',
        'total_questions',
        'estimated_study_hours',
      ];
    }

    // Filter by status if provided
    if (options?.status) {
      queryOptions.where = { ...queryOptions.where, status: options.status };
    }

    // Filter by active status (default: only active contests)
    if (!options?.include_inactive) {
      queryOptions.where = { ...queryOptions.where, is_active: true };
    }

    const contests = await this.contestsRepository.find(queryOptions);

    // Add Portuguese translations to each contest
    return contests.map(contest => addContestTranslations(contest));
  }

  /**
   * Retrieve all contests with subjects with optional filtering and optimized for performance
   * Returns summary data by default for faster queries
   * Includes Portuguese translations for enum values
   * Includes percentage of user answers completed per subject for authenticated user
   */
  async findAllWithSubjects(options?: ContestQuery & { userId?: number }): Promise<ContestWithSubjects[]> {
    const queryBuilder = this.contestsRepository
      .createQueryBuilder('contest')
      .leftJoinAndSelect('contest.subjects', 'subjects', 'subjects.contest_id = contest.id AND subjects.is_active = 1')
      .leftJoinAndSelect('subjects.skill_category', 'skill_category');

    // Add subquery to count unique questions answered by user per subject and get total questions if userId is provided
    if (options?.userId) {
      queryBuilder
        .leftJoin(
          '(SELECT sqsp.subjects_id, COUNT(DISTINCT q.id) as answer_count FROM questions q INNER JOIN user_answers ua ON q.id = ua.question_id AND ua.users_id = :userId INNER JOIN subject_question_study_plan sqsp ON q.id = sqsp.questions_id GROUP BY sqsp.subjects_id)',
          'user_answer_counts',
          'user_answer_counts.subjects_id = subjects.id'
        )
        .leftJoin(
          '(SELECT sqsp.subjects_id, COUNT(DISTINCT q.id) as total_questions FROM questions q INNER JOIN subject_question_study_plan sqsp ON q.id = sqsp.questions_id WHERE q.is_active = 1 GROUP BY sqsp.subjects_id)',
          'question_counts',
          'question_counts.subjects_id = subjects.id'
        )
        .setParameter('userId', options.userId);
    }

    // Add subquery to get last answer date per contest for ordering by last usage
    if (options?.order_by_last_usage && options?.userId) {
      queryBuilder.leftJoin(
        '(SELECT c.id as contest_id, MAX(ua.answared_at) as last_answer_date FROM contests c INNER JOIN subjects s ON c.id = s.contest_id INNER JOIN subject_question_study_plan sqsp ON s.id = sqsp.subjects_id INNER JOIN questions q ON sqsp.questions_id = q.id INNER JOIN user_answers ua ON q.id = ua.question_id WHERE ua.users_id = :userId AND s.is_active = 1 AND q.is_active = 1 GROUP BY c.id)',
        'last_usage',
        'last_usage.contest_id = contest.id'
      );
    }

    // Filter by status if provided
    if (options?.status) {
      queryBuilder.andWhere('contest.status = :status', { status: options.status });
    }

    // Filter by active status (default: only active contests)
    if (!options?.include_inactive) {
      queryBuilder.andWhere('contest.is_active = 1');
    }

    queryBuilder.select([
      'contest.id',
      'contest.name',
      'contest.institution',
      'contest.status',
      'subjects.id',
      'skill_category.name',
    ]);

    // Order by last usage if flag is enabled, otherwise by creation date
    if (options?.order_by_last_usage && options?.userId) {
      queryBuilder
        .addSelect('last_usage.last_answer_date', 'contest_last_answer_date')
        .orderBy('COALESCE(last_usage.last_answer_date, "1970-01-01")', 'DESC')
        .addOrderBy('contest.created_at', 'DESC');
    } else {
      queryBuilder.orderBy('contest.created_at', 'DESC');
    }

    // Add answer count and total questions to selection if userId provided, calculate percentage
    if (options?.userId) {
      queryBuilder
        .addSelect('COALESCE(user_answer_counts.answer_count, 0)', 'subjects_user_answer_count')
        .addSelect('COALESCE(question_counts.total_questions, 0)', 'subjects_total_questions')
        .addSelect(
          'CASE WHEN COALESCE(question_counts.total_questions, 0) > 0 THEN ROUND((COALESCE(user_answer_counts.answer_count, 0) * 100.0) / question_counts.total_questions, 2) ELSE 0 END',
          'subjects_completion_percentage'
        );
    }

    // Use getRawAndEntities to access both entities and computed fields
    const { entities: contests, raw: rawResults } = await queryBuilder.getRawAndEntities();

    // Create a map of raw results by subject ID for easy lookup
    const rawResultsMap = new Map();
    if (options?.userId) {
      rawResults.forEach(raw => {
        if (raw.subjects_id) {
          rawResultsMap.set(raw.subjects_id, {
            answeredCount: raw.subjects_user_answer_count || 0,
            totalQuestions: raw.subjects_total_questions || 0,
            completionPercentage: raw.subjects_completion_percentage || 0,
          });
        }
      });
    }

    // Transform the data to include user_answer_rate as percentage
    const transformedContests = contests.map(contest => {
      const transformedContest = {
        ...addContestTranslations(contest),
        subjects: contest.subjects.map(subject => {
          const subjectData = rawResultsMap.get(subject.id);
          return {
            id: subject.id,
            name: subject.skill_category?.name || '',
            // user_answer_rate: options?.userId ? subjectData?.answeredCount || 0 : 0,
            user_answer_questions_percentage: options?.userId ? subjectData?.completionPercentage || 0 : 0,
          };
        }),
      };
      return transformedContest;
    });

    return transformedContests;
  }

  /**
   * Retrieve contest by ID with full details
   */
  async findOne(id: number): Promise<ContestDetails> {
    const contest = await this.contestsRepository.findOne({
      where: { id, is_active: true },
    });

    if (!contest) {
      throw new DataNotFoundException(`Contest with id "${id}"`, 'Concurso', ContestService.name);
    }

    return addContestTranslations(contest);
  }

  /**
   * Retrieve contest by slug - optimized for SEO-friendly URLs
   */
  async findBySlug(slug: string): Promise<ContestDetails> {
    const contest = await this.contestsRepository.findOne({
      where: { slug, is_active: true },
    });

    if (!contest) {
      throw new DataNotFoundException(`Contest with slug "${slug}"`, 'Concurso', ContestService.name);
    }

    return addContestTranslations(contest);
  }

  /**
   * Retrieve contests by status - useful for filtering available contests
   */
  async findByStatus(status: ContestStatus): Promise<ContestSummary[]> {
    const contests = await this.contestsRepository.find({
      where: { status, is_active: true },
      select: [
        'id',
        'name',
        'slug',
        'description',
        'institution',
        'status',
        'difficulty_level',
        'total_questions',
        'estimated_study_hours',
      ],
      order: {
        created_at: 'DESC',
      },
    });

    // Add Portuguese translations to each contest
    return contests.map(contest => addContestTranslations(contest));
  }

  /**
   * Count total contests by status - useful for dashboard/analytics
   */
  async countByStatus(status?: ContestStatus): Promise<number> {
    const where = status ? { status, is_active: true } : { is_active: true };
    return this.contestsRepository.count({ where });
  }

  /**
   * Check if contest exists by ID (lightweight check)
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.contestsRepository.count({
      where: { id, is_active: true },
    });
    return count > 0;
  }

  /**
   * Check if slug is available (useful for SEO URL validation)
   */
  async isSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const where = excludeId ? { slug, id: { not: excludeId } as any } : { slug };

    const count = await this.contestsRepository.count({ where });
    return count === 0;
  }
}
