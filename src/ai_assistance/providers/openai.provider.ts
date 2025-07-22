import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { IAiProvider } from '../interfaces/ai-provider.interface';
import { AiAssistanceQuestionExplanationRequest, AiAssistanceQuestionExplanationResponse, AiAssistanceRequest, AiAssistanceResponse } from '../schemas/ai_assistance.schema';
import { MisconfiguredServiceException } from '../../domain/shared/exceptions/misconfigured-service.exception';

@Injectable()
export class OpenAiProvider implements IAiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');

    if (!apiKey) {
      throw new MisconfiguredServiceException('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async correctUserAnswer(request: AiAssistanceRequest): Promise<AiAssistanceResponse> {
    try {
      this.logger.log('Requesting answer correction from OpenAI');

      const systemPrompt = this.buildSystemPrompt();
      const userMessage = this.buildUserMessage(request);

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model'),
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: this.configService.get<number>('openai.temperature'),
        max_tokens: this.configService.get<number>('openai.maxTokens'),
      });

      const correctionSuggestion = completion.choices[0]?.message?.content;

      if (!correctionSuggestion) {
        throw new Error('No response received from OpenAI');
      }

      this.logger.log('Successfully received correction from OpenAI');

      return {
        correction_suggestion: correctionSuggestion.trim(),
      };
    } catch (error) {
      this.logger.error('Failed to get correction from OpenAI', error.stack);
      throw new Error(`OpenAI service error: ${error.message}`);
    }
  }

  async getQuestionExplanation(request: AiAssistanceQuestionExplanationRequest): Promise<AiAssistanceQuestionExplanationResponse> {
    try {
      this.logger.log('Requesting question explanation from OpenAI');

      const systemPrompt = this.buildQuestionExplanationSystemPrompt();
      const userMessage = this.buildQuestionExplanationUserMessage(request);

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model'),
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: this.configService.get<number>('openai.temperature'),
        max_tokens: this.configService.get<number>('openai.maxTokens'),
      });

      const correctionSuggestion = completion.choices[0]?.message?.content;

      if (!correctionSuggestion) {
        throw new Error('No response received from OpenAI');
      }

      this.logger.log('Successfully received correction from OpenAI');

      return {
        question_explanation: correctionSuggestion.trim(),
      };
    } catch (error) {
      this.logger.error('Failed to get correction from OpenAI', error.stack);
      throw new Error(`OpenAI service error: ${error.message}`);
    }
  }

  private buildSystemPrompt(): string {
    return this.configService.get('openai.systemPrompt');
  }

  private buildQuestionExplanationSystemPrompt(): string {
    return this.configService.get('openai.questionExplanationSystemPrompt');
  }

  private buildUserMessage(request: AiAssistanceRequest): string {
    return `The actual course institution is ${request.institution}, the actual subject is ${request.subject}, the questions is "${request.question}", that is a multi choice option, the options are:

${request.options.join('\n')}

The correct answer is "${request.correct_answer}". The default explantion for it is "${request.default_explanation}".

The student answer is "${request.student_answer}" that is incorrect, make a correction_suggestion for the student.`;
  }

  private buildQuestionExplanationUserMessage(request: AiAssistanceQuestionExplanationRequest): string {
    return `The actual course institution is ${request.institution}, the actual subject is ${request.subject}, the questions is "${request.question}", that is a multi choice option, the options are:

${request.options.join('\n')}
The default explantion for it is "${request.default_explanation}".`;
  }
}
