import { Controller, Get, Post, Param, Query, Body, ParseIntPipe, UsePipes, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserAnswerService } from './user_answer.service';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { UserAnswerCreate, UserAnswerQuery, UserAnswerFilter, UserAnswerCreateSchema, UserAnswerQuerySchema, UserAnswerFilterSchema, UserAnswerListResponse, UserAnswerDetailedListResponse, UserAnswerPerformanceListResponse, UserAnswerSessionListResponse, UserAnswerDetailResponse, UserAnswerCountResponse, UserAnswerStatsResponse, UserAnswerCreateResponse, userAnswerCreateOpenapi, userAnswerListResponseOpenapi, userAnswerDetailedListResponseOpenapi, userAnswerPerformanceListResponseOpenapi, userAnswerSessionListResponseOpenapi, userAnswerDetailResponseOpenapi, userAnswerCountResponseOpenapi, userAnswerStatsResponseOpenapi, userAnswerCreateResponseOpenapi } from './schemas/user_answer.schema';

@ApiTags('User Answers')
@Controller('user-answers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserAnswerController {
  constructor(private readonly userAnswerService: UserAnswerService) {}

  /**
   * Create a new user answer
   * Validates chosen option and returns correctness information
   */
  @Post()
  @ApiBody({ schema: userAnswerCreateOpenapi })
  @ApiResponse({ schema: userAnswerCreateResponseOpenapi })
  @UsePipes(new ZodValidationPipe(UserAnswerCreateSchema))
  async create(@Body() createUserAnswerDto: UserAnswerCreate): Promise<UserAnswerCreateResponse> {
    return this.userAnswerService.create(createUserAnswerDto);
  }

  /**
   * Retrieve user answers with basic information (default view)
   * Optimized for performance with minimal data transfer
   */
  @Get()
  @ApiResponse({ schema: userAnswerListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(UserAnswerQuerySchema))
  async findAll(@Query() query: UserAnswerQuery): Promise<UserAnswerListResponse> {
    return this.userAnswerService.findAll(query);
  }

  /**
   * Retrieve user answers with detailed information
   * Includes all fields for comprehensive analysis
   */
  @Get('detailed')
  @ApiResponse({ schema: userAnswerDetailedListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(UserAnswerQuerySchema))
  async findAllDetailed(@Query() query: UserAnswerQuery): Promise<UserAnswerDetailedListResponse> {
    return this.userAnswerService.findAllDetailed(query);
  }

  /**
   * Retrieve user answers for performance analysis
   * Optimized for analytics and performance tracking
   */
  @Get('performance')
  @ApiResponse({ schema: userAnswerPerformanceListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(UserAnswerQuerySchema))
  async findAllPerformance(@Query() query: UserAnswerQuery): Promise<UserAnswerPerformanceListResponse> {
    return this.userAnswerService.findAllPerformance(query);
  }

  /**
   * Retrieve user answers by session
   * Optimized for session tracking and progress monitoring
   */
  @Get('sessions')
  @ApiResponse({ schema: userAnswerSessionListResponseOpenapi })
  @UsePipes(new ZodValidationPipe(UserAnswerQuerySchema))
  async findAllBySession(@Query() query: UserAnswerQuery): Promise<UserAnswerSessionListResponse> {
    return this.userAnswerService.findAllBySession(query);
  }

  /**
   * Get user answer statistics
   * Provides aggregated analytics data
   */
  @Get('stats')
  @ApiResponse({ schema: userAnswerStatsResponseOpenapi })
  @UsePipes(new ZodValidationPipe(UserAnswerFilterSchema))
  async getStats(@Query() filters: UserAnswerFilter): Promise<UserAnswerStatsResponse> {
    return this.userAnswerService.getStats(filters);
  }

  /**
   * Get count of user answers
   * Useful for pagination and overview statistics
   */
  @Get('count')
  @ApiResponse({ schema: userAnswerCountResponseOpenapi })
  @UsePipes(new ZodValidationPipe(UserAnswerFilterSchema))
  async count(@Query() filters: UserAnswerFilter): Promise<UserAnswerCountResponse> {
    return this.userAnswerService.count(filters);
  }

  /**
   * Retrieve single user answer with full details and relationships
   */
  @Get(':id')
  @ApiResponse({ schema: userAnswerDetailResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserAnswerDetailResponse> {
    const userAnswer = await this.userAnswerService.findOne(id);
    return { data: userAnswer };
  }
}
