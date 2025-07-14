import { z } from 'zod';

// Pagination schema for retrieve operations
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Paginated response metadata schema
export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  total_pages: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
