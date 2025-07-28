import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidEmailCodeException extends Exception {
  constructor(internalMessage: string = 'Invalid email verification code', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Código de email não é válido.', HttpStatus.BAD_REQUEST, context);
    this.name = InvalidEmailCodeException.name;
  }
}
