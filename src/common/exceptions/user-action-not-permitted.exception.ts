import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class UserActionNotPermittedException extends Exception {
  constructor(internalMessage: string = 'User action not permitted', extenalMessage?: string, context?: string) {
    super(
      internalMessage,
      extenalMessage || 'Ação não condiz com nível de permissão do usuário.',
      HttpStatus.FORBIDDEN,
      context
    );
    this.name = UserActionNotPermittedException.name;
  }
}
