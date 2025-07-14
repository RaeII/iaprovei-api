import { Controller, Get, Param, Query, ParseIntPipe, UsePipes, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { QuestionOptionService } from './question_option.service';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { AnsweredQuestionGuard } from './guard/answered-question.guard';
import { QuestionOptionQuerySchema, QuestionOptionQuery, QuestionOptionListResponse, QuestionOptionDetailedListResponse, QuestionOptionDetailResponse, QuestionOptionCountResponse, QuestionOptionExistsResponse, QuestionOptionFilter, questionOptionListResponseOpenapi, questionOptionDetailedListResponseOpenapi, questionOptionDetailResponseOpenapi, questionOptionCountResponseOpenapi, questionOptionExistsResponseOpenapi } from './schemas/question_option.schema';

@ApiTags('Question options')
@Controller('question-options')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuestionOptionController {
  constructor(private questionOptionService: QuestionOptionService) {}

  @Get()
  @ApiResponse({ schema: questionOptionListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(QuestionOptionQuerySchema))
  async findAll(@Query() query: QuestionOptionQuery): Promise<QuestionOptionListResponse> {
    return this.questionOptionService.findAll(query);
  }

  /**
   * Retrieve question options with detailed information
   * PROTECTED: Only accessible after user has answered the question
   * Prevents cheating by viewing answers before submitting
   */
  @Get('detailed')
  @UseGuards(AnsweredQuestionGuard)
  @ApiResponse({ schema: questionOptionDetailedListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(QuestionOptionQuerySchema))
  async findAllDetailed(@Query() query: QuestionOptionQuery): Promise<QuestionOptionDetailedListResponse> {
    return this.questionOptionService.findAllDetailed(query);
  }

  /**
   * Retrieve single question option with detailed information
   * PROTECTED: Only accessible after user has answered the question
   * Prevents cheating by viewing answers before submitting
   */
  @Get(':id')
  @UseGuards(AnsweredQuestionGuard)
  @ApiResponse({ schema: questionOptionDetailResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<QuestionOptionDetailResponse> {
    return { data: await this.questionOptionService.findOne(id) };
  }

  @Get('question/:questionId')
  @ApiResponse({ schema: questionOptionListResponseOpenapi })
  async findByQuestion(@Param('questionId', ParseIntPipe) questionId: number, @Query(new ZodValidationPipe(QuestionOptionQuerySchema.omit({ question_id: true }))) query: Omit<QuestionOptionQuery, 'question_id'>): Promise<QuestionOptionListResponse> {
    return this.questionOptionService.findByQuestion(questionId, query);
  }

  /**
   * Retrieve question options with detailed information for a specific question
   * PROTECTED: Only accessible after user has answered the question
   * Prevents cheating by viewing answers before submitting
   */
  @Get('question/:questionId/detailed')
  @UseGuards(AnsweredQuestionGuard)
  @ApiResponse({ schema: questionOptionDetailedListResponseOpenapi })
  async findByQuestionDetailed(@Param('questionId', ParseIntPipe) questionId: number, @Query(new ZodValidationPipe(QuestionOptionQuerySchema.omit({ question_id: true }))) query: Omit<QuestionOptionQuery, 'question_id'>): Promise<QuestionOptionDetailedListResponse> {
    return this.questionOptionService.findByQuestionDetailed(questionId, query);
  }

  /**
   * TODO: When use this, we MUST mark as hinted the answer for the user
   */
  @Get('question/:questionId/correct')
  @ApiResponse({ schema: questionOptionListResponseOpenapi })
  async findCorrectByQuestion(@Param('questionId', ParseIntPipe) questionId: number): Promise<QuestionOptionListResponse> {
    return this.questionOptionService.findCorrectByQuestion(questionId);
  }

  @Get('count')
  @ApiResponse({ schema: questionOptionCountResponseOpenapi })
  async count(@Query() filters: QuestionOptionFilter): Promise<QuestionOptionCountResponse> {
    const count = await this.questionOptionService.count(filters);
    return { data: { count } };
  }

  @Get('question/:questionId/count')
  @ApiResponse({ schema: questionOptionCountResponseOpenapi })
  async countByQuestion(@Param('questionId', ParseIntPipe) questionId: number): Promise<QuestionOptionCountResponse> {
    const count = await this.questionOptionService.countByQuestion(questionId);
    return { data: { count } };
  }

  @Get('exists/:id')
  @ApiResponse({ schema: questionOptionExistsResponseOpenapi })
  async exists(@Param('id', ParseIntPipe) id: number): Promise<QuestionOptionExistsResponse> {
    const exists = await this.questionOptionService.exists(id);
    return { data: { exists } };
  }

  @Get('question/:questionId/exists')
  @ApiResponse({ schema: questionOptionExistsResponseOpenapi })
  async existsByQuestion(@Param('questionId', ParseIntPipe) questionId: number): Promise<QuestionOptionExistsResponse> {
    const exists = await this.questionOptionService.existsByQuestion(questionId);
    return { data: { exists } };
  }
}
