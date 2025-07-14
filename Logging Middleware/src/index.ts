/**
 * Main entry point for the Logging Middleware package
 * Exports all necessary functions and types for Affordmed evaluation
 */

// Export main logging function
export { Log, initializeLogger, getLogger } from "./logger";

// Export convenience logging functions
export { logDebug, logInfo, logWarn, logError, logFatal } from "./logger";

// Export Logger class
export { Logger } from "./logger";

// Export authentication utilities
export {
  AuthService,
  createRegistrationRequest,
  createAuthCredentials,
} from "./auth";

// Export validation utilities
export {
  validateLogParameters,
  normalizeValue,
  isValidStack,
  isValidLevel,
  isValidPackage,
  isValidPackageForStack,
} from "./validator";

// Export all types
export type {
  Stack,
  Level,
  Package,
  BackendPackage,
  FrontendPackage,
  SharedPackage,
  LogRequest,
  LogResponse,
  AuthCredentials,
  AuthResponse,
  RegistrationRequest,
  RegistrationResponse,
  LoggerConfig,
  ValidationResult,
} from "./types";

// Default export for convenience
export { Logger as default } from "./logger";
