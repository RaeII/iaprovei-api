import { Controller, Get, Post, Param, Query, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { Request } from 'express';
import { AiAssistanceMessageService } from './ai_assistance_message.service';
import { UserContextService } from '@/common/services/user-context.service';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { AiAssistanceMessageQuerySchema, AiAssistanceMessageQuery, AiAssistanceMessageListResponse, AiAssistanceMessageDetailedListResponse, AiAssistanceMessageDetailResponse, AiAssistanceMessageCountResponse, AiAssistanceMessageExistsResponse, AiAssistanceMessageCreate, AiAssistanceMessageCreateSchema, aiAssistanceMessageListResponseOpenapi, aiAssistanceMessageDetailedListResponseOpenapi, aiAssistanceMessageDetailResponseOpenapi, aiAssistanceMessageCountResponseOpenapi, aiAssistanceMessageExistsResponseOpenapi, aiAssistanceMessageCreateOpenapi } from './schemas/ai_assistance_message.schema';
import { SessionId } from '@/common/decorators/session-id.decorator';

@ApiTags('AI Assistance Message')
@Controller('ai-assistance/messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiAssistanceMessageController {
  constructor(
    private aiAssistanceMessageService: AiAssistanceMessageService,
    private userContextService: UserContextService
  ) {}

  @Post()
  @ApiBody({ schema: aiAssistanceMessageCreateOpenapi })
  @ApiResponse({ schema: aiAssistanceMessageDetailResponseOpenapi })
  async create(@Body(new ZodValidationPipe(AiAssistanceMessageCreateSchema)) createAiAssistanceMessageDto: AiAssistanceMessageCreate, @Req() req: Request, @SessionId() sessionId: string): Promise<AiAssistanceMessageDetailResponse> {
    const userInfo = this.userContextService.getBasicUserInfo(req);
    return this.aiAssistanceMessageService.create(createAiAssistanceMessageDto, userInfo, sessionId);
  }

  @Get()
  @ApiResponse({ schema: aiAssistanceMessageListResponseOpenapi })
  async findAll(@Query(new ZodValidationPipe(AiAssistanceMessageQuerySchema)) query: AiAssistanceMessageQuery, @Req() req: Request): Promise<AiAssistanceMessageListResponse> {
    const userContext = await this.userContextService.getUserContext(req);
    return this.aiAssistanceMessageService.findAll(query, userContext);
  }

  @Get('detailed')
  @ApiResponse({ schema: aiAssistanceMessageDetailedListResponseOpenapi })
  async findAllDetailed(@Query(new ZodValidationPipe(AiAssistanceMessageQuerySchema)) query: AiAssistanceMessageQuery, @Req() req: Request): Promise<AiAssistanceMessageDetailedListResponse> {
    const userContext = await this.userContextService.getUserContext(req);
    return this.aiAssistanceMessageService.findAllDetailed(query, userContext);
  }

  @Get('count')
  @ApiResponse({ schema: aiAssistanceMessageCountResponseOpenapi })
  async count(@Query(new ZodValidationPipe(AiAssistanceMessageQuerySchema.pick({ assistence_sessions_id: true, sender: true, message_type: true }))) query: Partial<AiAssistanceMessageQuery>, @Req() req: Request): Promise<AiAssistanceMessageCountResponse> {
    const userContext = await this.userContextService.getUserContext(req);
    return this.aiAssistanceMessageService.count(query, userContext);
  }

  @Get(':id')
  @ApiResponse({ schema: aiAssistanceMessageDetailResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request): Promise<AiAssistanceMessageDetailResponse> {
    const userContext = await this.userContextService.getUserContext(req);
    return { data: await this.aiAssistanceMessageService.findOne(id, userContext) };
  }

  @Get(':id/exists')
  @ApiResponse({ schema: aiAssistanceMessageExistsResponseOpenapi })
  async exists(@Param('id', ParseIntPipe) id: number, @Req() req: Request): Promise<AiAssistanceMessageExistsResponse> {
    const userContext = await this.userContextService.getUserContext(req);
    return this.aiAssistanceMessageService.exists(id, userContext);
  }

  @Get('session/:sessionId')
  @ApiResponse({ schema: aiAssistanceMessageListResponseOpenapi })
  async findBySessionId(@Param('sessionId') sessionId: string, @Query(new ZodValidationPipe(AiAssistanceMessageQuerySchema.omit({ assistence_sessions_id: true }))) query: Omit<AiAssistanceMessageQuery, 'assistence_sessions_id'>): Promise<AiAssistanceMessageListResponse> {
    return this.aiAssistanceMessageService.findBySessionId(sessionId, query);
  }

  @Get('question/:questionId')
  @ApiResponse({ schema: aiAssistanceMessageListResponseOpenapi })
  async findByQuestionId(@Param('questionId', ParseIntPipe) questionId: number, @Query(new ZodValidationPipe(AiAssistanceMessageQuerySchema.omit({ assistence_sessions_id: true }))) query: Omit<AiAssistanceMessageQuery, 'assistence_sessions_id'>, @Req() req: Request): Promise<AiAssistanceMessageListResponse> {
    const userInfo = this.userContextService.getBasicUserInfo(req);
    return this.aiAssistanceMessageService.findByQuestionAndUser(questionId, userInfo.user_id, query);
  }
}
