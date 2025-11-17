import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class MissingFieldException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(
      `Required field missing: ${internalMessage}`,
      extenalMessage || `O campo "${internalMessage}" não foi informado!`,
      HttpStatus.BAD_REQUEST,
      context
    );
    this.name = MissingFieldException.name;
  }
}
