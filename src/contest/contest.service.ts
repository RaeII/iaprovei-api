import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Contest, ContestStatus } from '@/entities/contest.entity';
import { DataNotFoundException } from '@/domain/shared/exceptions/data-not-found.exception';
import { ContestSummary, ContestDetails } from './schemas/contest.schema';
import { addContestTranslations } from '@/utils/enum-translations';

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
  async findAll(options?: { status?: ContestStatus; includeInactive?: boolean; fullDetails?: boolean }) {
    const queryOptions: FindManyOptions<Contest> = {
      order: {
        created_at: 'DESC',
      },
    };

    // Performance optimization: select only needed fields if not requesting full details
    if (!options?.fullDetails) {
      queryOptions.select = ['id', 'name', 'slug', 'description', 'institution', 'status', 'difficulty_level', 'total_questions', 'estimated_study_hours'];
    }

    // Filter by status if provided
    if (options?.status) {
      queryOptions.where = { ...queryOptions.where, status: options.status };
    }

    // Filter by active status (default: only active contests)
    if (!options?.includeInactive) {
      queryOptions.where = { ...queryOptions.where, is_active: true };
    }

    const contests = await this.contestsRepository.find(queryOptions);

    // Add Portuguese translations to each contest
    return contests.map(contest => addContestTranslations(contest));
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
      select: ['id', 'name', 'slug', 'description', 'institution', 'status', 'difficulty_level', 'total_questions', 'estimated_study_hours'],
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
