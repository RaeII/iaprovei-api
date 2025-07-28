import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidJoinCodeException extends Exception {
  constructor(internalMessage: string = 'Invalid join code provided', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Código inválido', HttpStatus.BAD_REQUEST, context);
    this.name = InvalidJoinCodeException.name;
  }
}
