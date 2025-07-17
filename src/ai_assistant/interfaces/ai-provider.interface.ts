import { AiAssistantQuestionExplanationRequest, AiAssistantQuestionExplanationResponse, AiAssistantRequest, AiAssistantResponse } from '../schemas/ai_assistant.schema';

export interface IAiProvider {
  correctUserAnswer(request: AiAssistantRequest): Promise<AiAssistantResponse>;
  getQuestionExplanation(request: AiAssistantQuestionExplanationRequest): Promise<AiAssistantQuestionExplanationResponse>;
}

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER_TOKEN';
