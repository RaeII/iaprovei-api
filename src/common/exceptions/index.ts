// Base exceptions
export { DataNotFoundException } from './data-not-found.exception';
export { DomainException } from './domain.exception';
export { InvalidLinkException } from './invalid-link.exception';
export { UniqueDataException } from './unique-data.exception';

// Request validation exceptions (400 BAD_REQUEST)
export { EmptyBodyException } from './empty-body.exception';
export { MissingFieldException } from './missing-field.exception';
export { MissingDataException } from './missing-data.exception';
export { InvalidPayloadException } from './invalid-payload.exception';
export { InvalidBase64ImageException } from './invalid-base64-image.exception';
export { MissingDataUriSchemaException } from './missing-data-uri-schema.exception';
export { InvalidUsernameCharactersException } from './invalid-username-characters.exception';
export { InvalidJoinCodeException } from './invalid-join-code.exception';
export { InvalidLoginFormatException } from './invalid-login-format.exception';
export { InvalidEmailCodeException } from './invalid-email-code.exception';
export { MissingValidationCodeException } from './missing-validation-code.exception';

// Authentication exceptions (401 UNAUTHORIZED)
export { RefreshTokenNotFoundException } from './refresh-token-not-found.exception';
export { InvalidRefreshTokenException } from './invalid-refresh-token.exception';

// Authorization exceptions (403 FORBIDDEN)
export { SolicitedRegistryNotYoursException } from './solicited-registry-not-yours.exception';
export { UserActionNotPermittedException } from './user-action-not-permitted.exception';

// Not found exceptions (404 NOT_FOUND)
export { RegistryNotFoundException } from './registry-not-found.exception';

// Expired content exceptions (410 GONE)
export { EmailCodeExpiredException } from './email-code-expired.exception';

// Server error exceptions (500 INTERNAL_SERVER_ERROR)
export { MisconfiguredServiceException } from './misconfigured-service.exception';
export { EmailCreateErrorException } from './email-create-error.exception';
export { ErrorSendingException } from './error-sending.exception';
export { ValidationCheckCodeErrorException } from './validation-check-code-error.exception';

// Not implemented exceptions (501 NOT_IMPLEMENTED)
export { FeatureNotImplementedException } from './feature-not-implemented.exception';
