import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
