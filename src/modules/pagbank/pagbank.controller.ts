import { Controller, Get, Post, Put, Delete, UseGuards, Body, Param, BadRequestException, Query } from '@nestjs/common';
import { PagbankService } from './pagbank.service';
import {
  PublicKeysResponse,
  publicKeysResponseOpenapi,
  CreatePlan,
  CreatePlanResponse,
  createPlanOpenapi,
  createPlanResponseOpenapi,
  CreatePlanSchema,
  GetPlansResponse,
  getPlansResponseOpenapi,
  CreateSubscription,
  CreateSubscriptionResponse,
  createSubscriptionOpenapi,
  createSubscriptionResponseOpenapi,
  CreateSubscriptionSchema,
  UpdateNotifications,
  UpdateNotificationsSchema,
  updateNotificationsOpenapi,
  GetSubscriptionsQuery,
  GetSubscriptionsResponse,
  GetSubscriptionsQuerySchema,
  getSubscriptionsResponseOpenapi,
  CreateCustomerSimple,
  CreateCustomerResponse,
  CreateCustomerSimpleSchema,
  createCustomerSimpleOpenapi,
  createCustomerResponseOpenapi,
  PublicKeys,
} from './schemas/pagbank.schema';
import { UserBasicInfo } from '@/modules/user/schemas/user.schema';
import { ApiBearerAuth, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt-auth.guard';
import { AdminGuard } from '@/modules/auth/guard/admin.guard';
import { BasicUserInfo, AdminOnly } from '@/common/decorators';
import { ZodValidationPipe } from 'nestjs-zod';
import { PlansService } from '@/modules/plans/plans.service';
import { UserPlansService } from '@/modules/user_plans/user_plans.service';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { UserPlanStatus } from '@/entities/user_plan.entity';
import { UserPlanDetail } from '@/modules/user_plans/schemas/user_plan.schema';
import { DiscordLogService } from '@/shared/services/discord-log.service';
import { RecaptchaService } from '@/shared/services/recaptcha.service';

@Controller('pagbank')
@ApiBearerAuth()
export class PagbankController {
  constructor(
    private readonly pagbankService: PagbankService,
    private readonly plansService: PlansService,
    private readonly userPlansService: UserPlansService,
    private readonly discordLogService: DiscordLogService,
    private readonly recaptchaService: RecaptchaService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiResponse({ schema: getPlansResponseOpenapi })
  async getPlans(): Promise<GetPlansResponse> {
    const data = await this.pagbankService.getPlans();
    return { data };
  }

  @Get('public-key')
  @ApiResponse({ schema: publicKeysResponseOpenapi })
  async getLocalPublicKey(): Promise<PublicKeys> {
    const data = await this.pagbankService.getLocalPublicKey();
    return data;
  }

  @Get('public-keys')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiResponse({ schema: publicKeysResponseOpenapi })
  async GetPublicKeys(): Promise<PublicKeysResponse> {
    const data = await this.pagbankService.GetPublicKeys();
    return { data };
  }

  @Put('public-keys')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiResponse({ schema: publicKeysResponseOpenapi })
  async PutPublicKeys(): Promise<PublicKeysResponse> {
    const data = await this.pagbankService.PutPublicKeys();
    return { data };
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBody({ schema: createPlanOpenapi })
  @ApiResponse({ schema: createPlanResponseOpenapi })
  async createPlan(
    @Body(new ZodValidationPipe(CreatePlanSchema)) createPlanDto: CreatePlan
  ): Promise<CreatePlanResponse> {
    const data = await this.pagbankService.createPlan(createPlanDto);
    return { data };
  }

  @Post('customers')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBody({ schema: createCustomerSimpleOpenapi })
  @ApiResponse({ schema: createCustomerResponseOpenapi })
  async createCustomer(
    @Body(new ZodValidationPipe(CreateCustomerSimpleSchema)) createCustomerDto: CreateCustomerSimple
  ): Promise<CreateCustomerResponse> {
    const data = await this.pagbankService.createCustomer(createCustomerDto);
    return { data };
  }

  @Put('plans/:plan_id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiParam({ name: 'plan_id', description: 'ID do plano a ser atualizado', type: 'string' })
  @ApiBody({ schema: createPlanOpenapi })
  @ApiResponse({ schema: createPlanResponseOpenapi })
  async updatePlan(
    @Param('plan_id') planId: string,
    @Body(new ZodValidationPipe(CreatePlanSchema)) updatePlanDto: CreatePlan
  ): Promise<CreatePlanResponse> {
    const data = await this.pagbankService.updatePlan(planId, updatePlanDto);
    return { data };
  }

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ schema: createSubscriptionOpenapi })
  @ApiResponse({ schema: createSubscriptionResponseOpenapi })
  async createSubscription(
    @Body(new ZodValidationPipe(CreateSubscriptionSchema))
    createSubscriptionDto: CreateSubscription & { recaptcha_token?: string },
    @BasicUserInfo() user: UserBasicInfo
  ): Promise<CreateSubscriptionResponse> {
    try {
      // Validar reCAPTCHA se o token estiver presente
      if (createSubscriptionDto.recaptcha_token) {
        const isValidCaptcha = await this.recaptchaService.validateToken(createSubscriptionDto.recaptcha_token);
        if (!isValidCaptcha) {
          throw new BadRequestException('Falha na verificação de segurança. Por favor, tente novamente.');
        }
      }

      // Remove o token do reCAPTCHA antes de processar a subscription
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { recaptcha_token, ...subscriptionData } = createSubscriptionDto;
      console.log('subscriptionData id', subscriptionData.plan.id);
      // Validar se o plano existe usando o id_pagbank
      const plan = await this.plansService.findOne(Number(subscriptionData.plan.id));
      const userPlan = await this.userPlansService.findByUserId(user.id);

      if (!plan) {
        throw new DataNotFoundException(`Plano com ID PagBank "${subscriptionData.plan.id}" não encontrado`);
      }

      if (userPlan?.is_active) throw new BadRequestException('Usuário já possui um plano ativo');

      /**
       * Atualiza o id para id do plano do Pagbank
       */
      subscriptionData.plan.id = plan.id_pagbank;
      console.log('subscriptionData id_pagbank', subscriptionData.plan.id);

      if (userPlan?.pagbank_customer_id) {
        /* 
          Atualizar as informações de cobrança do customer no PagBank
          O usuário pode está fazendo a assinatura com um cartão diferente do que está cadastrado no PagBank
          O cartão fica no customer do PagBank, mas o cartão é atualizado no billing_info 
        */
        await this.pagbankService.updateCustomerBillingInfo(userPlan.pagbank_customer_id, [
          {
            card: {
              encrypted: subscriptionData.customer.billing_info[0].card.encrypted,
              security_code: subscriptionData.payment_method[0].card.security_code,
            },
            type: subscriptionData.payment_method[0].type as 'CREDIT_CARD' | 'DEBIT_CARD',
          },
        ]);
        /**
         * Se o usuário já possui um customer no PagBank, é passado o id do customer para a criação da subscription
         */
        subscriptionData.customer = { id: userPlan.pagbank_customer_id } as any;
      }

      const data = await this.pagbankService.createSubscription(subscriptionData);

      console.log('subscriptions', data);

      if (!userPlan) {
        await this.userPlansService.create({
          pagbank_customer_id: data.customer.id,
          pagbank_subscriber_id: data.id,
          user_id: user.id,
          plan_id: plan.id,
          next_invoice_at: data.next_invoice_at,
          trial_start_at: new Date(data.trial.start_at),
          trial_end_at: new Date(data.trial.end_at),
        });
      } else {
        await this.userPlansService.update(userPlan.id, {
          status: data.status,
          is_active: true,
          pagbank_customer_id: data.customer.id,
          pagbank_subscriber_id: data.id,
          trial_start_at: new Date(data.trial.start_at),
          next_invoice_at: data.next_invoice_at,
          trial_end_at: new Date(data.trial.end_at),
        });

        await this.discordLogService
          .payment({
            title: 'NOVO PAGAMENTO',
            message: `
          **_ _\nUsuário:** ${user.id}
          **Nome:** ${user.username}
          **pagbank_customer_id:** ${data.customer.id}
          **pagbank_subscriber_id:** ${data.id}
          **trial_start_at:** ${data.trial.start_at}
          **trial_end_at:** ${data.trial.end_at}
          **next_invoice_at:** ${data.next_invoice_at}
          **Plano:** ${plan.id}
          **Amount:** ${data.amount.value}
          **Status:** ${data.status}
          `,
          })
          .catch(error => {
            console.log('Erro ao enviar log de pagamento', error);
          });
      }
      return { data };
    } catch (error) {
      console.log('\n\n error ao criar assinatura', error, '\n\n');
      await this.discordLogService
        .error({
          title: 'ERRO AO CRIAR ASSINATURA',
          message: `
          **_ _\nUsuário:** ${user.id}
          **Nome:** ${user.username}`,
          ...error,
        })
        .catch(error => {
          console.log('Erro ao enviar log de erro ao criar assinatura', error);
        });
      throw error;
    }
  }

  @Delete('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@BasicUserInfo() user: UserBasicInfo): Promise<{ data: UserPlanDetail }> {
    try {
      const userPlan = await this.userPlansService.findByUserId(user.id);

      if (!userPlan) {
        throw new DataNotFoundException(
          `Plano ativo para o usuário "${user.id}"`,
          'Plano do usuário',
          PagbankController.name
        );
      }

      if (!userPlan.is_active || !userPlan.pagbank_subscriber_id) {
        throw new BadRequestException('Usuário não possui um plano ativo para cancelamento');
      }

      const response = await this.pagbankService.cancelSubscription(userPlan.pagbank_subscriber_id);
      console.log('\n\n response Cancel Subscription PagBank', response, '\n\n');

      const data = await this.userPlansService.update(userPlan.id, {
        status: UserPlanStatus.CANCELLED,
        is_active: false,
      });

      await this.discordLogService
        .cancellation({
          title: 'CANCELAMENTO DE PAGAMENTO',
          message: `
        **_ _\nUsuário:** ${user.id}
        **Nome:** ${user.username}
        **pagbank_customer_id:** ${userPlan.pagbank_customer_id}
        **pagbank_subscriber_id:** ${userPlan.pagbank_subscriber_id}
        **next_invoice_at:** ${userPlan.next_invoice_at}
        **Plano:** ${userPlan.plan_id}
        `,
        })
        .catch(error => {
          console.log('Erro ao enviar log de cancelamento de pagamento', error);
        });

      return { data };
    } catch (error) {
      console.log('\n\n ERROR AO CANCELAR ASSINATURA', error, '\n\n');
      await this.discordLogService
        .error({
          title: 'ERRO AO CANCELAR ASSINATURA',
          message: `
          **_ _\nUsuário:** ${user.id}
          **Nome:** ${user.username}`,
          ...error,
        })
        .catch(error => {
          console.log('Erro ao enviar log de erro ao cancelar assinatura', error);
        });
      throw error;
    }
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiResponse({ schema: getSubscriptionsResponseOpenapi })
  @ApiQuery({ name: 'reference_id', required: false, type: String, description: 'ID de referência da subscription' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: [String],
    enum: ['ACTIVE', 'EXPIRED', 'CANCELED', 'SUSPENDED', 'OVERDUE', 'TRIAL', 'PENDING', 'PENDING_ACTION'],
    isArray: true,
    description: 'Filtro por status da subscription',
  })
  @ApiQuery({
    name: 'payment_method_type',
    required: false,
    type: [String],
    enum: ['BOLETO', 'CREDIT_CARD'],
    isArray: true,
    description: 'Filtro por tipo de método de pagamento',
  })
  @ApiQuery({
    name: 'created_at_start',
    required: false,
    type: String,
    description: 'Data de início para filtro (formato: YYYY-MM-DD)',
    example: '2020-01-02',
  })
  @ApiQuery({
    name: 'created_at_end',
    required: false,
    type: String,
    description: 'Data de fim para filtro (formato: YYYY-MM-DD)',
    example: '2020-01-02',
  })
  async getSubscriptions(
    @Query(new ZodValidationPipe(GetSubscriptionsQuerySchema)) queryParams: GetSubscriptionsQuery
  ): Promise<GetSubscriptionsResponse> {
    const data = await this.pagbankService.getSubscriptions(queryParams);
    return { data };
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  async getNotifications(): Promise<{ data: unknown }> {
    const data = await this.pagbankService.getNotifications();
    return { data };
  }

  @Put('notifications')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @ApiBody({ schema: updateNotificationsOpenapi })
  async updateNotifications(
    @Body(new ZodValidationPipe(UpdateNotificationsSchema)) updateNotificationsDto: UpdateNotifications
  ): Promise<{ data: unknown }> {
    const data = await this.pagbankService.updateNotifications(updateNotificationsDto);
    return { data };
  }

  @Post('oauth2/token')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  async requestOAuth2Token(): Promise<{ data: unknown }> {
    const data = await this.pagbankService.requestOAuth2Token();
    console.log('\n\n data OAuth2 Token', data, '\n\n');
    return { data };
  }

  @Post('certificates')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  async createCertificate(): Promise<{ data: unknown }> {
    const data = await this.pagbankService.createCertificate();
    return { data };
  }
}
