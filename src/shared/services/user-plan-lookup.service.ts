import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPlan, UserPlanStatus } from '../../entities/user_plan.entity';
import { IUserPlanLookupService } from '../contracts/user-plan-lookup.contract';

@Injectable()
export class SharedUserPlanLookupService implements IUserPlanLookupService {
  constructor(
    @InjectRepository(UserPlan)
    private userPlanRepository: Repository<UserPlan>
  ) {}

  async findUserPlanById(
    userPlanId: number
  ): Promise<{ id: number; user_id: number; plan_id: number; status?: string } | null> {
    const userPlan = await this.userPlanRepository.findOne({
      where: { id: userPlanId },
      select: { id: true, user_id: true, plan_id: true, status: true },
    });

    return userPlan;
  }

  async findActiveUserPlansByUserId(userId: number): Promise<{ id: number; plan_id: number; status?: string }[]> {
    const userPlans = await this.userPlanRepository.find({
      where: { user_id: userId, status: UserPlanStatus.ACTIVE },
      select: { id: true, plan_id: true, status: true },
    });

    return userPlans;
  }

  async findUserPlanByUserAndPlan(userId: number, planId: number): Promise<{ id: number; status?: string } | null> {
    const userPlan = await this.userPlanRepository.findOne({
      where: { user_id: userId, plan_id: planId },
      select: { id: true, status: true },
    });

    return userPlan;
  }
}
