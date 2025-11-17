import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidUsernameCharactersException extends Exception {
  constructor(internalMessage: string = 'Invalid characters in username', extenalMessage?: string, context?: string) {
    super(
      internalMessage,
      extenalMessage || 'Uso de caracteres especiais não permitido para nome de usuário.',
      HttpStatus.BAD_REQUEST,
      context
    );
    this.name = InvalidUsernameCharactersException.name;
  }
}
