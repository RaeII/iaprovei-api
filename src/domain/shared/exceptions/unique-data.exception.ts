import { HttpStatus } from '@nestjs/common';
import { Exception } from '@/infra/shared/exceptions/exception';

export class UniqueDataException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(`${internalMessage} already exists`, `${extenalMessage} já está em uso`, HttpStatus.CONFLICT, context);
    this.name = UniqueDataException.name;
  }
}
