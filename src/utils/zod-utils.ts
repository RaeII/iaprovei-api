import { ZodError } from 'zod';

export class ZodUtils {
  static formatZodError(error: ZodError): string {
    return error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; \n ');
  }
}
