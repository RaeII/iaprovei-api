import { Exception } from '@/infra/shared/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class ValidationCheckCodeErrorException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(`Error validating code: ${internalMessage}`, extenalMessage || `Erro ao validar código: "${internalMessage}"`, HttpStatus.INTERNAL_SERVER_ERROR, context);
    this.name = ValidationCheckCodeErrorException.name;
  }
}
