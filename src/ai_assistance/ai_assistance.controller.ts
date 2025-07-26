import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AiAssistanceService } from './ai_assistance.service';
import { AiAssistanceApiResponse, AiAssistanceQuestionExplanationApiRequest, AiAssistanceQuestionExplanationApiRequestSchema, AiAssistantQuestionExplanationApiResponse, AiAssistantRequestPayload, AiAssistanceRequestPayloadSchema, aiAssistanceApiResponseOpenapi, aiAssistanceQuestionExplanationApiRequestOpenapi, aiAssistanceQuestionExplanationApiResponseOpenapi, aiAssistanceRequestPayloadOpenapi } from './schemas/ai_assistance.schema';
import { UserAnswerService } from '@/user_answer/user_answer.service';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BasicUserInfo, SessionId } from '@/common/decorators';
import { AiAssistanceMessageService } from '@/ai_assistance_message/ai_assistance_message.service';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { UserBasicInfo } from '@/user/schemas/user.schema';

@ApiTags('AI Assistant')
@Controller('ai-assistance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiAssistanceController {
  constructor(
    private readonly aiAssistantService: AiAssistanceService,
    private readonly aiAssistanceMessageService: AiAssistanceMessageService,
    private readonly userAnswerService: UserAnswerService
  ) {}

  @Post('correct-answer')
  @ApiBody({ schema: aiAssistanceRequestPayloadOpenapi })
  @ApiResponse({ schema: aiAssistanceApiResponseOpenapi })
  async correctUserAnswer(@Body(new ZodValidationPipe(AiAssistanceRequestPayloadSchema)) request: AiAssistantRequestPayload, @SessionId() sessionId: string, @BasicUserInfo() userInfo: UserBasicInfo): Promise<AiAssistanceApiResponse> {
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
  @ApiBody({ schema: aiAssistanceQuestionExplanationApiRequestOpenapi })
  @ApiResponse({ schema: aiAssistanceQuestionExplanationApiResponseOpenapi })
  async getQuestionExplanation(@Body(new ZodValidationPipe(AiAssistanceQuestionExplanationApiRequestSchema)) request: AiAssistanceQuestionExplanationApiRequest, @SessionId() sessionId: string, @BasicUserInfo() userInfo: UserBasicInfo): Promise<AiAssistantQuestionExplanationApiResponse> {
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
