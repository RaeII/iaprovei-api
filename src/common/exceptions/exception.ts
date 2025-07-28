export class Exception extends Error {
  constructor(
    private readonly internalMessage: string,
    private readonly extenalMessage?: string,
    private readonly statusCode?: number,
    private readonly context?: string
  ) {
    super(internalMessage);
    this.context = context || '';
    this.internalMessage = internalMessage;
    this.statusCode = statusCode || 500;
    this.extenalMessage = extenalMessage || '';
    this.name = Exception.name;
  }

  getExternalMessage(): string {
    return this.extenalMessage || this.internalMessage;
  }

  getInternalMessage(): string {
    return this.internalMessage;
  }

  getContext(): string {
    return this.context;
  }

  getStatusCode(): number {
    return this.statusCode;
  }
}
