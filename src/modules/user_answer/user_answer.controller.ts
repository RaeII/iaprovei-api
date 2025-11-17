import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserAnswerService } from './user_answer.service';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { BasicUserInfo, SessionId } from '@/common/decorators';
import {
  UserAnswerQuery,
  UserAnswerFilter,
  UserAnswerQuerySchema,
  UserAnswerFilterSchema,
  UserAnswerListResponse,
  UserAnswerPerformanceListResponse,
  UserAnswerSessionListResponse,
  UserAnswerStatsResponse,
  UserAnswerCreateResponse,
  userAnswerCreateOpenapi,
  userAnswerListResponseOpenapi,
  userAnswerPerformanceListResponseOpenapi,
  userAnswerSessionListResponseOpenapi,
  userAnswerStatsResponseOpenapi,
  userAnswerCreateResponseOpenapi,
  UserAnswerCreatePayload,
  UserAnswerCreatePayloadSchema,
} from './schemas/user_answer.schema';
import { UserBasicInfo } from '@/modules/user/schemas/user.schema';

@ApiTags('User Answers')
@Controller('user-answers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserAnswerController {
  constructor(private readonly userAnswerService: UserAnswerService) {}

  /**
   * Create a new user answer
   * Validates chosen option and returns correctness information
   * Session ID is automatically generated from JWT token (not sent by frontend)
   */
  @Post()
  @ApiBody({ schema: userAnswerCreateOpenapi })
  @ApiResponse({ schema: userAnswerCreateResponseOpenapi })
  async create(
    @Body(new ZodValidationPipe(UserAnswerCreatePayloadSchema)) createUserAnswerDto: UserAnswerCreatePayload,
    @BasicUserInfo() userBasicInfo: UserBasicInfo,
    @SessionId() sessionId: string
  ): Promise<UserAnswerCreateResponse> {
    return this.userAnswerService.create({ ...createUserAnswerDto, users_id: userBasicInfo.id }, sessionId);
  }

  /**
   * Retrieve user answers with basic information (default view)
   * Optimized for performance with minimal data transfer
   */
  @Get('me')
  @ApiResponse({ schema: userAnswerListResponseOpenapi })
  async findAll(
    @Query(new ZodValidationPipe(UserAnswerQuerySchema)) query: UserAnswerQuery,
    @BasicUserInfo() userInfo: UserBasicInfo
  ): Promise<UserAnswerListResponse> {
    return this.userAnswerService.findAll(query, userInfo.id);
  }

  // /**
  //  * Retrieve user answers with detailed information
  //  * Includes all fields for comprehensive analysis
  //  */
  // @Get('detailed')
  // @ApiResponse({ schema: userAnswerDetailedListResponseOpenapi })
  // @UsePipes(new ZodValidationPipe(UserAnswerQuerySchema))
  // async findAllDetailed(@Query() query: UserAnswerQuery): Promise<UserAnswerDetailedListResponse> {
  //   return this.userAnswerService.findAllDetailed(query);
  // }

  /**
   * Retrieve user answers for performance analysis
   * Optimized for analytics and performance tracking
   */
  @Get('performance')
  @ApiResponse({ schema: userAnswerPerformanceListResponseOpenapi })
  async findAllPerformance(
    @Query(new ZodValidationPipe(UserAnswerQuerySchema)) query: UserAnswerQuery,
    @BasicUserInfo() userInfo: UserBasicInfo
  ): Promise<UserAnswerPerformanceListResponse> {
    return this.userAnswerService.findAllPerformance(query, userInfo.id);
  }

  /**
   * Retrieve user answers by session
   * Optimized for session tracking and progress monitoring
   */
  @Get('sessions')
  @ApiResponse({ schema: userAnswerSessionListResponseOpenapi })
  async findAllBySession(
    @Query(new ZodValidationPipe(UserAnswerQuerySchema)) query: UserAnswerQuery,
    @BasicUserInfo() userInfo: UserBasicInfo
  ): Promise<UserAnswerSessionListResponse> {
    return this.userAnswerService.findAllBySession(query, userInfo.id);
  }

  /**
   * Get user answer statistics
   * Provides aggregated analytics data
   */
  @Get('stats')
  @ApiResponse({ schema: userAnswerStatsResponseOpenapi })
  async getStats(
    @Query(new ZodValidationPipe(UserAnswerFilterSchema)) filters: UserAnswerFilter,
    @BasicUserInfo() userInfo: UserBasicInfo
  ): Promise<UserAnswerStatsResponse> {
    return this.userAnswerService.getStats(filters, userInfo.id);
  }

  // /**
  //  * Get count of user answers
  //  * Useful for pagination and overview statistics
  //  */
  // @Get('count')
  // @ApiResponse({ schema: userAnswerCountResponseOpenapi })
  // @UsePipes(new ZodValidationPipe(UserAnswerFilterSchema))
  // async count(@Query() filters: UserAnswerFilter): Promise<UserAnswerCountResponse> {
  //   return this.userAnswerService.count(filters);
  // }

  // /**
  //  * Retrieve single user answer with full details and relationships
  //  */
  // @Get(':id')
  // @ApiResponse({ schema: userAnswerDetailResponseOpenapi })
  // async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserAnswerDetailResponse> {
  //   const userAnswer = await this.userAnswerService.findOne(id);
  //   return { data: userAnswer };
  // }
}
