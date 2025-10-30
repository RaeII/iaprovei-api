import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@/entities/user.entity';
import { Plan } from '@/entities/plan.entity';
import { UserPlan as UserPlanType } from '@/modules/user_plans/schemas/user_plan.schema';

export enum UserPlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
}

@Entity('user_plans')
export class UserPlan implements UserPlanType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'plan_id' })
  plan_id: number;

  @Column({
    type: 'enum',
    enum: UserPlanStatus,
    nullable: true,
  })
  status?: UserPlanStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Plan, { eager: false })
  @JoinColumn({ name: 'plan_id' })
  plan?: Plan;
}
