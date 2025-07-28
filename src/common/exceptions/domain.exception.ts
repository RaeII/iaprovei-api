import { HttpStatus } from '@nestjs/common';
import { Exception } from '@/common/exceptions/exception';

export class DomainException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage, HttpStatus.BAD_REQUEST, context);
    this.name = DomainException.name;
  }
}
