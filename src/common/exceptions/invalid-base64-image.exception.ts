import { Exception } from '@/common/exceptions/exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidBase64ImageException extends Exception {
  constructor(internalMessage: string, extenalMessage?: string, context?: string) {
    super(
      `Invalid base64 image: ${internalMessage}`,
      extenalMessage || `Não foi possível carregar a imagem de ${internalMessage}, imagem inválida.`,
      HttpStatus.BAD_REQUEST,
      context
    );
    this.name = InvalidBase64ImageException.name;
  }
}
