import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ContestService } from './contest.service';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators/user-context.decorator';
import { ContestQuery, ContestCount, ContestListResponse, ContestDetailsResponse, ContestExistsResponse, ContestStatusSchema, contestListResponseOpenapi, contestDetailsResponseOpenapi, contestCountOpenapi, contestExistsResponseOpenapi, ContestWithSubjectsResponse, contestWithSubjectsOpenapi } from './schemas/contest.schema';
import { ContestStatus } from '@/entities/contest.entity';
import { UserBasicInfo } from '@/modules/user/schemas/user.schema';

@Controller('contests')
@ApiBearerAuth()
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: contestListResponseOpenapi })
  @ApiQuery({ name: 'status', required: false, type: String, enum: ['available', 'coming_soon', 'draft'] })
  @ApiQuery({ name: 'include_inactive', required: false, type: Boolean })
  @ApiQuery({ name: 'full_details', required: false, type: Boolean })
  async findAll(@Query() query: ContestQuery): Promise<ContestListResponse> {
    if (query.status) {
      ContestStatusSchema.parse(query.status);
    }

    const contests = await this.contestService.findAll({
      status: query.status as ContestStatus,
      include_inactive: query.include_inactive,
      full_details: query.full_details,
    });
    return { contests };
  }

  @Get('with-subjects')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: contestWithSubjectsOpenapi })
  @ApiQuery({ name: 'status', required: false, type: String, enum: ['available', 'coming_soon', 'draft'] })
  @ApiQuery({ name: 'include_inactive', required: false, type: Boolean })
  @ApiQuery({ name: 'full_details', required: false, type: Boolean })
  @ApiQuery({ name: 'order_by_last_usage', required: false, type: Boolean, description: 'Order contests by last question answered date' })
  async findAllWithSubjects(@Query() query: ContestQuery, @BasicUserInfo() userInfo: UserBasicInfo): Promise<ContestWithSubjectsResponse> {
    const contests = await this.contestService.findAllWithSubjects({
      ...query,
      userId: userInfo.id,
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
