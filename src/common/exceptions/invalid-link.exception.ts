import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidLinkException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(`Invalid link provided: ${internalMessage}`, extenalMessage || `Link de ${internalMessage} inválido!`, HttpStatus.BAD_REQUEST, context);
    this.name = InvalidLinkException.name;
  }
}
