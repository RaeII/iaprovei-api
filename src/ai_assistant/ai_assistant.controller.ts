import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AiAssistantService } from './ai_assistant.service';
import { AiAssistantApiResponse, AiAssistantQuestionExplanationApiRequest, AiAssistantQuestionExplanationApiRequestSchema, AiAssistantQuestionExplanationApiResponse, AiAssistantRequestPayload, AiAssistantRequestPayloadSchema, aiAssistantApiResponseOpenapi, aiAssistantQuestionExplanationApiRequestOpenapi, aiAssistantQuestionExplanationApiResponseOpenapi, aiAssistantRequestPayloadOpenapi } from './schemas/ai_assistant.schema';
import { UserAnswerService } from '@/user_answer/user_answer.service';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BasicUserInfo, SessionId } from '@/common/decorators';
import { AiAssistanceMessageService } from '@/ai_assistance_message/ai_assistance_message.service';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';

@ApiTags('AI Assistant')
@Controller('ai-assistant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiAssistantController {
  constructor(
    private readonly aiAssistantService: AiAssistantService,
    private readonly aiAssistanceMessageService: AiAssistanceMessageService,
    private readonly userAnswerService: UserAnswerService
  ) {}

  @Post('correct-answer')
  @ApiBody({ schema: aiAssistantRequestPayloadOpenapi })
  @ApiResponse({ schema: aiAssistantApiResponseOpenapi })
  async correctUserAnswer(@Body(new ZodValidationPipe(AiAssistantRequestPayloadSchema)) request: AiAssistantRequestPayload, @SessionId() sessionId: string, @BasicUserInfo() userInfo: { user_id: number; username: string }): Promise<AiAssistantApiResponse> {
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
    await this.aiAssistanceMessageService.create(
      {
        question_id: request.question_id,
        message: response.correction_suggestion,
        message_type: 'correction_suggestion',
        sender: 'ia',
      },
      userInfo,
      sessionId
    );
    return {
      data: response,
    };
  }

  @Post('question-explanation')
  @ApiBody({ schema: aiAssistantQuestionExplanationApiRequestOpenapi })
  @ApiResponse({ schema: aiAssistantQuestionExplanationApiResponseOpenapi })
  async getQuestionExplanation(@Body(new ZodValidationPipe(AiAssistantQuestionExplanationApiRequestSchema)) request: AiAssistantQuestionExplanationApiRequest, @SessionId() sessionId: string, @BasicUserInfo() userInfo: { user_id: number; username: string }): Promise<AiAssistantQuestionExplanationApiResponse> {
    const userAnswer = await this.userAnswerService.gatherAiRequestData(request.question_id);

    const aiRequest = {
      institution: userAnswer.question.contest.institution,
      subject: userAnswer.question.subject.name,
      question: userAnswer.question.affirmation,
      options: userAnswer.all_options.map(option => option.option_text),
      default_explanation: userAnswer.question.explanation,
    };
    const response = await this.aiAssistantService.getQuestionExplanation(aiRequest);
    await this.aiAssistanceMessageService.create(
      {
        question_id: request.question_id,
        message: response.question_explanation,
        message_type: 'clarification_request',
        sender: 'ia',
      },
      userInfo,
      sessionId
    );
    return {
      data: response,
    };
  }
}
