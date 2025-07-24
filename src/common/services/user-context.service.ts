import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '@/auth/auth.service';
import { UserBasicInfo } from '@/user/schemas/user.schema';

/**
 * UserContextService - Common service for extracting user information from requests
 *
 * This service follows SOLID principles and provides reusable user context functionality
 * across the entire API. It centralizes user authentication checking and admin validation.
 *
 * USAGE EXAMPLES:
 *
 * 1. In any controller constructor:
 *    constructor(private userContextService: UserContextService) {}
 *
 * 2. In controller methods:
 *    // Get full user context with admin status
 *    const userContext = await this.userContextService.getUserContext(req);
 *
 *    // Get basic user info (faster, no admin check)
 *    const userInfo = this.userContextService.getBasicUserInfo(req);
 *
 *    // Check if current user is admin
 *    const isAdmin = await this.userContextService.isCurrentUserAdmin(req);
 *
 *    // Require admin access (throws error if not admin)
 *    await this.userContextService.requireAdmin(req);
 *
 * 3. Using decorators (alternative approach):
 *    import { UserContext, BasicUserInfo } from '@/common/decorators';
 *
 *    async someMethod(@UserContext() userContext: UserContext) {
 *      // userContext contains { user_id, username, isAdmin }
 *    }
 *
 * 4. In module imports:
 *    imports: [CommonModule], // This provides UserContextService
 *
 * Remember to add CommonModule to your feature module imports to use this service!
 */

export interface UserContext {
  user_id: number;
  username: string;
  isAdmin: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: {
    user_id: number;
    username: string;
    [key: string]: any;
  };
}

@Injectable()
export class UserContextService {
  constructor(private authService: AuthService) {}

  /**
   * Extract user information from authenticated request
   * @param req - The authenticated request object
   * @returns Promise<UserContext> - User context with admin status
   * @throws Error if user is not authenticated
   */
  async getUserContext(req: Request): Promise<UserContext> {
    const user = (req as AuthenticatedRequest).user;

    if (!user?.user_id) {
      throw new Error('User not authenticated');
    }

    const isAdmin = await this.authService.isUserAdmin(user.user_id);

    return {
      user_id: user.user_id,
      username: user.username,
      isAdmin,
    };
  }

  /**
   * Extract basic user info without admin check (for performance)
   * @param req - The authenticated request object
   * @returns Basic user info
   * @throws Error if user is not authenticated
   */
  getBasicUserInfo(req: Request): UserBasicInfo {
    const user = (req as AuthenticatedRequest).user;

    if (!user?.user_id) {
      throw new Error('User not authenticated');
    }

    return {
      id: user.user_id,
      username: user.username,
    };
  }

  /**
   * Check if the current user is admin
   * @param req - The authenticated request object
   * @returns Promise<boolean> - True if user is admin
   */
  async isCurrentUserAdmin(req: Request): Promise<boolean> {
    const userInfo = this.getBasicUserInfo(req);
    return this.authService.isUserAdmin(userInfo.id);
  }

  /**
   * Ensure user is admin, throw error if not
   * @param req - The authenticated request object
   * @throws Error if user is not admin
   */
  async requireAdmin(req: Request): Promise<void> {
    const isAdmin = await this.isCurrentUserAdmin(req);
    if (!isAdmin) {
      throw new Error('Admin access required');
    }
  }
}
