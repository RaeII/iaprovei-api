import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { StatisticsService } from './statistics.service';
import { StatisticsQuery, userPerformanceStatsResponseOpenapi, skillCategoryPerformanceStatsListResponseOpenapi, dailyPerformanceStatsListResponseOpenapi, performanceTrendResponseOpenapi, comprehensiveUserStatsResponseOpenapi } from './schemas/statistics.schema';
import { BasicUserInfo } from '@/common/decorators';
import { UserBasicInfo } from '../user/schemas/user.schema';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('user/performance')
  @ApiOperation({
    summary: 'Get user performance statistics',
    description: 'Retrieve comprehensive performance statistics for the authenticated user including success rate, error rate, average response time, and question counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'User performance statistics retrieved successfully',
    schema: userPerformanceStatsResponseOpenapi,
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics from this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics until this date (YYYY-MM-DD)',
  })
  async getUserPerformanceStats(@Query() query: StatisticsQuery, @BasicUserInfo() userBasicInfo: UserBasicInfo) {
    return this.statisticsService.getUserPerformanceStats(userBasicInfo.id, query);
  }

  @Get('user/skill-categories')
  @ApiOperation({
    summary: 'Get user performance by skill category',
    description: 'Retrieve performance statistics broken down by skill category/discipline for the authenticated user across all simulados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Skill category performance statistics retrieved successfully',
    schema: skillCategoryPerformanceStatsListResponseOpenapi,
  })
  @ApiQuery({
    name: 'skill_category_id',
    required: false,
    type: 'number',
    description: 'Filter statistics for a specific skill category',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics from this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics until this date (YYYY-MM-DD)',
  })
  async getUserPerformanceBySkillCategory(@Query() query: StatisticsQuery, @BasicUserInfo() userBasicInfo: UserBasicInfo) {
    return this.statisticsService.getUserPerformanceBySkillCategory(userBasicInfo.id, query);
  }

  @Get('user/daily')
  @ApiOperation({
    summary: 'Get daily performance statistics',
    description: 'Retrieve daily performance statistics for the authenticated user over a specified time period.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily performance statistics retrieved successfully',
    schema: dailyPerformanceStatsListResponseOpenapi,
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics from this date (YYYY-MM-DD). Defaults to 30 days ago.',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics until this date (YYYY-MM-DD). Defaults to today.',
  })
  async getDailyPerformanceStats(@Query() query: StatisticsQuery, @BasicUserInfo() userBasicInfo: UserBasicInfo) {
    return this.statisticsService.getDailyPerformanceStats(userBasicInfo.id, query);
  }

  @Get('user/trend')
  @ApiOperation({
    summary: 'Get performance trend',
    description: 'Retrieve performance trend over time with configurable time periods (day, week, month, year).',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance trend retrieved successfully',
    schema: performanceTrendResponseOpenapi,
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Time period for trend analysis. Defaults to "day".',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics from this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics until this date (YYYY-MM-DD)',
  })
  async getPerformanceTrend(@Query() query: StatisticsQuery, @BasicUserInfo() userBasicInfo: UserBasicInfo) {
    return this.statisticsService.getPerformanceTrend(userBasicInfo.id, query);
  }

  @Get('user/comprehensive')
  @ApiOperation({
    summary: 'Get comprehensive user statistics',
    description: 'Retrieve all available statistics for the authenticated user in a single response including performance, subject breakdown, daily stats, and trends.',
  })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive user statistics retrieved successfully',
    schema: comprehensiveUserStatsResponseOpenapi,
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics from this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Filter statistics until this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Time period for trend analysis. Defaults to "day".',
  })
  async getComprehensiveUserStats(@Query() query: StatisticsQuery, @BasicUserInfo() userBasicInfo: UserBasicInfo) {
    return this.statisticsService.getComprehensiveUserStats(userBasicInfo.id, query);
  }
}
