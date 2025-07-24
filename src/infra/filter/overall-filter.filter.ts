import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { APP_FILTER } from '@nestjs/core';
import { Exception } from '../shared/exceptions/exception';
import { ZodUtils } from '@/utils/zod-utils';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class OverallFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private getMessageFromHttpException(response: any): string {
    if (typeof response === 'object' && 'message' in response) {
      return response.message as string;
    }
    return response as string;
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof ZodValidationException) {
      return ZodUtils.formatZodError(exception.getZodError());
    } else if (exception instanceof HttpException) {
      return this.getMessageFromHttpException(exception.getResponse());
    } else if (exception instanceof Exception) {
      return exception.getExternalMessage();
    }
    return 'Internal server error';
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    } else if (exception instanceof Exception) {
      return exception.getStatusCode();
    } else if (exception instanceof ZodValidationException) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const logger = new Logger(exception?.constructor?.name || (exception as any)?.getContext() || 'Unknown');
    logger.error(this.getMessage(exception));
    logger.log(exception?.stack);

    const ctx = host.switchToHttp();
    const httpStatus = this.getHttpStatus(exception);

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      message: this.getMessage(exception),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

export const OverallFilterProvider = {
  provide: APP_FILTER,
  useClass: OverallFilter,
};
