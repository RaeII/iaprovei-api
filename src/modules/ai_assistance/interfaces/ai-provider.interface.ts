import {
  AiAssistanceQuestionExplanationRequest,
  AiAssistanceQuestionExplanationResponse,
  AiAssistanceRequest,
  AiAssistanceResponse,
  AiCourseMaterialSuggestionRequest,
  AiCourseMaterialSuggestionResponse,
} from '../schemas/ai_assistance.schema';

export interface IAiProvider {
  correctUserAnswer(request: AiAssistanceRequest): Promise<AiAssistanceResponse>;
  getQuestionExplanation(
    request: AiAssistanceQuestionExplanationRequest
  ): Promise<AiAssistanceQuestionExplanationResponse>;
  suggestSkillCategoriesForCourse(
    request: AiCourseMaterialSuggestionRequest
  ): Promise<AiCourseMaterialSuggestionResponse>;
}

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER_TOKEN';
