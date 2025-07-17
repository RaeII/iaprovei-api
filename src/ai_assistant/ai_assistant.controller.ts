import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AiAssistantService } from './ai_assistant.service';
import { AiAssistantApiResponse, AiAssistantQuestionExplanationApiRequest, AiAssistantQuestionExplanationApiRequestSchema, AiAssistantQuestionExplanationApiResponse, AiAssistantRequestPayload, AiAssistantRequestPayloadSchema, aiAssistantApiResponseOpenapi, aiAssistantQuestionExplanationApiRequestOpenapi, aiAssistantQuestionExplanationApiResponseOpenapi, aiAssistantRequestPayloadOpenapi } from './schemas/ai_assistant.schema';
import { UserAnswerService } from '@/user_answer/user_answer.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('AI Assistant')
@Controller('ai-assistant')
export class AiAssistantController {
  constructor(
    private readonly aiAssistantService: AiAssistantService,
    private readonly userAnswerService: UserAnswerService
  ) {}

  @Post('correct-answer')
  @UsePipes(new ZodValidationPipe(AiAssistantRequestPayloadSchema))
  @ApiBody({ schema: aiAssistantRequestPayloadOpenapi })
  @ApiResponse({ schema: aiAssistantApiResponseOpenapi })
  async correctUserAnswer(@Body() request: AiAssistantRequestPayload): Promise<AiAssistantApiResponse> {
    const userAnswer = await this.userAnswerService.gatherAiRequestData(request.question_id, request.user_option_answer_id);

    const aiRequest = {
      institution: userAnswer.question.contest.institution,
      subject: userAnswer.question.subject.name,
      question: userAnswer.question.affirmation,
      options: userAnswer.all_options.map(option => option.option_text),
      correct_answer: userAnswer.correct_options.map(option => option.option_text).join(', '),
      default_explanation: userAnswer.question.explanation,
      student_answer: userAnswer.chosen_option.option_text,
    };
    const response = await this.aiAssistantService.correctUserAnswer(aiRequest);
    return {
      data: response,
    };
  }

  @Post('question-explanation')
  @UsePipes(new ZodValidationPipe(AiAssistantQuestionExplanationApiRequestSchema))
  @ApiBody({ schema: aiAssistantQuestionExplanationApiRequestOpenapi })
  @ApiResponse({ schema: aiAssistantQuestionExplanationApiResponseOpenapi })
  async getQuestionExplanation(@Body() request: AiAssistantQuestionExplanationApiRequest): Promise<AiAssistantQuestionExplanationApiResponse> {
    const userAnswer = await this.userAnswerService.gatherAiRequestData(request.question_id);

    const aiRequest = {
      institution: userAnswer.question.contest.institution,
      subject: userAnswer.question.subject.name,
      question: userAnswer.question.affirmation,
      options: userAnswer.all_options.map(option => option.option_text),
      default_explanation: userAnswer.question.explanation,
    };
    const response = await this.aiAssistantService.getQuestionExplanation(aiRequest);
    return {
      data: response,
    };
  }
}
