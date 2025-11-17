import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class EmailCreateErrorException extends Exception {
  constructor(internalMessage: string = 'Error creating security code', extenalMessage?: string, context?: string) {
    super(
      internalMessage,
      extenalMessage || 'Houve um erro ao criar o código de segurança.',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context
    );
    this.name = EmailCreateErrorException.name;
  }
}
