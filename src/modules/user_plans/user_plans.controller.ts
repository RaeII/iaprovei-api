import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe, Patch } from '@nestjs/common';
import { UserPlansService } from '@/modules/user_plans/user_plans.service';
import { UserPlansValidator } from '@/modules/user_plans/user_plans.validator';
import { UserPlanCreate, UserPlanUpdate, UserPlanQuery, UserPlanListResponse, UserPlanDetailResponse, UserPlanCreateResponse, UserPlanUpdateResponse, UserPlanCreateSchema, UserPlanUpdateSchema, UserPlanQuerySchema, userPlanListResponseOpenapi, userPlanDetailResponseOpenapi, userPlanCreateOpenapi, userPlanUpdateOpenapi, userPlanCreateResponseOpenapi, userPlanUpdateResponseOpenapi } from './schemas/user_plan.schema';
import { PaginationSchema, Pagination } from '@/common/schemas/pagination.schema';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators';
import { UserBasicInfo } from '@/modules/user/schemas/user.schema';
import { Role } from '@/modules/auth/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('user-plans')
@ApiBearerAuth()
export class UserPlansController {
  constructor(
    private readonly userPlansService: UserPlansService,
    private readonly userPlansValidator: UserPlansValidator
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: userPlanCreateOpenapi })
  @ApiResponse({ schema: userPlanCreateResponseOpenapi })
  async create(@Body(new ZodValidationPipe(UserPlanCreateSchema)) createUserPlanDto: UserPlanCreate, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanCreateResponse> {
    // Ensure user can only create plans for themselves (unless admin)
    await this.userPlansValidator.assertCanAccessUserPlans(createUserPlanDto.user_id, user);

    const data = await this.userPlansService.create(createUserPlanDto);
    return { data };
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findAll(@Query(new ZodValidationPipe(PaginationSchema)) pagination: Pagination, @Query(new ZodValidationPipe(UserPlanQuerySchema)) query: UserPlanQuery): Promise<UserPlanListResponse> {
    console.log('aqui', query);
    return this.userPlansService.findAll(pagination, query);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number, @Query(new ZodValidationPipe(PaginationSchema)) pagination: Pagination, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanListResponse> {
    console.log('aqui', userId);
    await this.userPlansValidator.assertCanAccessUserPlans(userId, user);
    return this.userPlansService.findByUserId(userId, pagination);
  }

  @Get('user/:userId/active')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findActiveByUserId(@Param('userId', ParseIntPipe) userId: number, @BasicUserInfo() user: UserBasicInfo): Promise<{ data: any[] }> {
    await this.userPlansValidator.assertCanAccessUserPlans(userId, user);
    const data = await this.userPlansService.findActiveByUserId(userId);
    return { data };
  }

  @Get('plan/:planId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findByPlanId(@Param('planId', ParseIntPipe) planId: number, @Query(new ZodValidationPipe(PaginationSchema)) pagination: Pagination): Promise<UserPlanListResponse> {
    return this.userPlansService.findByPlanId(planId, pagination);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanDetailResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanDetailResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.findOne(id);
    return { data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: userPlanUpdateOpenapi })
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async update(@Param('id', ParseIntPipe) id: number, @Body(new ZodValidationPipe(UserPlanUpdateSchema)) updateUserPlanDto: UserPlanUpdate, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.update(id, updateUserPlanDto);
    return { data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<void> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    return this.userPlansService.remove(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async cancel(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.cancelUserPlan(id);
    return { data };
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async activate(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.activateUserPlan(id);
    return { data };
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async deactivate(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.deactivateUserPlan(id);
    return { data };
  }
}
