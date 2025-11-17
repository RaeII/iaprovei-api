import { Inject, Injectable } from '@nestjs/common';
import { IAiProvider, AI_PROVIDER_TOKEN } from './interfaces/ai-provider.interface';
import {
  AiAssistanceQuestionExplanationRequest,
  AiAssistanceQuestionExplanationResponse,
  AiAssistanceRequest,
  AiAssistanceResponse,
  AiCourseMaterialSuggestionRequest,
  AiCourseMaterialSuggestionResponse,
} from './schemas/ai_assistance.schema';

@Injectable()
export class AiAssistanceService {
  constructor(
    @Inject(AI_PROVIDER_TOKEN)
    private readonly aiProvider: IAiProvider
  ) {}

  async correctUserAnswer(request: AiAssistanceRequest): Promise<AiAssistanceResponse> {
    return this.aiProvider.correctUserAnswer(request);
  }

  async getQuestionExplanation(
    request: AiAssistanceQuestionExplanationRequest
  ): Promise<AiAssistanceQuestionExplanationResponse> {
    return this.aiProvider.getQuestionExplanation(request);
  }

  async suggestSkillCategoriesForCourse(
    request: AiCourseMaterialSuggestionRequest
  ): Promise<AiCourseMaterialSuggestionResponse> {
    return this.aiProvider.suggestSkillCategoriesForCourse(request);
  }
}
