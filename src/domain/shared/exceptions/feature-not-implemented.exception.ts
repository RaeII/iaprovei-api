import { Exception } from '@/infra/shared/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class FeatureNotImplementedException extends Exception {
  constructor(internalMessage: string = 'Feature not implemented yet', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Funcionalidade não implementada ainda.', HttpStatus.NOT_IMPLEMENTED, context);
    this.name = FeatureNotImplementedException.name;
  }
}
