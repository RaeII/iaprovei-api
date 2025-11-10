import { Controller, Get, Post, Put, UseGuards, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { PagbankService } from './pagbank.service';
import { PublicKeysResponse, publicKeysResponseOpenapi, CreatePlan, CreatePlanResponse, createPlanOpenapi, createPlanResponseOpenapi, CreatePlanSchema, GetPlansResponse, getPlansResponseOpenapi, CreateSubscription, CreateSubscriptionResponse, createSubscriptionOpenapi, createSubscriptionResponseOpenapi, CreateSubscriptionSchema, UpdateNotifications, UpdateNotificationsSchema, updateNotificationsOpenapi } from './schemas/pagbank.schema';
import { UserBasicInfo } from '@/modules/user/schemas/user.schema';
import { ApiBearerAuth, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
//import { RolesGuard } from '@/modules/auth/guard/roles.guard';
import { BasicUserInfo } from '@/common/decorators';
import { Role } from '@/modules/auth/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import { PlansService } from '@/modules/plans/plans.service';
import { UserPlansService } from '@/modules/user_plans/user_plans.service';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { UserPlanStatus } from '@/entities/user_plan.entity';

@Controller('pagbank')
@ApiBearerAuth()
export class PagbankController {
  constructor(
    private readonly pagbankService: PagbankService,
    private readonly plansService: PlansService,
    private readonly userPlansService: UserPlansService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: getPlansResponseOpenapi })
  async getPlans(): Promise<GetPlansResponse> {
    const data = await this.pagbankService.getPlans();
    return { data };
  }

  @Get('public-keys')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ schema: publicKeysResponseOpenapi })
  async GetPublicKeys(): Promise<PublicKeysResponse> {
    const data = await this.pagbankService.GetPublicKeys();
    return { data };
  }

  @Post('plans')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: createPlanOpenapi })
  @ApiResponse({ schema: createPlanResponseOpenapi })
  async createPlan(@Body(new ZodValidationPipe(CreatePlanSchema)) createPlanDto: CreatePlan): Promise<CreatePlanResponse> {
    const data = await this.pagbankService.createPlan(createPlanDto);
    return { data };
  }

  @Put('plans/:plan_id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'plan_id', description: 'ID do plano a ser atualizado', type: 'string' })
  @ApiBody({ schema: createPlanOpenapi })
  @ApiResponse({ schema: createPlanResponseOpenapi })
  async updatePlan(@Param('plan_id') planId: string, @Body(new ZodValidationPipe(CreatePlanSchema)) updatePlanDto: CreatePlan): Promise<CreatePlanResponse> {
    const data = await this.pagbankService.updatePlan(planId, updatePlanDto);
    return { data };
  }

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: createSubscriptionOpenapi })
  @ApiResponse({ schema: createSubscriptionResponseOpenapi })
  async createSubscription(@Body(new ZodValidationPipe(CreateSubscriptionSchema)) createSubscriptionDto: CreateSubscription, @BasicUserInfo() user: UserBasicInfo): Promise<CreateSubscriptionResponse> {
    // Validar se o plano existe usando o id_pagbank
    const plan = await this.plansService.findByIdPagbank(createSubscriptionDto.plan.id);
    const userPlan = await this.userPlansService.findByPlanId(user.id);

    if (!plan) {
      throw new DataNotFoundException(`Plano com ID PagBank "${createSubscriptionDto.plan.id}" não encontrado`);
    }

    if (userPlan.is_active) throw new BadRequestException('Usuário já possui um plano ativo');

    const data = await this.pagbankService.createSubscription(createSubscriptionDto);

    if (!userPlan) {
      await this.userPlansService.create({
        pagbank_customer_id: data.customer.id,
        pagbank_subscriber_id: data.customer.id,
        user_id: user.id,
        plan_id: plan.id,
        trial_start_at: new Date(data.trial.start_at),
        trial_end_at: new Date(data.trial.end_at),
      });
    } else {
      await this.userPlansService.update(userPlan.id, {
        status: UserPlanStatus.ACTIVE,
        is_active: true,
        pagbank_customer_id: data.customer.id,
        pagbank_subscriber_id: data.customer.id,
        trial_start_at: new Date(data.trial.start_at),
        trial_end_at: new Date(data.trial.end_at),
      });
    }
    return { data };
  }

  @Get('notifications')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getNotifications(): Promise<{ data: unknown }> {
    const data = await this.pagbankService.getNotifications();
    return { data };
  }

  @Put('notifications')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: updateNotificationsOpenapi })
  async updateNotifications(@Body(new ZodValidationPipe(UpdateNotificationsSchema)) updateNotificationsDto: UpdateNotifications): Promise<{ data: unknown }> {
    const data = await this.pagbankService.updateNotifications(updateNotificationsDto);
    return { data };
  }

  @Post('event')
  @ApiBody({ schema: updateNotificationsOpenapi })
  async eventNotification(event: any) {
    console.log('\n\neventNotificationPOST\n\n');
    console.log(event);
    console.log('\n\neventNotificationPOST\n\n');
    return {};
  }

  @Get('event')
  @ApiBody({ schema: updateNotificationsOpenapi })
  async eventNotificationGet(@Param() params: any, @Query() query: any, @Body() body: any) {
    console.log('\n\neventNotificationGET\n\n');
    console.log('params:', params);
    console.log('query:', query);
    console.log('body:', body);
    console.log('\n\neventNotificationGET\n\n');
    return {};
  }

  @Put('event')
  @ApiBody({ schema: updateNotificationsOpenapi })
  async eventNotificationPut(event: any) {
    console.log('\n\neventNotificationPut\n\n');
    console.log(event);
    console.log('\n\neventNotificationPut\n\n');
    return {};
  }
}
