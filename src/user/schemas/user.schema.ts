import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';
import { loginResponseOpenapi } from '@/auth/schemas/login.schema';

// Enum schemas matching the TypeORM enums
export const EducationLevelSchema = z.enum(['ensino_superior', 'ensino_medio', 'curso_tecnico', 'outros']);
export const StudyPreferenceSchema = z.enum(['video_aulas', 'leitura_material', 'exercicos_praticos', 'resumos', 'flashcards']);
export const StudyObjectiveSchema = z.enum(['concurso_publico', 'vestibular', 'enem', 'oab', 'outros']);
export const WeeklyStudyHoursSchema = z.enum(['ate_5h', '5_10h', '10_20h', 'mais_20h']);
export const LeagueLevelSchema = z.enum(['iniciante', 'avançado', 'expert']);
export const SubscriptionPlanSchema = z.enum(['free', 'plus', 'super']);

// Base user schema - complete user entity
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  password_hash: z.string().optional(),
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(1, 'Username is required').max(50),
  phone: z.string().max(20).optional(),
  state: z.string().max(50).optional(),
  education_level: EducationLevelSchema,
  study_preference: StudyPreferenceSchema,
  study_objective: StudyObjectiveSchema,
  weekly_study_hours: WeeklyStudyHoursSchema,
  total_xp: z.number().default(0),
  current_lives: z.number().default(0),
  max_lives: z.number().default(0),
  current_streak: z.number().default(0),
  best_streak: z.number().default(0),
  leage_level: LeagueLevelSchema.default('iniciante'),
  subscription_plan: SubscriptionPlanSchema.default('free'),
  subscription_expires_at: z.date().optional(),
  referral_code: z.string().max(45).optional(),
  reffered_by_user_id: z.number().optional(),
  is_active: z.boolean().default(true),
  email_verified: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
  last_login_at: z.date().optional(),
});

// User identity schema - for user identification
export const UserIdentitySchema = UserSchema.pick({
  id: true,
  username: true,
  email: true,
});

// User credentials schema - for authentication
export const UserCredentialsSchema = UserSchema.pick({
  email: true,
  password_hash: true,
});

// User profile schema - for public profile information
export const UserProfileSchema = UserSchema.pick({
  username: true,
  email: true,
  full_name: true,
  phone: true,
  state: true,
});

// User study preferences schema - for study-related settings
export const UserStudyPreferencesSchema = UserSchema.pick({
  education_level: true,
  study_preference: true,
  study_objective: true,
  weekly_study_hours: true,
});

// User game data schema - for XP, streaks, and lives
export const UserGameDataSchema = UserSchema.pick({
  total_xp: true,
  current_lives: true,
  max_lives: true,
  current_streak: true,
  best_streak: true,
  leage_level: true,
});

// User subscription schema - for subscription-related data
export const UserSubscriptionSchema = UserSchema.pick({
  subscription_plan: true,
  subscription_expires_at: true,
});

// For creating users - excludes auto-generated fields
export const UserCreateSchema = UserSchema.omit({
  id: true,
  total_xp: true,
  current_lives: true,
  max_lives: true,
  current_streak: true,
  best_streak: true,
  leage_level: true,
  subscription_plan: true,
  is_active: true,
  email_verified: true,
  created_at: true,
  updated_at: true,
  last_login_at: true,
})
  .extend({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .omit({ password_hash: true });

// For updating users - all fields optional except required ones
export const UserUpdateSchema = UserSchema.partial()
  .omit({
    id: true,
    created_at: true,
    password_hash: true,
  })
  .extend({
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  });

export const UserListResponseSchema = z.object({
  data: z.array(UserSchema),
});

export const UserDetailResponseSchema = z.object({
  data: UserSchema,
});

// OpenAPI schemas
export const userCreateOpenapi: any = zodToOpenAPI(UserCreateSchema);
export const userUpdateOpenapi: any = zodToOpenAPI(UserUpdateSchema);
export const userResponseOpenapi: any = loginResponseOpenapi;
export const userListResponseOpenapi: any = zodToOpenAPI(UserListResponseSchema);
export const userDetailResponseOpenapi: any = zodToOpenAPI(UserDetailResponseSchema);

// Type exports - inferred from Zod schemas
export type User = z.infer<typeof UserSchema>;
export type UserIdentity = z.infer<typeof UserIdentitySchema>;
export type UserCredentials = z.infer<typeof UserCredentialsSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserStudyPreferences = z.infer<typeof UserStudyPreferencesSchema>;
export type UserGameData = z.infer<typeof UserGameDataSchema>;
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>;
