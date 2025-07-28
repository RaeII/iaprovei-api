import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidLoginFormatException extends Exception {
  constructor(internalMessage: string = 'Invalid login format', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Formato para login não informado ou inválido.', HttpStatus.BAD_REQUEST, context);
    this.name = InvalidLoginFormatException.name;
  }
}
