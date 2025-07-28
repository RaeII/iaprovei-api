import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class DataNotFoundException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(`${internalMessage} not found`, `${extenalMessage} não encontrado`, HttpStatus.NOT_FOUND, context);
    this.name = DataNotFoundException.name;
  }
}
