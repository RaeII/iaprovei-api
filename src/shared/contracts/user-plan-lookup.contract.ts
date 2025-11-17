export interface IUserPlanLookupService {
  findUserPlanById(
    userPlanId: number
  ): Promise<{ id: number; user_id: number; plan_id: number; status?: string } | null>;
  findActiveUserPlansByUserId(userId: number): Promise<{ id: number; plan_id: number; status?: string }[]>;
  findUserPlanByUserAndPlan(userId: number, planId: number): Promise<{ id: number; status?: string } | null>;
}
