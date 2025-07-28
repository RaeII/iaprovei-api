import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class MissingValidationCodeException extends Exception {
  constructor(internalMessage: string = 'Validation code not provided', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Código para validação não encontrado.', HttpStatus.BAD_REQUEST, context);
    this.name = MissingValidationCodeException.name;
  }
}
