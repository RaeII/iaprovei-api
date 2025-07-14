import { Exception } from '@/infra/shared/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class MissingDataUriSchemaException extends Exception {
  constructor(internalMessage: string = 'Data URI schema is missing', extenalMessage?: string, context?: string) {
    super(internalMessage, extenalMessage || 'Schema não está presente no arquivo enviado', HttpStatus.BAD_REQUEST, context);
    this.name = MissingDataUriSchemaException.name;
  }
}
