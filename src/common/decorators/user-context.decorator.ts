import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextService } from '../../shared/services/user-context.service';

/**
 * Decorator to inject user context (with admin status) into controller methods
 * Usage: @UserContext() userContext: UserContext
 */
export const UserContext = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const userContextService = new UserContextService(request.app.get('AuthService'));
  return await userContextService.getUserContext(request);
});

/**
 * Decorator to inject basic user info (without admin check) into controller methods
 * Usage: @BasicUserInfo() userInfo: { user_id: number; username: string }
 */
export const BasicUserInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const userContextService = new UserContextService(request.app.get('AuthService'));
  return userContextService.getBasicUserInfo(request);
});

/**
 * Decorator to ensure the current user is admin
 * Usage: @RequireAdmin() (will throw error if user is not admin)
 */
export const RequireAdmin = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const userContextService = new UserContextService(request.app.get('AuthService'));
  await userContextService.requireAdmin(request);
  return undefined; // This decorator is used for its side effect (throwing error if not admin)
});
