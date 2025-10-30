import { Injectable, Inject } from '@nestjs/common';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import { BadRequestException } from '@nestjs/common';
import { IUserLookupService } from '@/shared/contracts/user-lookup.contract';
import { IPlanLookupService } from '@/shared/contracts/plan-lookup.contract';
import { IUserPlanLookupService } from '@/shared/contracts/user-plan-lookup.contract';
import { UserBasicInfo } from '@/modules/user/schemas/user.schema';

@Injectable()
export class UserPlansValidator {
  constructor(
    @Inject('IUserLookupService') private userLookupService: IUserLookupService,
    @Inject('IPlanLookupService') private planLookupService: IPlanLookupService,
    @Inject('IUserPlanLookupService') private userPlanLookupService: IUserPlanLookupService
  ) {}

  async assertUserPlanExists(userPlanId: number): Promise<void> {
    const userPlan = await this.userPlanLookupService.findUserPlanById(userPlanId);
    if (!userPlan) {
      throw new DataNotFoundException(`UserPlan with id "${userPlanId}"`, 'Plano do usuário', UserPlansValidator.name);
    }
  }

  async assertUserExists(userId: number): Promise<void> {
    const user = await this.userLookupService.findActiveUserById(userId);
    if (!user) {
      throw new DataNotFoundException(`User with id "${userId}"`, 'Usuário', UserPlansValidator.name);
    }
    if (!user.is_active) {
      throw new BadRequestException('Usuário não está ativo');
    }
  }

  async assertPlanExists(planId: number): Promise<void> {
    const plan = await this.planLookupService.findActivePlanById(planId);
    if (!plan) {
      throw new DataNotFoundException(`Plan with id "${planId}"`, 'Plano', UserPlansValidator.name);
    }
    if (!plan.is_active) {
      throw new BadRequestException('Plano não está ativo');
    }
  }

  async assertUserPlanDoesNotExist(userId: number, planId: number): Promise<void> {
    const existingUserPlan = await this.userPlanLookupService.findUserPlanByUserAndPlan(userId, planId);
    if (existingUserPlan) {
      throw new BadRequestException('Usuário já possui este plano');
    }
  }

  async assertIsOwnerOrAdmin(userPlanId: number, currentUser: UserBasicInfo): Promise<void> {
    const userPlan = await this.userPlanLookupService.findUserPlanById(userPlanId);
    if (!userPlan) {
      throw new DataNotFoundException(`UserPlan with id "${userPlanId}"`, 'Plano do usuário', UserPlansValidator.name);
    }

    // Allow if user is the owner of the user plan
    if (userPlan.user_id !== currentUser.id) {
      throw new BadRequestException('Você não tem permissão para acessar este plano');
    }
  }

  async assertCanAccessUserPlans(userId: number, currentUser: UserBasicInfo): Promise<void> {
    // Allow if user is accessing their own plans
    if (userId !== currentUser.id) {
      throw new BadRequestException('Você não tem permissão para acessar os planos deste usuário');
    }
  }
}
