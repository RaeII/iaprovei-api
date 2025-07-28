import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class EmailCodeExpiredException extends Exception {
  constructor(internalMessage: string = 'Email verification code has expired', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Código de email expirado.', HttpStatus.GONE, context);
    this.name = EmailCodeExpiredException.name;
  }
}
