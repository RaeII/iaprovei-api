# Common Module - User Context Service

## Overview

The `UserContextService` provides a centralized, reusable way to handle user authentication and authorization across the entire API. This follows SOLID principles by separating concerns and providing a single responsibility service.

## Features

- Extract user information from authenticated requests
- Check admin privileges
- Consistent error handling for unauthenticated users
- Performance optimized (basic info vs full context with admin check)

## Usage in Controllers

### 1. Add CommonModule to your feature module

```typescript
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule], // Add this
  // ... other imports
})
export class YourFeatureModule {}
```

### 2. Inject the service in your controller

```typescript
import { UserContextService } from '@/common/services/user-context.service';

@Controller('your-endpoint')
export class YourController {
  constructor(private userContextService: UserContextService) {}
}
```

### 3. Use in controller methods

```typescript
// Get full user context (includes admin check)
@Get()
async findAll(@Req() req: Request) {
  const userContext = await this.userContextService.getUserContext(req);
  // userContext: { user_id: number, username: string, isAdmin: boolean }
  
  if (userContext.isAdmin) {
    // Admin can see all data
    return this.service.findAll();
  } else {
    // Regular user sees only their data
    return this.service.findAllForUser(userContext.user_id);
  }
}

// Get basic user info (faster, no admin check)
@Post()
async create(@Body() dto: CreateDto, @Req() req: Request) {
  const userInfo = this.userContextService.getBasicUserInfo(req);
  // userInfo: { user_id: number, username: string }
  
  return this.service.create(dto, userInfo.user_id);
}

// Require admin access
@Delete(':id')
async delete(@Param('id') id: number, @Req() req: Request) {
  await this.userContextService.requireAdmin(req); // Throws error if not admin
  return this.service.delete(id);
}
```

## Service Methods

### `getUserContext(req: Request): Promise<UserContext>`
- Returns full user context including admin status
- Use when you need to check admin privileges
- Slightly slower due to admin check

### `getBasicUserInfo(req: Request): { user_id: number; username: string }`
- Returns basic user info without admin check
- Faster performance
- Use for operations that don't require admin checking

### `isCurrentUserAdmin(req: Request): Promise<boolean>`
- Checks if current user is admin
- Returns boolean

### `requireAdmin(req: Request): Promise<void>`
- Throws error if user is not admin
- Use for admin-only endpoints

## Admin Role Implementation

Currently, all users are treated as non-admin. To implement admin roles:

1. **Add admin field to User entity:**
```typescript
@Column({ name: 'is_admin', type: 'tinyint', default: 0 })
is_admin: boolean;
```

2. **Update AuthService.isUserAdmin():**
```typescript
async isUserAdmin(userId: number): Promise<boolean> {
  const user = await this.usersService.findOne(userId);
  return user.is_admin;
}
```

## Benefits

- **Single Responsibility**: One service handles all user context logic
- **Reusable**: Use across any controller that needs user info
- **Consistent**: Same error handling and validation everywhere
- **Performance**: Choose between basic info or full context based on needs
- **Extensible**: Easy to add new user context features 