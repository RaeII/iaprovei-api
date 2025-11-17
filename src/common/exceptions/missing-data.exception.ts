import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class MissingDataException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(
      `Required data missing: ${internalMessage}`,
      extenalMessage || `O dado "${internalMessage}" não foi informado!`,
      HttpStatus.BAD_REQUEST,
      context
    );
    this.name = MissingDataException.name;
  }
}
