import { Exception } from '@/infra/shared/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class EmptyBodyException extends Exception {
  constructor(internalMessage: string = 'Request body is empty', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Requisição vazia encontrada', HttpStatus.BAD_REQUEST, context);
    this.name = EmptyBodyException.name;
  }
}
