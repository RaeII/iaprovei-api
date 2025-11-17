import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { IAiProvider } from '../interfaces/ai-provider.interface';
import {
  AiAssistanceQuestionExplanationRequest,
  AiAssistanceQuestionExplanationResponse,
  AiAssistanceRequest,
  AiAssistanceResponse,
  AiCourseMaterialSuggestionRequest,
  AiCourseMaterialSuggestionResponse,
  AiCourseMaterialSuggestionResponseSchema,
} from '../schemas/ai_assistance.schema';
import { MisconfiguredServiceException } from '@/common/exceptions/misconfigured-service.exception';

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
      const messages = this.buildMessages(systemPrompt, request.image_file, this.buildUserMessage(request));

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model'),
        messages,
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

  async getQuestionExplanation(
    request: AiAssistanceQuestionExplanationRequest
  ): Promise<AiAssistanceQuestionExplanationResponse> {
    try {
      this.logger.log('Requesting question explanation from OpenAI');

      const systemPrompt = this.buildQuestionExplanationSystemPrompt();
      const messages = this.buildMessages(
        systemPrompt,
        request.image_file,
        this.buildQuestionExplanationUserMessage(request)
      );

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model'),
        messages,
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

  async suggestSkillCategoriesForCourse(
    request: AiCourseMaterialSuggestionRequest
  ): Promise<AiCourseMaterialSuggestionResponse> {
    try {
      this.logger.log('Requesting skill category suggestions from OpenAI');

      const systemPrompt = this.buildCourseMaterialSystemPrompt();
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: this.buildCourseMaterialUserMessage(request) },
      ] as any[];

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model'),
        messages,
        temperature: this.configService.get<number>('openai.temperature'),
        max_tokens: this.configService.get<number>('openai.maxTokens'),
      });

      const responseContent = completion.choices[0]?.message?.content;

      if (!responseContent) {
        throw new Error('No response received from OpenAI');
      }

      const parsedResponse = this.parseCourseMaterialResponse(responseContent);

      this.logger.log('Successfully received skill category suggestions from OpenAI');

      return parsedResponse;
    } catch (error) {
      this.logger.error('Failed to get skill category suggestions from OpenAI', error.stack);
      throw new Error(`OpenAI service error: ${error.message}`);
    }
  }

  private buildSystemPrompt(): string {
    return this.configService.get('openai.systemPrompt');
  }

  private buildQuestionExplanationSystemPrompt(): string {
    return this.configService.get('openai.questionExplanationSystemPrompt');
  }

  private buildCourseMaterialSystemPrompt(): string {
    // eslint-disable-next-line prettier/prettier
    return [
      'You are an academic planning assistant that maps a desired course to the most relevant study skill categories.',
      'You must ONLY choose from the provided list of skill categories and return your answer as JSON with the format:',
      '{"matched_skill_categories":[{"name":"<skill name>","reason":"<short reason>"}]}',
      'If nothing matches, return {"matched_skill_categories":[]}.',
      'Only select categories that clearly belong in the desired course. If unsure, leave them out.',
      'Prefer categories with the highest available question counts when there are multiple valid options.',
      'Use the skill category name exactly as it appears in the provided list.',
    ].join(' ');
  }

  private buildMessages(systemPrompt: string, imageFile: Buffer | undefined, userMessage: string): any[] {
    const messages: any[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    if (imageFile) {
      // Convert Buffer to base64 for OpenAI Vision API
      const base64Image = imageFile.toString('base64');
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: userMessage,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ] as any,
      });
    } else {
      messages.push({
        role: 'user',
        content: userMessage,
      });
    }

    return messages;
  }

  private buildUserMessage(request: AiAssistanceRequest): string {
    let message = `The actual course institution is ${request.institution}, the actual subject is ${request.subject}.`;

    message += `\n\`\`\`The questions:\n${request?.statement_text ? request?.statement_text + '\n' : ''}\n${request?.statement ? request?.statement + '\n' : ''}\n${request.question}\n\`\`\`

That is a ${request?.question_type || 'multi choice'} option, the options are:
${request.options.join('\n')}

The correct answer is "${request.correct_answer}".`;

    if (request.default_explanation) {
      message += `\nThe default explanation for it is "${request.default_explanation}".`;
    }

    message += `The student answer is "${request.student_answer}" that is incorrect, make a correction_suggestion for the student.`;
    return message;
  }

  private buildQuestionExplanationUserMessage(request: AiAssistanceQuestionExplanationRequest): string {
    let message = `The actual course institution is ${request.institution}, the actual subject is ${request.subject}.`;

    message += `\n\`\`\`The questions:\n${request?.statement_text ? request?.statement_text + '\n' : ''}\n${request?.statement ? request?.statement + '\n' : ''}\n${request.question}\n\`\`\`
    
That is a ${request?.question_type || 'multi choice'} option, the options are:
${request.options.join('\n')}`;

    if (request.default_explanation) {
      message += `\nThe default explanation for it is "${request.default_explanation}".`;
    }

    return message;
  }

  private buildCourseMaterialUserMessage(request: AiCourseMaterialSuggestionRequest): string {
    const header = `The student wants to prepare for the course "${request.desired_course}". `;
    const instructions =
      'Select which of the following skill categories are essential for this course syllabus. Do not pick categories that the course would not normally cover. Only use names from the list.\n\n';

    const categoriesByContest = request.available_skill_categories.reduce<
      Map<string, typeof request.available_skill_categories>
    >((acc, category) => {
      const contestKey = category.contest ? `${category.contest.id}` : 'general';
      const existing = acc.get(contestKey);
      if (existing) {
        existing.push(category);
      } else {
        acc.set(contestKey, [category]);
      }
      return acc;
    }, new Map());

    const categoriesList = Array.from(categoriesByContest.values())
      .map(categories => {
        const contestInfo = categories[0]?.contest;
        const contestHeader = contestInfo
          ? `Contest: ${contestInfo.name}${contestInfo.slug ? ` (slug: ${contestInfo.slug})` : ''} [id: ${contestInfo.id}]\n`
          : 'General Skill Categories\n';

        const categoryLines = categories
          .map(category => {
            const parts: string[] = [`- ${category.name}`];
            if (category.description) {
              parts.push(`description: ${category.description}`);
            }
            if (typeof category.question_count === 'number') {
              parts.push(`questions: ${category.question_count}`);
            }
            return parts.join(' | ');
          })
          .join('\n');

        return `${contestHeader}${categoryLines}`;
      })
      .join('\n\n');

    const outputReminder =
      '\n\nRespond using JSON only in the exact format described in the system prompt. Do not include extra commentary.';
    console.log(header + instructions + categoriesList + outputReminder);
    return header + instructions + categoriesList + outputReminder;
  }

  private parseCourseMaterialResponse(content: string): AiCourseMaterialSuggestionResponse {
    const trimmed = content.trim();

    const jsonCandidate = this.extractJsonString(trimmed);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonCandidate);
    } catch (error) {
      throw new Error(`Invalid JSON returned by OpenAI: ${error instanceof Error ? error.message : 'unknown error'}`);
    }

    const validationResult = AiCourseMaterialSuggestionResponseSchema.safeParse(parsed);

    if (!validationResult.success) {
      const issues = validationResult.error.issues.map(issue => issue.message).join('; ');
      throw new Error(`Invalid response schema from OpenAI: ${issues}`);
    }

    return validationResult.data;
  }

  private extractJsonString(content: string): string {
    if (content.startsWith('```')) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      return content.substring(firstBrace, lastBrace + 1);
    }

    return content;
  }
}
