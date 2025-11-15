import { Module } from '@nestjs/common';
import { PagbankController } from './pagbank.controller';
import { PagbankService } from './pagbank.service';
import { SharedModule } from '@/shared/shared.module';
import { PlansModule } from '@/modules/plans/plans.module';
import { UserPlansModule } from '@/modules/user_plans/user_plans.module';
import { DiscordLogService } from '@/shared/services/discord-log.service';

@Module({
  imports: [SharedModule, PlansModule, UserPlansModule],
  controllers: [PagbankController],
  providers: [PagbankService, DiscordLogService],
  exports: [PagbankService],
})
export class PagbankModule {}
