import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PagbankService } from '@/modules/pagbank/pagbank.service';
import { UserPlansService } from '@/modules/user_plans/user_plans.service';
import { UserPlanStatusSchema } from '@/modules/user_plans/schemas/user_plan.schema';
import { DiscordLogService } from '@/shared/services/discord-log.service';

@Injectable()
export class PaymentsCron implements OnModuleInit {
  constructor(
    private readonly pagbankService: PagbankService,
    private readonly userPlansService: UserPlansService,
    private readonly discordLogService: DiscordLogService
  ) {}

  async onModuleInit() {
    await this.handleCron();
  }

  @Cron('0 */2 * * * *')
  async handleCron() {
    try {
      console.log('Dale cron job');
      const subscriptions = await this.pagbankService.getSubscriptions({
        created_at_start: '2025-11-26',
        created_at_end: '2025-11-28',
      });

      const userPlans = await this.userPlansService.findAll({ limit: 1000, page: 1 });

      const subscriptionsWithoutUserPlan = subscriptions.subscriptions.filter(subscription => {
        return !userPlans.data.some(userPlan => userPlan.pagbank_subscriber_id === subscription.id);
      });

      for (const userPlan of userPlans.data) {
        const subscription = subscriptions.subscriptions.find(
          subscription => subscription.id == userPlan.pagbank_subscriber_id
        );

        /* 
         1°- Plano do usuário vindo do banco é obrigatório ter um plano vindo do Pagbank
         */
        if (!subscription) {
          await this.userPlansService.update(userPlan.id, {
            status: UserPlanStatusSchema.Enum.INACTIVE,
            is_active: false,
            next_invoice_at: null,
          });
          await this.discordLogService.cron({
            title: 'Plano não encontrado',
            message: `Plano do usuário não encontrado no Pagbank
            UserPlan ID: ${userPlan.id}
            UserPlan User ID: ${userPlan.user_id}
            UserPlan Plan ID: ${userPlan.plan_id}
            UserPlan Status: ${userPlan.status}
            pagbank_subscriber_id: ${userPlan.pagbank_subscriber_id}`,
          });
          continue;
        }

        if (
          subscription.status != userPlan.status ||
          (subscription.status != UserPlanStatusSchema.Enum.ACTIVE && !!userPlan.is_active) ||
          (subscription.status == UserPlanStatusSchema.Enum.ACTIVE && !userPlan.is_active)
        ) {
          /*
           2°- Se o plano atual do usuário for diferente do status da assinatura
           e a assinatura for ativa, atualiza o status do plano para ativo caso o plano esteje desativo ou em teste
          */
          if (
            subscription.status == UserPlanStatusSchema.Enum.ACTIVE &&
            (userPlan.status != UserPlanStatusSchema.Enum.ACTIVE || !userPlan.is_active)
          ) {
            await this.userPlansService.update(userPlan.id, {
              status: UserPlanStatusSchema.Enum.ACTIVE,
              is_active: true,
              next_invoice_at: subscription.next_invoice_at,
            });

            await this.discordLogService.cron({
              title: `Plano do usuário atualizado para ${subscription.status}`,
              message: `Plano do usuário estava ${userPlan.status}, is_active: ${userPlan.is_active}, foi atualizado para ${subscription.status}
              UserPlan ID: ${userPlan.id}
              UserPlan User ID: ${userPlan.user_id}
              Plan ID: ${userPlan.plan_id}
              UserPlan Status: ${userPlan.status}
              pagbank_subscriber_id: ${userPlan.pagbank_subscriber_id}`,
            });

            /**
             * 3°- Se o plano do usuário não estiver ativo e a assinatura for ativa
             */
          } else if (!userPlan.is_active && subscription.status == UserPlanStatusSchema.Enum.ACTIVE) {
            await this.userPlansService.update(userPlan.id, {
              status: UserPlanStatusSchema.Enum.ACTIVE,
              is_active: true,
              next_invoice_at: subscription.next_invoice_at,
            });

            await this.discordLogService.cron({
              title: `Plano do usuário atualizado para ${subscription.status}`,
              message: `Plano do usuário estava **invativo** ${userPlan.status}, foi atualizado para **ativo** ${subscription.status}
              UserPlan ID: ${userPlan.id}
              UserPlan User ID: ${userPlan.user_id}
              Plan ID: ${userPlan.plan_id}
              UserPlan Status: ${userPlan.status}
              pagbank_subscriber_id: ${userPlan.pagbank_subscriber_id}`,
            });

            /* 
           4°- Se o plano do usuário não estiver ativo e não tiver no periodo de teste
           O pagamento não está ocorrendo, assim o plano do usuário é desativado e atualizado com o status do pagbank
          */
          } else if (subscription.status == UserPlanStatusSchema.Enum.CANCELED && !!userPlan.is_active) {
            await this.userPlansService.update(userPlan.id, {
              status: UserPlanStatusSchema.Enum.CANCELED,
              is_active: false,
              next_invoice_at: subscription.next_invoice_at,
            });

            await this.discordLogService.cron({
              title: `Plano do usuário atualizado para ${subscription.status}`,
              message: `Plano do usuário estava **ativo** ${userPlan.status}, foi atualizado para **inativo** ${subscription.status}
              UserPlan ID: ${userPlan.id}
              UserPlan User ID: ${userPlan.user_id}
              UserPlan Plan ID: ${userPlan.plan_id}
              UserPlan Status: ${userPlan.status}
              pagbank_subscriber_id: ${userPlan.pagbank_subscriber_id}`,
            });
          }
        }
      }

      for (const subscription of subscriptionsWithoutUserPlan) {
        if (subscription.status === UserPlanStatusSchema.Enum.ACTIVE) {
          await this.discordLogService.cron({
            title: 'Assinatura Ativa sem Plano de Usuário',
            message: `Encontrada assinatura ativa no Pagbank sem vínculo com usuário no sistema.
                Subscription Reference ID: ${subscription.reference_id}
                Subscription Plan ID:
                Subscription ID: ${subscription.id}
                Customer ID: ${subscription.customer?.id}
                Customer Name: ${subscription.customer?.name}
                Customer Email: ${subscription.customer?.email}
                Status: ${subscription.status}
                Next Invoice: ${subscription.next_invoice_at}`,
          });
        }
      }

      console.log('feito', new Date().toISOString());
    } catch (error) {
      console.log(error);
      error.title = 'Erro ao processar assinaturas no Pagbank';
      await this.discordLogService.cron(error).catch(async e => {
        e.title = 'Erro ao enviar log de assinaturas no Pagbank';
        await this.discordLogService.cron(e).catch(() => {
          console.log('Erro ao enviar log de assinaturas no Pagbank', e);
        });
      });
    }
  }
}
