import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { UserPlan as UserPlanEntity, UserPlanStatus } from '@/entities/user_plan.entity';
import { UserPlansValidator } from '@/modules/user_plans/user_plans.validator';
import { DataNotFoundException } from '@/common/exceptions/data-not-found.exception';
import {
  UserPlanCreate,
  UserPlanUpdate,
  UserPlanListData,
  UserPlanDetail,
  UserPlanQuery,
  UserPlanListDataSchema,
  UserPlanDetailSchema,
} from './schemas/user_plan.schema';
import { Pagination, PaginationMeta } from '@/common/schemas/pagination.schema';
import { createPaginationMeta, generateOffset } from '@/common/utils/query-utils';
import { PlanDetail } from '@/modules/plans/schemas/plan.schema';

type UserPlanPrefixedFields = {
  [K in keyof UserPlanDetail as `user_plan_${Extract<K, string>}`]: UserPlanDetail[K];
};

export type PlanDetailWithUserPlan = PlanDetail & UserPlanPrefixedFields;

@Injectable()
export class UserPlansService {
  constructor(
    @InjectRepository(UserPlanEntity)
    private userPlansRepository: Repository<UserPlanEntity>,
    private userPlansValidator: UserPlansValidator
  ) {}

  // Helper method to get UserPlanListData select fields automatically from schema
  private getUserPlanListSelectFields(): (keyof UserPlanEntity)[] {
    const userPlanListKeys = Object.keys(UserPlanListDataSchema.shape) as (keyof UserPlanEntity)[];
    return userPlanListKeys;
  }

  // Helper method to get UserPlanDetail select fields automatically from schema
  private getUserPlanDetailSelectFields(): (keyof UserPlanEntity)[] {
    const userPlanDetailKeys = Object.keys(UserPlanDetailSchema.shape) as (keyof UserPlanEntity)[];
    return userPlanDetailKeys;
  }

  async create(createUserPlanDto: UserPlanCreate): Promise<UserPlanDetail> {
    await this.userPlansValidator.assertUserExists(createUserPlanDto.user_id);
    await this.userPlansValidator.assertPlanExists(createUserPlanDto.plan_id);
    await this.userPlansValidator.assertUserPlanDoesNotExist(createUserPlanDto.user_id, createUserPlanDto.plan_id);

    console.log('createUserPlanDto create', createUserPlanDto);

    const newUserPlan = this.userPlansRepository.create({
      ...createUserPlanDto,
      status: createUserPlanDto.status || UserPlanStatus.ACTIVE,
    } as Partial<UserPlanEntity>);

    const savedUserPlan = await this.userPlansRepository.save(newUserPlan);

    // Fetch the saved user plan with only UserPlanDetail fields
    return this.findOne(savedUserPlan.id);
  }

  async findAll(
    pagination: Pagination,
    query?: UserPlanQuery
  ): Promise<{ data: UserPlanListData[]; meta: PaginationMeta }> {
    const { page, limit } = pagination;
    const offset = generateOffset(page, limit);

    // Build where conditions based on query
    const where: FindOptionsWhere<UserPlanEntity> = {};

    if (query?.user_id) {
      where.user_id = query.user_id;
    }

    if (query?.plan_id) {
      where.plan_id = query.plan_id;
    }

    if (query?.status) {
      where.status = query.status as UserPlanStatus;
    }

    if (query?.pagbank_subscriber_id) {
      where.pagbank_subscriber_id = query.pagbank_subscriber_id;
    }

    if (query?.pagbank_customer_id) {
      where.pagbank_customer_id = query.pagbank_customer_id;
    }

    if (query?.is_active !== undefined) {
      where.is_active = query.is_active;
    }

    // For date range queries, we'll need to use QueryBuilder for more complex conditions
    const queryBuilder = this.userPlansRepository
      .createQueryBuilder('user_plan')
      .select(this.getUserPlanListSelectFields().map(field => `user_plan.${String(field)}`))
      .where(where);

    // Get total count and paginated results
    const [data, total] = await Promise.all([
      queryBuilder.orderBy('user_plan.created_at', 'DESC').skip(offset).take(limit).getMany(),
      queryBuilder.getCount(),
    ]);

    const meta = createPaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<UserPlanDetail> {
    const userPlan = await this.userPlansRepository.findOne({
      where: { id },
      select: this.getUserPlanDetailSelectFields(),
    });

    if (!userPlan) {
      throw new DataNotFoundException(`UserPlan with id "${id}"`, 'Plano do usuário', UserPlansService.name);
    }

    return userPlan;
  }

  async findOneEager(id: number): Promise<UserPlanEntity> {
    const userPlan = await this.userPlansRepository.findOne({ where: { id } });

    if (!userPlan) {
      throw new DataNotFoundException(`UserPlan with id "${id}"`, 'Plano do usuário', UserPlansService.name);
    }

    return userPlan;
  }

  async findByUserId(userId: number): Promise<UserPlanDetail | null> {
    return this.userPlansRepository.findOne({
      where: { user_id: userId },
      select: this.getUserPlanDetailSelectFields(),
    });
  }

  async findPlanDetailByUserId(userId: number): Promise<PlanDetailWithUserPlan | null> {
    const planSelects = [
      'plan.id as id',
      'plan.id_pagbank as id_pagbank',
      'plan.title as title',
      'plan.description as description',
      'plan.description_topics as description_topics',
      'plan.price as price',
      'plan.is_active as is_active',
      'plan.created_at as created_at',
      'plan.updated_at as updated_at',
    ];

    const userPlanSelects = this.getUserPlanDetailSelectFields().map(field => {
      const column = String(field);
      return `user_plan.${column} as user_plan_${column}`;
    });

    const plan = await this.userPlansRepository
      .createQueryBuilder('user_plan')
      .innerJoin('user_plan.plan', 'plan')
      .select([...planSelects, ...userPlanSelects])
      .where('user_plan.user_id = :userId', { userId })
      .orderBy('user_plan.created_at', 'DESC')
      .getRawOne<PlanDetailWithUserPlan>();

    return plan ?? null;
  }

  async findActiveByUserId(userId: number): Promise<UserPlanListData[]> {
    return this.userPlansRepository.find({
      where: { user_id: userId, is_active: true },
      select: this.getUserPlanListSelectFields(),
      order: { created_at: 'DESC' },
    });
  }

  async findByPlanId(planId: number): Promise<UserPlanListData | null> {
    const data = await this.userPlansRepository.findOne({
      where: { plan_id: planId },
      select: this.getUserPlanListSelectFields(),
      order: { created_at: 'DESC' },
    });

    return data;
  }

  async update(id: number, updateUserPlanDto: UserPlanUpdate): Promise<UserPlanDetail> {
    const userPlan = await this.findOneEager(id);

    // Validate plan_id if it's being updated
    if (updateUserPlanDto.plan_id && updateUserPlanDto.plan_id !== userPlan.plan_id) {
      await this.userPlansValidator.assertPlanExists(updateUserPlanDto.plan_id);
      await this.userPlansValidator.assertUserPlanDoesNotExist(userPlan.user_id, updateUserPlanDto.plan_id);
    }

    Object.assign(userPlan, updateUserPlanDto);

    await this.userPlansRepository.save(userPlan as UserPlanEntity);

    // Return the updated user plan with only UserPlanDetail fields
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userPlansRepository.delete(id);
    if (result.affected === 0) {
      throw new DataNotFoundException(`UserPlan with id "${id}"`, 'Plano do usuário', UserPlansService.name);
    }
  }

  async cancelUserPlan(id: number): Promise<UserPlanDetail> {
    return this.update(id, { status: UserPlanStatus.CANCELLED });
  }

  async activateUserPlan(id: number): Promise<UserPlanDetail> {
    return this.update(id, { status: UserPlanStatus.ACTIVE });
  }

  async deactivateUserPlan(id: number): Promise<UserPlanDetail> {
    return this.update(id, { status: UserPlanStatus.INACTIVE });
  }

  async findByPagbankSubscriberId(subscriberId: string): Promise<UserPlanDetail | null> {
    const userPlan = await this.userPlansRepository.findOne({
      where: { pagbank_subscriber_id: subscriberId },
      select: this.getUserPlanDetailSelectFields(),
    });

    return userPlan || null;
  }

  async findByPagbankCustomerId(customerId: string): Promise<UserPlanListData[]> {
    return this.userPlansRepository.find({
      where: { pagbank_customer_id: customerId },
      select: this.getUserPlanListSelectFields(),
      order: { created_at: 'DESC' },
    });
  }

  async findByPagbankIds(pagbankIds: string[]): Promise<UserPlanListData[]> {
    return this.userPlansRepository.find({
      where: { pagbank_subscriber_id: In(pagbankIds) },
      select: this.getUserPlanListSelectFields(),
      order: { created_at: 'DESC' },
    });
  }

  async updatePagbankIds(id: number, subscriberId?: string, customerId?: string): Promise<UserPlanDetail> {
    const updateData: Partial<UserPlanUpdate> = {};

    if (subscriberId !== undefined) {
      updateData.pagbank_subscriber_id = subscriberId;
    }

    if (customerId !== undefined) {
      updateData.pagbank_customer_id = customerId;
    }

    return this.update(id, updateData);
  }

  async updateTrialDates(id: number, trialStartAt?: Date, trialEndAt?: Date): Promise<UserPlanDetail> {
    const updateData: Partial<UserPlanUpdate> = {};

    if (trialStartAt !== undefined) {
      updateData.trial_start_at = trialStartAt;
    }

    if (trialEndAt !== undefined) {
      updateData.trial_end_at = trialEndAt;
    }

    return this.update(id, updateData);
  }

  async activateUserPlanBoolean(id: number): Promise<UserPlanDetail> {
    return this.update(id, { is_active: true });
  }

  async deactivateUserPlanBoolean(id: number): Promise<UserPlanDetail> {
    return this.update(id, { is_active: false });
  }

  async findActiveUserPlans(pagination: Pagination): Promise<{ data: UserPlanListData[]; meta: PaginationMeta }> {
    const { page, limit } = pagination;
    const offset = generateOffset(page, limit);

    const [data, total] = await this.userPlansRepository.findAndCount({
      where: { is_active: true },
      select: this.getUserPlanListSelectFields(),
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
    });

    const meta = createPaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findInactiveUserPlans(pagination: Pagination): Promise<{ data: UserPlanListData[]; meta: PaginationMeta }> {
    const { page, limit } = pagination;
    const offset = generateOffset(page, limit);

    const [data, total] = await this.userPlansRepository.findAndCount({
      where: { is_active: false },
      select: this.getUserPlanListSelectFields(),
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
    });

    const meta = createPaginationMeta(total, page, limit);

    return { data, meta };
  }

  async hasActivePlan(userId: number): Promise<boolean> {
    const userPlan = await this.userPlansRepository.findOne({
      where: { user_id: userId, is_active: true },
      select: ['is_active'],
    });

    return !!userPlan;
  }
}
