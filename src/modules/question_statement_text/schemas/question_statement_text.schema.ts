import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';

// Base schema for question_statement_text
export const QuestionStatementTextSchema = z.object({
  id: z.number(),
  text: z.string().optional(),
  contests_id: z.number(),
});

// OpenAPI export (kept minimal for now)
export const questionStatementTextResponseOpenapi: any = zodToOpenAPI(QuestionStatementTextSchema);

// Type export inferred from Zod schema
export type QuestionStatementText = z.infer<typeof QuestionStatementTextSchema>;
