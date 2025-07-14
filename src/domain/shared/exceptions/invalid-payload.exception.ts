import { Exception } from '@/infra/shared/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidPayloadException extends Exception {
  constructor(internalMessage: string = 'Invalid payload data', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Payload inválido!', HttpStatus.BAD_REQUEST, context);
    this.name = InvalidPayloadException.name;
  }
}
