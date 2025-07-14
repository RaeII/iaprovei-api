import { HttpStatus } from '@nestjs/common';
import { Exception } from '@/infra/shared/exceptions/exception';

export class DomainException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage, HttpStatus.BAD_REQUEST, context);
    this.name = DomainException.name;
  }
}
