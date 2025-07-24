import { Exception } from '@/infra/shared/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class CustomForbiddenException extends Exception {
  constructor(resource: string, context?: string) {
    super(`You are not allowed to access this resource: ${resource}`, `Você não tem permissão para acessar este recurso.`, HttpStatus.FORBIDDEN, context);
    this.name = CustomForbiddenException.name;
  }
}
