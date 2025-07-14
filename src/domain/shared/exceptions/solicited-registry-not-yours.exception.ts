import { Exception } from '@/infra/shared/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class SolicitedRegistryNotYoursException extends Exception {
  constructor(internalMessage: string = 'Requested registry does not belong to you', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Registro solicitado para operação não pertence ao mesmo.', HttpStatus.FORBIDDEN, context);
    this.name = SolicitedRegistryNotYoursException.name;
  }
}
