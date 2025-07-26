import { Controller, Get, Param, Query, ParseIntPipe, UsePipes, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators/user-context.decorator';
import { QuestionQuerySchema, QuestionQuery, QuestionListResponse, QuestionDetailedListResponse, QuestionStatsListResponse, QuestionDetailResponse, questionListResponseOpenapi, questionDetailedListResponseOpenapi, questionStatsListResponseOpenapi, questionDetailResponseOpenapi, questionExistsResponseOpenapi, QuestionExistsResponse, QuestionCountResponse, questionCountResponseOpenapi, QuestionFilter, QuestionTypeEnumOpenapi, DifficultyLevelEnumOpenapi, questionWithUserQuestionProgressionResponseOpenapi, QuestionWithUserQuestionProgressionResponse } from './schemas/question.schema';
import { UserBasicInfo } from '@/user/schemas/user.schema';

@ApiTags('Question')
@Controller('questions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Get()
  @ApiResponse({ schema: questionListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(QuestionQuerySchema))
  @ApiQuery({ name: 'question_type', required: false, type: String, enum: QuestionTypeEnumOpenapi.enum })
  @ApiQuery({ name: 'difficulty_level', required: false, type: String, enum: DifficultyLevelEnumOpenapi.enum })
  @ApiQuery({ name: 'exam_board', required: false, type: String })
  @ApiQuery({ name: 'exam_year', required: false, type: Number })
  @ApiQuery({ name: 'is_active', required: false, type: Number, enum: [0, 1] })
  @ApiQuery({ name: 'include_options', required: false, type: Number, enum: [0, 1], description: 'Include question options in the response' })
  async findAll(@Query() query: QuestionQuery, @BasicUserInfo() userInfo: UserBasicInfo): Promise<QuestionListResponse> {
    return this.questionService.findAll(query, userInfo.id);
  }

  @Get('detailed')
  @ApiResponse({ schema: questionDetailedListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(QuestionQuerySchema))
  @ApiQuery({ name: 'question_type', required: false, type: String, enum: QuestionTypeEnumOpenapi.enum })
  @ApiQuery({ name: 'difficulty_level', required: false, type: String, enum: DifficultyLevelEnumOpenapi.enum })
  @ApiQuery({ name: 'exam_board', required: false, type: String })
  @ApiQuery({ name: 'exam_year', required: false, type: Number })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  async findAllDetailed(@Query() query: QuestionQuery): Promise<QuestionDetailedListResponse> {
    return this.questionService.findAllDetailed(query);
  }

  @Get('stats')
  @ApiResponse({ schema: questionStatsListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(QuestionQuerySchema))
  @ApiQuery({ name: 'question_type', required: false, type: String, enum: QuestionTypeEnumOpenapi.enum })
  @ApiQuery({ name: 'difficulty_level', required: false, type: String, enum: DifficultyLevelEnumOpenapi.enum })
  @ApiQuery({ name: 'exam_board', required: false, type: String })
  @ApiQuery({ name: 'exam_year', required: false, type: Number })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  async findAllStats(@Query() query: QuestionQuery): Promise<QuestionStatsListResponse> {
    return this.questionService.findAllStats(query);
  }

  @Get(':id')
  @ApiResponse({ schema: questionDetailResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<QuestionDetailResponse> {
    return { data: await this.questionService.findOne(id) };
  }

  @Get('subject/:subjectId')
  @ApiResponse({ schema: questionListResponseOpenapi })
  @ApiQuery({ name: 'is_active', required: false, type: Number, enum: [0, 1] })
  @ApiQuery({ name: 'include_options', required: false, type: Number, enum: [0, 1], description: 'Include question options in the response' })
  async findBySubject(@Param('subjectId', ParseIntPipe) subjectId: number, @Query(new ZodValidationPipe(QuestionQuerySchema.omit({ subject_id: true }))) query: Omit<QuestionQuery, 'subject_id'>, @BasicUserInfo() userInfo: UserBasicInfo): Promise<QuestionListResponse> {
    return this.questionService.findBySubject(subjectId, query, userInfo.id);
  }

  @Get('subject/:subjectId/user-progression')
  @ApiResponse({ schema: questionWithUserQuestionProgressionResponseOpenapi })
  @ApiQuery({ name: 'is_active', required: false, type: Number, enum: [0, 1] })
  @ApiQuery({ name: 'include_options', required: false, type: Number, enum: [0, 1], description: 'Include question options in the response' })
  async findBySubjectUserProgression(@Param('subjectId', ParseIntPipe) subjectId: number, @Query(new ZodValidationPipe(QuestionQuerySchema.omit({ subject_id: true }))) query: Omit<QuestionQuery, 'subject_id'>, @BasicUserInfo() userInfo: UserBasicInfo): Promise<QuestionWithUserQuestionProgressionResponse> {
    return this.questionService.findBySubjectUserProgression(subjectId, query, userInfo.id);
  }

  @Get('count')
  @ApiResponse({ schema: questionCountResponseOpenapi })
  async count(@Query() filters: QuestionFilter): Promise<QuestionCountResponse> {
    const count = await this.questionService.count(filters);
    return { data: { count } };
  }

  @Get('exists/:id')
  @ApiResponse({ schema: questionExistsResponseOpenapi })
  async exists(@Param('id', ParseIntPipe) id: number): Promise<QuestionExistsResponse> {
    const exists = await this.questionService.exists(id);
    return { data: { exists } };
  }
}
