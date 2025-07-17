import { zodToOpenAPI } from 'nestjs-zod';
import { z } from 'zod';

export const AiAssistantRequestPayloadSchema = z.object({
  question_id: z.number(),
  user_option_answer_id: z.number(),
});

export const AiAssistantRequestSchema = z.object({
  institution: z.string(),
  subject: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correct_answer: z.string(),
  default_explanation: z.string(),
  student_answer: z.string(),
});

export const AiAssistantQuestionExplanationApiRequestSchema = z.object({
  question_id: z.number(),
});

export const AiAssistantQuestionExplanationRequestSchema = z.object({
  institution: z.string(),
  subject: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  default_explanation: z.string(),
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

export const aiAssistantRequestPayloadOpenapi: any = zodToOpenAPI(AiAssistantRequestPayloadSchema);
export const aiAssistantApiResponseOpenapi: any = zodToOpenAPI(AiAssistantApiResponseSchema);
export const aiAssistantQuestionExplanationApiRequestOpenapi: any = zodToOpenAPI(AiAssistantQuestionExplanationApiRequestSchema);
export const aiAssistantQuestionExplanationApiResponseOpenapi: any = zodToOpenAPI(AiAssistantQuestionExplanationApiResponseSchema);

export type AiAssistantRequest = z.infer<typeof AiAssistantRequestSchema>;
export type AiAssistantQuestionExplanationRequest = z.infer<typeof AiAssistantQuestionExplanationRequestSchema>;
export type AiAssistantRequestPayload = z.infer<typeof AiAssistantRequestPayloadSchema>;
export type AiAssistantResponse = z.infer<typeof AiAssistantResponseSchema>;
export type AiAssistantQuestionExplanationResponse = z.infer<typeof AiAssistantQuestionExplanationResponseSchema>;
export type AiAssistantQuestionExplanationApiRequest = z.infer<typeof AiAssistantQuestionExplanationApiRequestSchema>;
export type AiAssistantQuestionExplanationApiResponse = z.infer<typeof AiAssistantQuestionExplanationApiResponseSchema>;
export type AiAssistantApiResponse = z.infer<typeof AiAssistantApiResponseSchema>;
