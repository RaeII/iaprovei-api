import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User as UserType } from '@/modules/user/schemas/user.schema';

export enum EducationLevel {
  ENSINO_SUPERIOR = 'ensino_superior',
  ENSINO_MEDIO = 'ensino_medio',
  CURSO_TECNICO = 'curso_tecnico',
  OUTROS = 'outros',
}

export enum StudyPreference {
  VIDEO_AULAS = 'video_aulas',
  LEITURA_MATERIAL = 'leitura_material',
  EXERCICOS_PRATICOS = 'exercicos_praticos',
  RESUMOS = 'resumos',
  FLASHCARDS = 'flashcards',
}

export enum StudyObjective {
  CONCURSO_PUBLICO = 'concurso_publico',
  VESTIBULAR = 'vestibular',
  ENEM = 'enem',
  OAB = 'oab',
  OUTROS = 'outros',
}

export enum WeeklyStudyHours {
  ATE_5H = 'ate_5h',
  CINCO_10H = '5_10h',
  DEZ_20H = '10_20h',
  MAIS_20H = 'mais_20h',
}

export enum LeagueLevel {
  INICIANTE = 'iniciante',
  AVANCADO = 'avançado',
  EXPERT = 'expert',
}

export enum SubscriptionPlan {
  FREE = 'free',
  PLUS = 'plus',
  SUPER = 'super',
}

@Entity('users')
export class User implements UserType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ name: 'password_hash', length: 255, nullable: true })
  password_hash: string;

  @Column({ name: 'full_name', length: 255 })
  full_name: string;

  @Column({ length: 50 })
  username: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 50, nullable: true })
  state: string;

  @Column({
    name: 'education_level',
    type: 'enum',
    enum: EducationLevel,
  })
  education_level: EducationLevel;

  @Column({
    name: 'study_preference',
    type: 'enum',
    enum: StudyPreference,
  })
  study_preference: StudyPreference;

  @Column({
    name: 'study_objective',
    type: 'enum',
    enum: StudyObjective,
  })
  study_objective: StudyObjective;

  @Column({
    name: 'weekly_study_hours',
    type: 'enum',
    enum: WeeklyStudyHours,
  })
  weekly_study_hours: WeeklyStudyHours;

  @Column({ name: 'total_xp', default: 0 })
  total_xp: number;

  @Column({ name: 'current_lives', default: 0 })
  current_lives: number;

  @Column({ name: 'max_lives', default: 0 })
  max_lives: number;

  @Column({ name: 'current_streak', default: 0 })
  current_streak: number;

  @Column({ name: 'best_streak', default: 0 })
  best_streak: number;

  @Column({
    name: 'leage_level',
    type: 'enum',
    enum: LeagueLevel,
    default: LeagueLevel.INICIANTE,
  })
  leage_level: LeagueLevel;

  @Column({
    name: 'subscription_plan',
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  subscription_plan: SubscriptionPlan;

  @Column({ name: 'subscription_expires_at', type: 'timestamp', nullable: true })
  subscription_expires_at: Date;

  @Column({ name: 'referral_code', length: 45, nullable: true })
  referral_code: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  is_active: boolean;

  @Column({ name: 'email_verified', type: 'tinyint', default: 0 })
  email_verified: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  last_login_at: Date;
}
