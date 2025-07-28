import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class RefreshTokenNotFoundException extends Exception {
  constructor(internalMessage: string = 'Refresh token not provided', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Refresh token não informado.', HttpStatus.UNAUTHORIZED, context);
    this.name = RefreshTokenNotFoundException.name;
  }
}
