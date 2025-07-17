import { Inject, Injectable } from '@nestjs/common';
import { IAiProvider, AI_PROVIDER_TOKEN } from './interfaces/ai-provider.interface';
import { AiAssistantQuestionExplanationRequest, AiAssistantQuestionExplanationResponse, AiAssistantRequest, AiAssistantResponse } from './schemas/ai_assistant.schema';

@Injectable()
export class AiAssistantService {
  constructor(
    @Inject(AI_PROVIDER_TOKEN)
    private readonly aiProvider: IAiProvider
  ) {}

  async correctUserAnswer(request: AiAssistantRequest): Promise<AiAssistantResponse> {
    return this.aiProvider.correctUserAnswer(request);
  }

  async getQuestionExplanation(request: AiAssistantQuestionExplanationRequest): Promise<AiAssistantQuestionExplanationResponse> {
    return this.aiProvider.getQuestionExplanation(request);
  }
}
