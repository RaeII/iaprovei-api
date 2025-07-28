import { Controller, Get, Param, Query, ParseIntPipe, UsePipes, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { QuestionOptionService } from './question_option.service';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { AnsweredQuestionGuard } from './guard/answered-question.guard';
import { QuestionOptionQuerySchema, QuestionOptionQuery, QuestionOptionListResponse, QuestionOptionDetailedListResponse, QuestionOptionDetailResponse, QuestionOptionCountResponse, QuestionOptionExistsResponse, questionOptionListResponseOpenapi, questionOptionDetailedListResponseOpenapi, questionOptionDetailResponseOpenapi, questionOptionCountResponseOpenapi, questionOptionExistsResponseOpenapi } from './schemas/question_option.schema';

@ApiTags('Question options')
@Controller('question/:questionId/options')
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
   * TODO: When use this, we MUST mark as hinted the answer for the user
   */
  @Get('correct')
  @ApiResponse({ schema: questionOptionListResponseOpenapi })
  async findCorrectByQuestion(@Param('questionId', ParseIntPipe) questionId: number): Promise<QuestionOptionListResponse> {
    return this.questionOptionService.findCorrectByQuestion(questionId);
  }

  @Get('count')
  @ApiResponse({ schema: questionOptionCountResponseOpenapi })
  async countByQuestion(@Param('questionId', ParseIntPipe) questionId: number): Promise<QuestionOptionCountResponse> {
    const count = await this.questionOptionService.countByQuestion(questionId);
    return { data: { count } };
  }

  @Get('exists')
  @ApiResponse({ schema: questionOptionExistsResponseOpenapi })
  async existsByQuestion(@Param('questionId', ParseIntPipe) questionId: number): Promise<QuestionOptionExistsResponse> {
    const exists = await this.questionOptionService.existsByQuestion(questionId);
    return { data: { exists } };
  }

  @Get('exists/:id')
  @ApiResponse({ schema: questionOptionExistsResponseOpenapi })
  async exists(@Param('id', ParseIntPipe) id: number): Promise<QuestionOptionExistsResponse> {
    const exists = await this.questionOptionService.exists(id);
    return { data: { exists } };
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
}
