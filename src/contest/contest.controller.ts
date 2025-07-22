import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ContestService } from './contest.service';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators/user-context.decorator';
import { ContestQuery, ContestCount, ContestListResponse, ContestDetailsResponse, ContestExistsResponse, ContestStatusSchema, contestListResponseOpenapi, contestDetailsResponseOpenapi, contestCountOpenapi, contestExistsResponseOpenapi, ContestWithSubjectsResponse, contestWithSubjectsOpenapi } from './schemas/contest.schema';
import { ContestStatus } from '@/entities/contest.entity';

@Controller('contests')
@ApiBearerAuth()
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: contestListResponseOpenapi })
  async findAll(@Query() query: ContestQuery): Promise<ContestListResponse> {
    if (query.status) {
      ContestStatusSchema.parse(query.status);
    }

    const contests = await this.contestService.findAll({
      status: query.status as ContestStatus,
      includeInactive: query.includeInactive,
      fullDetails: query.fullDetails,
    });
    return { contests };
  }

  @Get('with-subjects')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: contestWithSubjectsOpenapi })
  async findAllWithSubjects(@Query() query: ContestQuery, @BasicUserInfo() userInfo: { user_id: number; username: string }): Promise<ContestWithSubjectsResponse> {
    const contests = await this.contestService.findAllWithSubjects({
      ...query,
      userId: userInfo.user_id,
    });
    return { data: contests };
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: contestCountOpenapi })
  async getCount(@Query('status') status?: ContestStatus): Promise<ContestCount> {
    if (status) {
      ContestStatusSchema.parse(status);
    }

    const count = await this.contestService.countByStatus(status);
    return { count };
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: contestListResponseOpenapi })
  async findByStatus(@Param('status') status: ContestStatus): Promise<ContestListResponse> {
    ContestStatusSchema.parse(status);

    const contests = await this.contestService.findByStatus(status);
    return { contests };
  }

  @Get('slug/:slug')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: contestDetailsResponseOpenapi })
  async findBySlug(@Param('slug') slug: string): Promise<ContestDetailsResponse> {
    const contest = await this.contestService.findBySlug(slug);
    return { contest };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: contestDetailsResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ContestDetailsResponse> {
    const contest = await this.contestService.findOne(id);
    return { contest };
  }

  @Get(':id/exists')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: contestExistsResponseOpenapi })
  async checkExists(@Param('id', ParseIntPipe) id: number): Promise<ContestExistsResponse> {
    const exists = await this.contestService.exists(id);
    return { exists };
  }
}
