import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidRefreshTokenException extends Exception {
  constructor(internalMessage: string = 'Invalid refresh token', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Refresh token inválido.', HttpStatus.UNAUTHORIZED, context);
    this.name = InvalidRefreshTokenException.name;
  }
}
