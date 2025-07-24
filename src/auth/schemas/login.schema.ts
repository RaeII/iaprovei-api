import { z } from 'zod';
import { zodToOpenAPI } from 'nestjs-zod';
import { UserCreateSchema, UserMeSchema } from '@/user/schemas/user.schema';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const LoginResponseSchema = z.object({
  id: z.number(),
  access_token: z.string(),
  refresh_token: z.string(),
  user: UserMeSchema,
});
export const RefreshTokenResponseSchema = z.object({
  id: z.number(),
  access_token: z.string(),
});
export const SignupSchema = UserCreateSchema;

export const loginOpenapi: any = zodToOpenAPI(LoginSchema);
export const loginResponseOpenapi: any = zodToOpenAPI(LoginResponseSchema);
export const refreshTokenResponseOpenapi: any = zodToOpenAPI(RefreshTokenResponseSchema);
export const signupOpenapi: any = zodToOpenAPI(UserCreateSchema);

export type Login = z.infer<typeof LoginSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type Signup = z.infer<typeof UserCreateSchema>;
