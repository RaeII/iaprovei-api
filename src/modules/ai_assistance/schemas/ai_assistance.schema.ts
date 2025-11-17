import { zodToOpenAPI } from 'nestjs-zod';
import { z } from 'zod';

export const AiAssistanceRequestPayloadSchema = z.object({
  question_id: z.number(),
  user_option_answer_id: z.number(),
});

export const AiAssistantRequestSchema = z.object({
  institution: z.string(),
  subject: z.string(),
  question: z.string(),
  question_type: z.string().optional(),
  options: z.array(z.string()),
  correct_answer: z.string(),
  default_explanation: z.string(),
  student_answer: z.string(),
  statement_text: z.string().optional(),
  image_file: z.instanceof(Buffer).optional(),
  statement: z.string().optional(),
});

export const AiAssistanceQuestionExplanationApiRequestSchema = z.object({
  question_id: z.number(),
});

export const AiAssistantQuestionExplanationRequestSchema = z.object({
  institution: z.string(),
  subject: z.string(),
  question: z.string(),
  question_type: z.string().optional(),
  options: z.array(z.string()),
  default_explanation: z.string(),
  statement_text: z.string().optional(),
  image_file: z.instanceof(Buffer).optional(),
  statement: z.string().optional(),
});

export const AiAssistantResponseSchema = z.object({
  correction_suggestion: z.string(),
});
export const AiAssistantQuestionExplanationResponseSchema = z.object({
  question_explanation: z.string(),
});
export const AiAssistantApiResponseSchema = z.object({
  data: AiAssistantResponseSchema,
});
export const AiAssistantQuestionExplanationApiResponseSchema = z.object({
  data: AiAssistantQuestionExplanationResponseSchema,
});

export const AiCourseMaterialSuggestionRequestSchema = z.object({
  desired_course: z.string().min(1),
  available_skill_categories: z
    .array(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1),
        description: z.string().optional(),
        question_count: z.number().int().nonnegative().optional(),
        contest: z
          .object({
            id: z.number().int().positive(),
            name: z.string().min(1),
            slug: z.string().optional(),
          })
          .optional(),
      })
    )
    .nonempty(),
});

export const AiCourseMaterialSuggestionResponseSchema = z.object({
  matched_skill_categories: z.array(
    z.object({
      name: z.string().min(1),
      reason: z.string().optional(),
    })
  ),
});

export const aiAssistanceRequestPayloadOpenapi: any = zodToOpenAPI(AiAssistanceRequestPayloadSchema);
export const aiAssistanceApiResponseOpenapi: any = zodToOpenAPI(AiAssistantApiResponseSchema);
export const aiAssistanceQuestionExplanationApiRequestOpenapi: any = zodToOpenAPI(
  AiAssistanceQuestionExplanationApiRequestSchema
);
export const aiAssistanceQuestionExplanationApiResponseOpenapi: any = zodToOpenAPI(
  AiAssistantQuestionExplanationApiResponseSchema
);

export type AiAssistanceRequest = z.infer<typeof AiAssistantRequestSchema>;
export type AiAssistanceQuestionExplanationRequest = z.infer<typeof AiAssistantQuestionExplanationRequestSchema>;
export type AiAssistantRequestPayload = z.infer<typeof AiAssistanceRequestPayloadSchema>;
export type AiAssistanceResponse = z.infer<typeof AiAssistantResponseSchema>;
export type AiAssistanceQuestionExplanationResponse = z.infer<typeof AiAssistantQuestionExplanationResponseSchema>;
export type AiAssistanceQuestionExplanationApiRequest = z.infer<typeof AiAssistanceQuestionExplanationApiRequestSchema>;
export type AiAssistantQuestionExplanationApiResponse = z.infer<typeof AiAssistantQuestionExplanationApiResponseSchema>;
export type AiAssistanceApiResponse = z.infer<typeof AiAssistantApiResponseSchema>;
export type AiCourseMaterialSuggestionRequest = z.infer<typeof AiCourseMaterialSuggestionRequestSchema>;
export type AiCourseMaterialSuggestionResponse = z.infer<typeof AiCourseMaterialSuggestionResponseSchema>;
