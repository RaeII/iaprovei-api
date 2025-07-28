import { PaginationMeta } from '@/common/schemas/pagination.schema';

/**
 * Create pagination metadata
 * Provides consistent pagination information across all endpoints
 */
export const createPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
};

export const generateOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};
