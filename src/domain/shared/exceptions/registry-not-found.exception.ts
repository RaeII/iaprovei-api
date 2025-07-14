import { Exception } from '@/infra/shared/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class RegistryNotFoundException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(`Registry not found: ${internalMessage}`, extenalMessage || `Registro de "${internalMessage}" não encontrado.`, HttpStatus.NOT_FOUND, context);
    this.name = RegistryNotFoundException.name;
  }
}
