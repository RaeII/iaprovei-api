import { Controller, Get, Param, Query, ParseIntPipe, UsePipes, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { QuestionQuerySchema, QuestionQuery, QuestionListResponse, QuestionDetailedListResponse, QuestionStatsListResponse, QuestionDetailResponse, questionListResponseOpenapi, questionDetailedListResponseOpenapi, questionStatsListResponseOpenapi, questionDetailResponseOpenapi, questionExistsResponseOpenapi, QuestionExistsResponse, QuestionCountResponse, questionCountResponseOpenapi, QuestionFilter } from './schemas/question.schema';

@ApiTags('Question')
@Controller('questions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Get()
  @ApiResponse({ schema: questionListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(QuestionQuerySchema))
  async findAll(@Query() query: QuestionQuery): Promise<QuestionListResponse> {
    return this.questionService.findAll(query);
  }

  @Get('detailed')
  @ApiResponse({ schema: questionDetailedListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(QuestionQuerySchema))
  async findAllDetailed(@Query() query: QuestionQuery): Promise<QuestionDetailedListResponse> {
    return this.questionService.findAllDetailed(query);
  }

  @Get('stats')
  @ApiResponse({ schema: questionStatsListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(QuestionQuerySchema))
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
  async findBySubject(@Param('subjectId', ParseIntPipe) subjectId: number, @Query(new ZodValidationPipe(QuestionQuerySchema.omit({ subject_id: true }))) query: Omit<QuestionQuery, 'subject_id'>): Promise<QuestionListResponse> {
    return this.questionService.findBySubject(subjectId, query);
  }

  @Get('difficulty/:level')
  @ApiResponse({ schema: questionListResponseOpenapi })
  async findByDifficultyLevel(@Param('level') difficultyLevel: string, @Query(new ZodValidationPipe(QuestionQuerySchema.omit({ difficulty_level: true }))) query: Omit<QuestionQuery, 'difficulty_level'>): Promise<QuestionListResponse> {
    return this.questionService.findByDifficultyLevel(difficultyLevel, query);
  }

  @Get('exam/:examBoard/:examYear')
  @ApiResponse({ schema: questionListResponseOpenapi })
  async findByExam(@Param('examBoard') examBoard: string, @Param('examYear', ParseIntPipe) examYear: number, @Query(new ZodValidationPipe(QuestionQuerySchema.omit({ exam_board: true, exam_year: true }))) query: Omit<QuestionQuery, 'exam_board' | 'exam_year'>): Promise<QuestionListResponse> {
    return this.questionService.findByExam(examBoard, examYear, query);
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
