import {
  Controller,
  Get,
  UseGuards /* ParseIntPipe */ /* Param, Post,Body, Query, Patch , Put, Delete */,
} from '@nestjs/common';
import { PlanDetailWithUserPlan, UserPlansService } from '@/modules/user_plans/user_plans.service';
import { UserPlansValidator } from '@/modules/user_plans/user_plans.validator';
import {
  UserPlanDetailResponse,
  userPlanListResponseOpenapi /*, UserPlanCreate, UserPlanQuery, UserPlanListResponse, UserPlanCreateResponse, UserPlanCreateSchema, UserPlanQuerySchema, userPlanCreateOpenapi, userPlanCreateResponseOpenapi  userPlanUpdateResponseOpenapi, UserPlanUpdate, UserPlanUpdateResponse, UserPlanListData, UserPlanUpdateSchema, userPlanUpdateOpenapi, userPlanDetailResponseOpenapi */,
} from './schemas/user_plan.schema';
//import { PaginationSchema, Pagination } from '@/common/schemas/pagination.schema';
//import { ZodValidationPipe } from 'nestjs-zod';
import { ApiBearerAuth, /* ApiBody */ ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { BasicUserInfo } from '@/common/decorators';
import { UserBasicInfo } from '@/modules/user/schemas/user.schema';
import { planDetailResponseOpenapi } from '@/modules/plans/schemas/plan.schema';
/* import { Role } from '@/modules/auth/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator'; */

@Controller('user-plans')
@ApiBearerAuth()
export class UserPlansController {
  constructor(
    private readonly userPlansService: UserPlansService,
    private readonly userPlansValidator: UserPlansValidator
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findByUserId(@BasicUserInfo() user: UserBasicInfo): Promise<UserPlanDetailResponse> {
    const data = await this.userPlansService.findByUserId(user.id);
    return { data };
  }

  @Get('plan/me')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: planDetailResponseOpenapi })
  async findPlanDetailByUserId(@BasicUserInfo() user: UserBasicInfo): Promise<{ data: PlanDetailWithUserPlan | null }> {
    const data = await this.userPlansService.findPlanDetailByUserId(user.id);
    return { data };
  }

  /*

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
  @ApiQuery({ name: 'user_id', required: false, type: Number })
  @ApiQuery({ name: 'plan_id', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'pagbank_subscriber_id', required: false, type: String })
  @ApiQuery({ name: 'pagbank_customer_id', required: false, type: String })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findAll(@Query(new ZodValidationPipe(PaginationSchema)) pagination: Pagination, @Query(new ZodValidationPipe(UserPlanQuerySchema)) query: UserPlanQuery): Promise<UserPlanListResponse> {
    return this.userPlansService.findAll(pagination, query);
  }



  @Get('user/:userId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanDetailResponse> {
    console.log('aqui', userId);
    await this.userPlansValidator.assertCanAccessUserPlans(userId, user);
    const data = await this.userPlansService.findByUserId(userId);
    return { data };
  }

  @Get('user/:userId/active')
  @Roles(Role.ADMIN)
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
  async findByPlanId(@Param('planId', ParseIntPipe) planId: number): Promise<{ data: UserPlanListData | null }> {
    const data = await this.userPlansService.findByPlanId(planId);
    return { data };
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanDetailResponseOpenapi })
  async findOne(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanDetailResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.findOne(id);
    return { data };
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: userPlanUpdateOpenapi })
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async update(@Param('id', ParseIntPipe) id: number, @Body(new ZodValidationPipe(UserPlanUpdateSchema)) updateUserPlanDto: UserPlanUpdate, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.update(id, updateUserPlanDto);
    return { data };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<void> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    return this.userPlansService.remove(id);
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async cancel(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.cancelUserPlan(id);
    return { data };
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async activate(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.activateUserPlan(id);
    return { data };
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async deactivate(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.deactivateUserPlan(id);
    return { data };
  }

  @Get('pagbank/subscriber/:subscriberId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanDetailResponseOpenapi })
  async findByPagbankSubscriberId(@Param('subscriberId') subscriberId: string): Promise<UserPlanDetailResponse | { data: null }> {
    const data = await this.userPlansService.findByPagbankSubscriberId(subscriberId);
    return { data };
  }

  @Get('pagbank/customer/:customerId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findByPagbankCustomerId(@Param('customerId') customerId: string): Promise<{ data: any[] }> {
    const data = await this.userPlansService.findByPagbankCustomerId(customerId);
    return { data };
  }

  @Patch(':id/pagbank-ids')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async updatePagbankIds(@Param('id', ParseIntPipe) id: number, @Body() body: { pagbank_subscriber_id?: string; pagbank_customer_id?: string }, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.updatePagbankIds(id, body.pagbank_subscriber_id, body.pagbank_customer_id);
    return { data };
  }

  @Patch(':id/trial-dates')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async updateTrialDates(@Param('id', ParseIntPipe) id: number, @Body() body: { trial_start_at?: string; trial_end_at?: string }, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const trialStartAt = body.trial_start_at ? new Date(body.trial_start_at) : undefined;
    const trialEndAt = body.trial_end_at ? new Date(body.trial_end_at) : undefined;
    const data = await this.userPlansService.updateTrialDates(id, trialStartAt, trialEndAt);
    return { data };
  }

  @Get('active')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findActiveUserPlans(@Query(new ZodValidationPipe(PaginationSchema)) pagination: Pagination): Promise<UserPlanListResponse> {
    return this.userPlansService.findActiveUserPlans(pagination);
  }

  @Get('inactive')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ schema: userPlanListResponseOpenapi })
  async findInactiveUserPlans(@Query(new ZodValidationPipe(PaginationSchema)) pagination: Pagination): Promise<UserPlanListResponse> {
    return this.userPlansService.findInactiveUserPlans(pagination);
  }

  @Patch(':id/activate-boolean')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async activateBoolean(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.activateUserPlanBoolean(id);
    return { data };
  }

  @Patch(':id/deactivate-boolean')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: userPlanUpdateResponseOpenapi })
  async deactivateBoolean(@Param('id', ParseIntPipe) id: number, @BasicUserInfo() user: UserBasicInfo): Promise<UserPlanUpdateResponse> {
    await this.userPlansValidator.assertIsOwnerOrAdmin(id, user);
    const data = await this.userPlansService.deactivateUserPlanBoolean(id);
    return { data };
  } */
}
