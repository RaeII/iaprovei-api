import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPlansController } from './user_plans.controller';
import { UserPlansService } from './user_plans.service';
import { UserPlansValidator } from './user_plans.validator';
import { UserPlan } from '@/entities/user_plan.entity';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPlan]),
    SharedModule,
  ],
  controllers: [UserPlansController],
  providers: [UserPlansService, UserPlansValidator],
  exports: [UserPlansService, UserPlansValidator],
})
export class UserPlansModule {}
