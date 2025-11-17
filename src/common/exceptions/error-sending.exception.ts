import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class ErrorSendingException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(
      `Error sending: ${internalMessage}`,
      extenalMessage || `Erro ao efetuar envio "${internalMessage}".`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      context
    );
    this.name = ErrorSendingException.name;
  }
}
