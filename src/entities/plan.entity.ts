import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Plan as PlanType } from '@/modules/plans/schemas/plan.schema';

@Entity('plans')
export class Plan implements PlanType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_pagbank' })
  id_pagbank: string;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'description_topics', type: 'text', nullable: true })
  description_topics: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}
