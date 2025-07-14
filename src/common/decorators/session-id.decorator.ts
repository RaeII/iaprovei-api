import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { v5 as uuidv5 } from 'uuid';

// Namespace for generating session UUIDs (consistent across the application)
const SESSION_UUID_NAMESPACE = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

/**
 * Custom decorator to extract and generate session ID from JWT token
 *
 * Usage: @SessionId() sessionId: string
 *
 * This decorator:
 * 1. Extracts the JWT token from the Authorization header
 * 2. Generates a UUIDv5 based on the JWT token
 * 3. Returns the session ID as a parameter
 *
 * The session ID will be consistent for the same JWT token across requests
 */
export const SessionId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();

  // Extract JWT token from Authorization header
  const authHeader = request.headers.authorization;
  const jwtToken = authHeader?.replace('Bearer ', '') || '';

  if (!jwtToken) {
    throw new Error('JWT token not found in Authorization header');
  }

  // Generate session ID using UUIDv5 from JWT token
  return uuidv5(jwtToken, SESSION_UUID_NAMESPACE);
});
