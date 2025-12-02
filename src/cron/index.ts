import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentsCron } from './payments/payments.cron';
import { PagbankModule } from '@/modules/pagbank/pagbank.module';
import { UserPlansModule } from '@/modules/user_plans/user_plans.module';
import { DiscordLogService } from '@/shared/services/discord-log.service';

@Module({
  imports: [ScheduleModule.forRoot(), PagbankModule, UserPlansModule],
  providers: [PaymentsCron, DiscordLogService],
})
export class CronModule {}
