import { AiAssistanceQuestionExplanationRequest, AiAssistanceQuestionExplanationResponse, AiAssistanceRequest, AiAssistanceResponse } from '../schemas/ai_assistance.schema';

export interface IAiProvider {
  correctUserAnswer(request: AiAssistanceRequest): Promise<AiAssistanceResponse>;
  getQuestionExplanation(request: AiAssistanceQuestionExplanationRequest): Promise<AiAssistanceQuestionExplanationResponse>;
}

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER_TOKEN';
