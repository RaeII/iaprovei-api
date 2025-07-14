import { Exception } from '@/infra/shared/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class MisconfiguredServiceException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(`Service not configured: ${internalMessage}`, extenalMessage || `Serviço não configurado: ${internalMessage}`, HttpStatus.INTERNAL_SERVER_ERROR, context);
    this.name = MisconfiguredServiceException.name;
  }
}
