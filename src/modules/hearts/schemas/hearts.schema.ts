import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';

// Constants
export const MAX_HEARTS = 5;
export const HEART_REGENERATION_INTERVAL_HOURS = 1;

// Heart status schema
export const HeartStatusSchema = z.object({
  current_hearts: z.number().min(0).max(MAX_HEARTS),
  max_hearts: z.number().default(MAX_HEARTS),
  hearts_to_regenerate: z.number().min(0),
  next_heart_regeneration_at: z.date().nullable(),
  is_full: z.boolean(),
});

// Heart status response schema
export const HeartStatusResponseSchema = z.object({
  data: HeartStatusSchema,
});

// Heart deduction response schema
export const HeartDeductionResponseSchema = z.object({
  success: z.boolean(),
  current_hearts: z.number().min(0).max(MAX_HEARTS),
  message: z.string(),
});

// OpenAPI schemas
export const heartStatusResponseOpenapi: any = zodToOpenAPI(HeartStatusResponseSchema);
export const heartDeductionResponseOpenapi: any = zodToOpenAPI(HeartDeductionResponseSchema);

// Type exports
export type HeartStatus = z.infer<typeof HeartStatusSchema>;
export type HeartStatusResponse = z.infer<typeof HeartStatusResponseSchema>;
export type HeartDeductionResponse = z.infer<typeof HeartDeductionResponseSchema>;



