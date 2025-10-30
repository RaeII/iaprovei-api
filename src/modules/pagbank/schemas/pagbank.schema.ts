import { zodToOpenAPI } from 'nestjs-zod';
import { z } from 'zod';

// Schema para a resposta de criação de aplicação OAuth2
export const PublicKeysSchema = z.object({
  public_key: z.string(),
  created_at: z.number(),
});

// OpenAPI schemas
export const publicKeysResponseSchema = z.object({
  data: PublicKeysSchema,
});

export const publicKeysResponseOpenapi: any = zodToOpenAPI(publicKeysResponseSchema);

// Type exports
export type PublicKeysResponse = z.infer<typeof publicKeysResponseOpenapi>;
